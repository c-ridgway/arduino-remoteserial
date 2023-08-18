# Arduino Library - RemoteSerial

This library allows you to receive messages through a network into a console window.

## 1. Install Instructions

1. Go to your project folder.
2. Open or create and open the 'lib' folder.
3. Run the command (ensure you have git installed)

`git clone https://github.com/c-ridgway/arduino-remoteserial.git`


## 2. Open Serial Console

1. Install node.js https://nodejs.org/en/download/current
2. Open the library directory: `lib/arduino-remoteserial/server`
3. Open `start_nodejs_server`

![image](https://github.com/c-ridgway/arduino-remoteserial/assets/74696795/72ccb0ce-c4ac-409d-9048-891863e73480)


## 3. Setup Code

Find your PC's IPv4 address, start -> cmd -> `ipconfig /all`
![image](https://github.com/c-ridgway/arduino-remoteserial/assets/74696795/e4898085-45cf-4ad6-a854-5082ca249659)


```
// Add to your header section
#include  <RemoteSerial.h>

void  setup() {
  // Url (your ip address), flush interval, flush failure retry
  RemoteSerial.begin("http://192.168.1.108:10000/wifiprint", 100, 1000);
}

void  loop() {
  if (clock() % 1000 == 0) // Once a second
    RemoteSerial.println(clock()); // Send current time

  RemoteSerial.tick();
}
```
