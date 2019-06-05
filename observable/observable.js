'use strict';

const { combine } = require('./util');

function createObserver(state) {
  let done = false;
  const { nextFn, completeFn, errorFn } = state;

  const observer = (function*() {
    while (true) {
      const val = yield;
      if (done || state.cancelled) {
        return;
      }
      if (nextFn) nextFn(val);
    }
  })();

  observer.next();

  observer.complete = () => {
    done = true;
    if (completeFn) completeFn();
  };

  observer.error = err => {
    done = true;
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
      const next = observer.next.bind(observer);
      this.subscribe(value => combine(transforms)(value, next));
    });
  }
}

module.exports = { Observable, createObserver };
