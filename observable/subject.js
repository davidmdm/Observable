const { createSubscriber } = require('./observable');

class Subject {
  constructor() {
    this.listeners = [];
    this.subscriber = createSubscriber({ nextFn: value => this.listeners.forEach(cb => cb(value)) });
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
    this.subscriber.next(value);
  }

  complete() {
    this.subscriber.complete();
  }

  error(e) {
    this.subscriber.error(e);
  }
}

class AsyncSubject extends Subject {
  constructor() {
    super();
  }

  next(value) {
    this.lastValue = value;
  }

  complete() {
    this.subscriber.next(this.lastValue);
    this.subscriber.complete();
  }
}

module.exports = { Subject, AsyncSubject };
