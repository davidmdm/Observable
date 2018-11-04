'use strict';

const { combine, createObserver } = require('./util');

class Observable {
  static create(subscribe) {
    return new Observable(subscribe);
  }

  constructor(subscribefn) {
    this.cleanup = [];
    this.subscribefn = subscribefn;
  }

  subscribe(obj) {
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

module.exports = { Observable };
