'use strict';

function createObserver(state) {
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

  static of(value) {
    return new Observable(observer => {
      observer.next(value);
      observer.complete();
    });
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

    this.subscribefn(createObserver(state));

    return {
      unsubscribe: () => {
        this.cleanup.forEach(cb => cb());
        state.cancelled = true;
      },
    };
  }

  pipe(...transforms) {
    return new Observable(observer => {
      this.subscribe(value =>
        combine(transforms)(value, (err, result) => {
          if (err) {
            return observer.error(err);
          }
          observer.next(result);
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

module.exports = { Observable, createObserver };
