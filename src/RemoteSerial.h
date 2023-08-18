/*
  Created by NoM (Chris).

  You're welcome to do or use this code for whatever purpose you desire.
*/
#ifndef REMOTE_SERIAL_H
#define REMOTE_SERIAL_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <vector>

class RemoteSerialClass {
private:
  struct QueueItem {
    String toJsonKeyValue(String key, String value, bool isEnd = false, bool flagSanitize = false) {
      return "\"" + key + "\": \"" + (flagSanitize? toJsonSanitizedValue(value): value) + "\"" + (isEnd? "": ", ");
    }

    String toJsonSanitizedValue(const String& input) {
      String output;
      output.reserve(input.length());

      for (int i = 0; i < input.length(); i++) {
      switch (input[i]) {
        case '\\': output += "\\\\"; break;
        case '\"': output += "\\\""; break;
        case '\b': output += "\\b";  break;
        case '\f': output += "\\f";  break;
        case '\n': output += "\\n";  break;
        case '\r': output += "\\r";  break;
        case '\t': output += "\\t";  break;
        default:
          if ('\x00' <= input[i] && input[i] <= '\x1f') {
            char buf[7];
            sprintf(buf, "\\u%04x", input[i]);
            output += buf;
          } else {
            output += input[i];
          }
        }
      }

      return output;
    }

  public:
    String payload;
    String handler;

    QueueItem(String payload, String handler): handler(handler), payload(payload) {

    }

    String toJson() {
      //"{\"payload\": \"" + toJsonSanitizedValue(inputString) + "\", \"handler\": \"" + handler + "\"}";
      return "{" + toJsonKeyValue("payload", payload, false, true) + toJsonKeyValue("handler", handler, true) + "}";
    }
  };

  String url;
  time_t lastFlushed;
  time_t flushInterval;
  time_t failFlushInterval;
  HTTPClient http;
  std::vector<QueueItem> queue;
  bool lastFailed;

public:
  RemoteSerialClass(): url(""), lastFlushed(clock() + 5000), lastFailed(false) {

  }

  ~RemoteSerialClass() {

  }

  void begin(String url, time_t flushInterval, time_t failFlushInterval) {
    this->url = url;
    this->flushInterval = flushInterval;
    this->failFlushInterval = failFlushInterval;

    clear();
  }

  void tick() {
    if (clock() - lastFlushed > lastFailed? failFlushInterval: flushInterval) {
      lastFlushed = clock();

      if (WiFi.status() == WL_CONNECTED) {
        flush();
      }
    }
  }

  bool send(QueueItem& queueItem) {
    bool result = false;
    int httpResponseCode;

    http.begin(url);
    //http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    httpResponseCode = http.POST(queueItem.toJson());

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);

      result = true;
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }

    http.end();

    lastFailed = !result;

    return result;
  }

  void flush() {
    if (!queue.empty()) {
      QueueItem queueItem = queue.front();

      if (send(queueItem)) {
        queue.erase(queue.begin());
      }
    }
  }

  template<typename T>
  void println(const T& value) {
    queue.push_back(QueueItem(String(value), "println"));
  }

  template<typename T>
  void print(const T& value) {
    queue.push_back(QueueItem(String(value), "print"));
  }

  template<typename T>
  void cprintln(const T& value) {
    queue.push_back(QueueItem(String(value), "cprintln"));
  }

  template<typename T>
  void cprint(const T& value) {
    queue.push_back(QueueItem(String(value), "cprint"));
  }

  void clear() {
    queue.push_back(QueueItem("", "clear"));
  }

  void shell(String command) {
    queue.push_back(QueueItem(command, "shell"));
  }
};

#if !defined(NO_GLOBAL_INSTANCES) && !defined(NO_GLOBAL_ARDUINOOTA)
  extern RemoteSerialClass RemoteSerial;
  inline RemoteSerialClass RemoteSerial;
#endif

#endif
