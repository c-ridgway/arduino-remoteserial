# Arduino Library - RemoteSerial

This library allows you to receive messages through a network into a console window.

## Todo

- Make HTTP requests async/non-blocking.

## 1. Install Instructions

1. Go to your project folder.
2. Open or create and open the 'lib' folder.
3. Run the command (ensure you have git installed)

`git clone https://github.com/c-ridgway/arduino-remoteserial.git`


## 2. Open Serial Console

1. Install node.js https://nodejs.org/en/download/current
2. Open the library directory: `lib/arduino-remoteserial/server`
3. Open `start_nodejs_server`

![image](https://github.com/c-ridgway/arduino-remoteserial/assets/74696795/d82ce0a8-bd5d-4280-9229-79c76cd39f2d)



## 3. Setup Code

Insert **your ip address** in to match your server machine, as seen in the above image.

```
// Add to your header section
#include  <RemoteSerial.h>

void  setup() {
  // Url (your ip address), flush interval, flush failure retry
  RemoteSerial.begin("http://192.168.1.108:10000/remoteserial", 100, 1000);
}

void  loop() {
  if (clock() % 1000 == 0) // Once a second
    RemoteSerial.println(clock()); // Send current time

  RemoteSerial.tick();
}
```
![image](https://github.com/c-ridgway/arduino-remoteserial/assets/74696795/928af67f-1904-4b0f-9a9e-4839513955fd)

