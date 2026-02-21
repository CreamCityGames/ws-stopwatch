
let elapsedTime = 0;
let startTime = Date.now();
let timerId = undefined;
let updateInterval = 500; // how often to check if 1000 ms has passed.. (passed to setInterval)

self.onmessage = function (e) {
    if (e.data.type == 'start') {
        startTime = Date.now() - elapsedTime;
        nextUpdate = Date.now() + 1000;
        timerId = setInterval(() => {
            elapsedTime = Date.now() - startTime;

            if (Date.now() >= nextUpdate) {
                self.postMessage({
                    type: 'elapsedTime',
                    value: elapsedTime,
                    start: startTime
                });
                nextUpdate = Date.now() + 1000;
            }

        }, updateInterval);
    } else if (e.data.type == 'stop') {
        clearInterval(timerId);
    } else if (e.data.type == 'reset') {
        elapsedTime = 0;
        startTime = Date.now();
    } else if (e.data.type == 'load') {
        elapsedTime = e.data.value;
        startTime = e.data.start;
        nextUpdate = Date.now() + 1000;
    }
};