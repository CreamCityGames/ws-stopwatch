const obs = new OBSWebSocket();

const connectionDetails = {
    url: 'ws://127.0.0.1:4455', // Replace with your OBS IP and port
    password: ''  // Replace with your OBS password
};

// Connect to OBS Studio
obs.connect(connectionDetails["url"], connectionDetails["password"])
    .then(() => {
        console.log('OBS is connected!');
    })
    .catch(err => {
        console.error('Failed to connect to OBS:', err);
    });

obs.on('ConnectionOpened', () => {
    console.log('WebSocket connection opened.');
});

obs.on('ConnectionClosed', () => {
    console.log('WebSocket connection closed.');
});

obs.on('VendorEvent', (data) => {
    if (data["eventData"]["message"] == "StopwatchStop") {
        console.log('StopwatchStop Message Received.');
        pauseTimer();
    } else if (data["eventData"]["message"] == "StopwatchStart") {
        console.log('StopwatchStart Message Received.');
        startTimer();
    } else if (data["eventData"]["message"] == "StopwatchReset") {
        console.log('StopwatchReset Message Received.');
        resetTimer();
    }
});

obs.on('error', (err) => {
    console.error('OBS WebSocket error:', err);
});

// track total number of seconds passed
let elapsedTime = 0;
// track the current date time so we can use it to track seconds passing..
let startTime = 0;
// track timerId so we can stop it later
let timerId = 0;

function timekeeper() {
    // timers in JS are not guaranteed to run at the exact time, so for accurate time keeping
    // you have to use Date.now() and calculate the elapsed time

    // get the number of milliseconds that have passed since we last started..
    elapsedTime = Date.now() - startTime;

    let h, m, s;
    h = Math.floor(elapsedTime / 1000 / 60 / 60);
    m = Math.floor((elapsedTime / 1000 / 60 / 60 - h) * 60);
    s = Math.floor(((elapsedTime / 1000 / 60 / 60 - h) * 60 - m) * 60);

    if (h <= 9) {
        h = "0" + h;
    }

    if (m <= 9) {
        m = "0" + m;
    }

    if (s <= 9) {
        s = "0" + s;
    }

    document.querySelector('.stopwatch').innerHTML = `${h}:${m}:${s}`;
}

function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerId = setInterval(timekeeper, 500);
    document.getElementById("paused").classList.add("hidden");
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = 0;
    document.getElementById("paused").classList.remove("hidden");
}

function resetTimer() {
    elapsedTime = 0;
    startTime = Date.now();
    timekeeper();
}

// key handler.. to pause / unpause / reset
document.addEventListener('keydown', function (event) {
    if (event.key == " ") {
        if (timerId == 0) {
            startTimer();
        } else {
            pauseTimer();
        }
    } else if (event.key == "r") {
        resetTimer();
    }
});

startTimer();