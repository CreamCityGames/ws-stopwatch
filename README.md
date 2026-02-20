# ws-stopwatch
A websocket enabled stopwatch for use with OBS and Advanced Scene Switcher as a browser source.

Used during the Just the tip. Tip-a-Thon.

## Features

 - Start / Stop / Reset via. Websocket
 - Start / Stop / Reset via. OBS Interact
 - Stop will pause the timer so it can be resumed.

## Install

This is for the install steps
```
git clone https://github.com/CreamCityGames/ws-stopwatch.git
cd ws-stopwatch
npm install
```

### Configure

Edit `app.js` to set websocket address and password.

```
const connectionDetails = {
    url: 'ws://127.0.0.1:4455', // Replace with your OBS IP and port
    password: ''  // Replace with your OBS password
};
```

## Usage

Add the `ws-stopwatch.html` file as a browser source.

![OBS Browser Source](/../screenshots/screenshots/stopwatch-source-example.webp?raw=true "OBS Browser Source")

### Interact

The default key-binds are:

 - Space - Stop / Start
 - r - Reset the stopwatch

![OBS Interact Button](/../screenshots/screenshots/stopwatch-interact-example.webp?raw=true "OBS Interact Button")

### Websocket

This is to document the WS messages / Advanced Scene Switcher side.

 - StopwatchStop
 - StopwatchStart
 - StopwatchReset

![Advanced Scene Switcher Web Socket Event](/../screenshots/screenshots/stopwatch-websocket-example.webp?raw=true "Advanced Scene Switcher Web Socket Event")

## Attribution

I wrote this based on https://github.com/Stuyk/obs-stopwatch
