const { createObserver } = require('./util');

class Subject {
  constructor() {
    this.listeners = [];
    this.observer = createObserver({ nextFn: value => this.listeners.forEach(cb => cb(value)) });
  }

  subscribe(cb) {
    this.listeners.push(cb);
    return () => {
      const idx = this.listeners.indexOf(cb);
      if (idx > -1) {
        this.listeners.splice(idx, 1);
      }
    };
  }

  next(value) {
    this.observer.next(value);
  }

  complete() {
    this.observer.complete();
  }

  error(e) {
    this.observer.error(e);
  }
}

module.exports = { Subject };
