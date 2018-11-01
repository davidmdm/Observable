'use strict';

const { combine } = require('./util');
const transforms = require('./transforms');

class Observable {
  static create(subscribe) {
    return new Observable(subscribe);
  }

  constructor(subscribefn) {
    this.cleanup = [];
    this.subscribefn = subscribefn;
    this.createObserver = function(state) {
      let done = false;
      const { nextFn, completeFn, errorFn } = state;

      const observer = (function*() {
        while (!done) {
          const val = yield;
          if (state.cancelled) {
            return;
          }
          nextFn(val);
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
    };
  }

  subscribe(obj) {
    const state = {
      errorFn: obj.error,
      nextFn: typeof obj === 'function' ? obj : obj.next,
      completeFn: obj.complete,
      cancelled: false,
    };

    this.subscribefn(this.createObserver(state));

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

const fromEvent = (emitter, event) => {
  return new Observable(function(observer) {
    const listener = x => observer.next(x);
    this.cleanup.push(() => emitter.removeListener(event, listener));
    emitter.on(event, listener);
  });
};

module.exports = { Observable, fromEvent, ...transforms };
