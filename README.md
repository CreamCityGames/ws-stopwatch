# ws-stopwatch
A websocket enabled stopwatch for use with OBS and Advanced Scene Switcher as a browser source.

Used during the Just the tip. Tip-a-Thon.

## Features

 - Start / Stop / Reset via. Websocket
 - Start / Stop / Reset via. OBS Interact (Space key, and r to reset)
 - Stop will pause the timer so it can be resumed.
 - Stopwatch value is saved every minute (configurable) using browser localStorage so it can persist across streams or reboots etc.
 - Uses Web Workers to manage the long running stopwatch process.
 - Uses navigator.locks to sync localStorage access across multiple instances (multiple browser tabs, or multiple OBS sources)
 - Uses requestAnimationFrame for efficient UI updates.
 - Has some configurable timing parameters (saveInterval, updateInterval)


## Install

This is for the install steps
```bash
# Checkout repo
git clone https://github.com/CreamCityGames/ws-stopwatch.git
# cd into checked out repo
cd ws-stopwatch
# install deps
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

**NOTE** - For websockets to work, the WebSocket server must be enabled in OBS.

Web Workers require an actual web server, this project uses http-server to provide one, you can start it with the following command.

### Via pnpm
`pnpm run start`

### Via npm
`npm run start`

Add the server url as a browser source. `http://127.0.0.1:8080`

![OBS Browser Source](/../screenshots/screenshots/stopwatch-source-example.webp?raw=true "OBS Browser Source")

It is recommended to only use a single browser source pointing to the local server. Each new, duplicated browser source is like a new tab, and adds additional overhead, data writes, and syncing. You can do it, but I do NOT recommend it.

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

### Customization / Internals

Inside `app.js` you can edit `saveInterval` if you want to save more / less than every minute, but the more it is saved the more writes there could be etc.
Additionally each new tab or browser instance of the stopwatch, sharing the same localStorage, causes additional writes. So 2 tabs, write 2x a minute. 3 tabs, would write 3 times a minute, because each tab writes once a minute.

Inside `worker.js` you can edit `updateInterval` which controls how often the timing method is run with `setInterval`.

Styles and markup can be customized in `style.css` and `ws-stopwatch.html`.

## Attribution

I wrote this based on https://github.com/Stuyk/obs-stopwatch
