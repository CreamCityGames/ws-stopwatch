// OBS websocket connection information
const connectionDetails = {
    url: 'ws://127.0.0.1:4455', // Replace with your OBS IP and port
    password: ''  // Replace with your OBS password
};

// how often to save the timer state to localStorage in milliseconds
let saveInterval = 60000;

// enable debug logging
let debug = false;


// END of user editable stuff..

const myWorker = new Worker('worker.js');
try {

    const obs = new OBSWebSocket();

    // Connect to OBS Studio
    obs.connect(connectionDetails["url"], connectionDetails["password"])
        .then(() => {
            if (debug) {
                console.log('OBS is connected!');
            }
        })
        .catch(err => {
            console.error('Failed to connect to OBS:', err);
        });

    obs.on('VendorEvent', (data) => {
        if (data["eventData"]["message"] == "StopwatchStop") {
            stopTimer();
            if (debug) {
                console.log('StopwatchStop Message Received.');
            }
        } else if (data["eventData"]["message"] == "StopwatchStart") {
            startTimer();
            if (debug) {
                console.log('StopwatchStart Message Received.');
            }
        } else if (data["eventData"]["message"] == "StopwatchReset") {
            resetTimer();
            if (debug) {
                console.log('StopwatchReset Message Received.');
            }
        }
    });

    obs.on('error', (err) => {
        console.error('OBS WebSocket error:', err);
    });
} catch (e) {
    console.error('Error initializing WebSockets:', e);
}

//
let uiData = { h: 0, m: 0, s: 0 };
let nextSaveTime = Date.now() + saveInterval;

let timerData = { elapsed: 0, start: Date.now() };
let timerState = { active: false };

function updateUI() {
    let outputStr = `${uiData.h}`.padStart(2, "0") + ":" + `${uiData.m}`.padStart(2, "0") + ":" + `${uiData.s}`.padStart(2, "0");
    document.querySelector('.stopwatch').innerHTML = outputStr;
}

function updateUIData() {
    let h, m, s;
    h = Math.floor(timerData.elapsed / 3600000);
    m = Math.floor((timerData.elapsed / 3600000 - h) * 60);
    s = Math.floor(((timerData.elapsed / 3600000 - h) * 60 - m) * 60);
    uiData = { h: h, m: m, s: s };
}

myWorker.onmessage = function (e) {
    if (e.data.type === 'elapsedTime') {
        // update our local values
        timerData.elapsed = e.data.value;
        timerData.start = e.data.start;
        // decide when to update localStore
        if (Date.now() >= nextSaveTime) {
            saveTimerData();
            nextSaveTime = Date.now() + saveInterval;
        }
        // schedule UI update..
        updateUIData();
        requestAnimationFrame(updateUI);
    }
}

function startTimer() {
    myWorker.postMessage({ type: 'start' });
    timerState.active = true;
    saveTimerState();
    document.getElementById("paused").classList.add("hidden");
}

function stopTimer() {
    myWorker.postMessage({ type: 'stop' });
    timerState.active = false;
    saveTimerState();
    document.getElementById("paused").classList.remove("hidden");
}

async function resetTimer() {
    myWorker.postMessage({ type: 'reset' });
    timerData.elapsed = 0;
    timerData.start = Date.now();
    updateUIData();
    requestAnimationFrame(updateUI);
    saveTimerData({ available: false });
}

async function saveTimerData({ available = true } = {}) {
    await navigator.locks.request(
        "timerData",
        { ifAvailable: available },
        async (lock) => {
            if (!lock) {
                return;
            }
            localStorage.setItem("timerData", JSON.stringify(timerData));
            if (debug) {
                console.debug("Saved timerData:", timerData);
            }
        }
    );
}

async function saveTimerState() {
    await navigator.locks.request(
        "timerState",
        { ifAvailable: true },
        async (lock) => {
            if (!lock) {
                return;
            }
            localStorage.setItem("timerState", JSON.stringify(timerState));
            if (debug) {
                console.debug("Saved timerState:", timerState);
            }
        }
    );
}

addEventListener("storage", async (e) => {
    if (e.key === 'timerData') {
        timerData = JSON.parse(e.newValue);
        myWorker.postMessage({
            type: 'load',
            value: timerData.elapsed,
            start: timerData.start
        });
        updateUIData();
        requestAnimationFrame(updateUI);
    } else if (e.key === 'timerState') {
        timerState = JSON.parse(e.newValue);
        if (timerState.active) {
            myWorker.postMessage({ type: 'start' });
            document.getElementById("paused").classList.add("hidden");
        } else {
            myWorker.postMessage({ type: 'stop' });
            document.getElementById("paused").classList.remove("hidden");
        }
    }
});

// key handler.. to pause / unpause / reset
document.addEventListener('keydown', function (event) {
    if (event.key == " ") {
        if (timerState.active) {
            stopTimer();
        } else {
            startTimer();
        }
    } else if (event.key == "r") {
        resetTimer();
    }
});

let loadedTimerData = null;
(async () => {
    await navigator.locks.request(
        "timerData",
        { mode: "shared" },
        async (lock) => {
            loadedTimerData = localStorage.getItem("timerData");
            if (loadedTimerData !== null) {
                timerData = JSON.parse(loadedTimerData);
                myWorker.postMessage({
                    type: 'load',
                    value: timerData.elapsed,
                    start: timerData.start
                });
                updateUIData();
                requestAnimationFrame(updateUI);
                if (debug) {
                    console.debug("Loaded timerData:", timerData);
                }
            } else {
                timerData.start = Date.now();
            }
        }
    );
})();

let loadedTimerState = null;
(async () => {
    await navigator.locks.request(
        "timerState",
        { mode: "shared" },
        async (lock) => {
            loadedTimerState = localStorage.getItem("timerState");
            if (loadedTimerState !== null) {
                timerState = JSON.parse(loadedTimerState);
                if (timerState.active) {
                    myWorker.postMessage({ type: 'start' });
                    document.getElementById("paused").classList.add("hidden");
                } else {
                    myWorker.postMessage({ type: 'stop' });
                    document.getElementById("paused").classList.remove("hidden");
                }
            } else {
                startTimer();
            }
        }
    );
})();
