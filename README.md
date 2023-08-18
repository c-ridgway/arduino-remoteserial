# Arduino Library - RemoteSerial

This library allows you to receive messages through a network into a console window.

## Todo

- Make HTTP requests async/non-blocking.

## Basics

- Server: Receives messages and prints to console.
- Library: Sends the messages from the device to your PC.

## 1. Install Library

1. Go to your project folder.
2. Open or create and open the 'lib' folder.
3. Run the command (ensure you have git installed)

`git clone https://github.com/c-ridgway/arduino-remoteserial.git`


## 2. Start Server

1. Install node.js https://nodejs.org/en/download/current
2. Open the library directory: `lib/arduino-remoteserial/server`
3. Open `start_nodejs_server`

![image](https://github.com/c-ridgway/arduino-remoteserial/assets/74696795/d82ce0a8-bd5d-4280-9229-79c76cd39f2d)



## 3. Example Code

Insert **your ip address** in to match your server machine, as seen in the above image.

I assume you will already be connecting via WIFI. This is the only requirement.

```
// Add to your header section
#include  <RemoteSerial.h>

void  setup() {
  // Url (your ip address), flush interval, flush failure retry delay
  RemoteSerial.begin("http://192.168.1.108:10000/remoteserial", 100, 1000);

  RemoteSerial.clear(); // Completely clear the console
  RemoteSerial.println(clock()); // Send current time on its own line, it'll be sent once the wifi has connected
  RemoteSerial.cprintln("[#13F700]Colour [#F74B00]your text. [#] Or keep it normal."); // Send coloured output, on its own line
  //RemoteSerial.shell("ls"); // Run shell command, must be enabled in server code
}

void  loop() {
  if (clock() % 1000 == 0) // Once a second
    RemoteSerial.print(clock()); // Print without a new line, once a second

  RemoteSerial.tick();
}
```
![image](https://github.com/c-ridgway/arduino-remoteserial/assets/74696795/ddd039b9-4081-438b-b8fd-50e08adae6d2)

