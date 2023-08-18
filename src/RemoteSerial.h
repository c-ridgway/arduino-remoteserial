/*
  Created by NoM (Chris).

  You're welcome to do or use this code for whatever purpose you desire.
*/
#ifndef REMOTE_SERIAL_H
#define REMOTE_SERIAL_H

#include <Arduino.h>
#include <HTTPClient.h>
#include <vector>

class RemoteSerialClass {
private:
  String url;
  time_t lastFlushed;
  time_t flushInterval;
  time_t failFlushInterval;
  HTTPClient http;
  std::vector<String> queue;
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

    println("[clear]");
  }

  void tick() {
    if (clock() - lastFlushed > lastFailed? failFlushInterval: flushInterval) {
      lastFlushed = clock();

      flush();
    }
  }

  bool send(String payload) {
    bool result = false;
    int httpResponseCode;

    http.begin(url);
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    httpResponseCode = http.POST(payload);

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
      String payload = queue.front();

      if (send(payload)) {
        queue.erase(queue.begin());
      }
    }
  }

  template<typename T>
  void println(const T& value) {
    queue.push_back(String(value));
    //Serial.println(std::to_string(value).c_str());
  }
};

#if !defined(NO_GLOBAL_INSTANCES) && !defined(NO_GLOBAL_ARDUINOOTA)
  extern RemoteSerialClass RemoteSerial;
  inline RemoteSerialClass RemoteSerial;
#endif

#endif
