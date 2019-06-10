'use strict';

function createSubscriber(state) {
  let finished = false;
  const { nextFn, completeFn, errorFn } = state;

  const isDone = () => finished || state.cancelled;

  const observer = (function*() {
    while (true) {
      const val = yield;
      if (isDone()) {
        return;
      }
      if (nextFn) nextFn(val);
    }
  })();

  observer.next();

  observer.complete = () => {
    if (isDone()) {
      return;
    }
    finished = true;
    if (completeFn) completeFn();
  };

  observer.error = err => {
    if (isDone()) {
      return;
    }
    finished = true;
    if (errorFn) errorFn(err);
    else console.error(err);
  };

  return observer;
}

class Observable {
  static create(subscribe) {
    return new Observable(subscribe);
  }

  constructor(subscribefn) {
    this.cleanup = [];
    this.subscribefn = subscribefn;
  }

  subscribe(obj = {}) {
    const state = {
      errorFn: obj.error,
      nextFn: typeof obj === 'function' ? obj : obj.next,
      completeFn: obj.complete,
      cancelled: false,
    };

    this.subscribefn(createSubscriber(state));

    return {
      unsubscribe: () => {
        this.cleanup.forEach(cb => cb());
        state.cancelled = true;
      },
    };
  }

  pipe(...transforms) {
    if (transforms.length === 0) {
      return this;
    }
    const pipeline = combine(transforms);
    return new Observable(subscriber => {
      this.subscribe(value =>
        pipeline(value, (err, result) => {
          if (err) {
            return subscriber.error(err);
          }
          subscriber.next(result);
        })
      );
    });
  }
}

function combine(transforms) {
  return transforms.reduce((prev, next) => {
    return (value, done) =>
      prev(value, (err, result) => {
        if (err) {
          return done(err);
        }
        next(result, done);
      });
  });
}

module.exports = { Observable, createSubscriber };
