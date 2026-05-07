async function asyncWhile(condition, action) {
    return new Promise((resolve) => {
        function iterate() {
            if (!condition()) {
                resolve();
                return;
            }

            action();
            setTimeout(iterate, 0);
        }

        iterate();
    });
}

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    off(eventName, callback) {
        if (!this.events[eventName]) return;

        if (!callback) {
            delete this.events[eventName];
        } else {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }

    emit(eventName, ...args) {
        if (!this.events[eventName]) return;

        this.events[eventName].forEach(callback => {
            callback(...args);
        });
    }

    once(eventName, callback) {
        const wrapper = (...args) => {
            callback(...args);
            this.off(eventName, wrapper);
        };
        this.on(eventName, wrapper);
    }
}