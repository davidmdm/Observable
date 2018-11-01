'use strict';

class Observable {
  constructor(subscribefn) {
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
    const options = {
      errorFn: obj.error,
      nextFn: typeof obj === 'function' ? obj : obj.next,
      completeFn: obj.complete,
      cancelled: false,
    };

    this.subscribefn(this.createObserver(options));

    return { unsubscribe: () => (options.cancelled = true) };
  }

  pipe(...transforms) {
    return new Observable(observer => {
      this.subscribe(value => {
        const combinedTransform = transforms.reduce((combined, transform) => {
          return (value, done) => combined(value, result => transform(result, done));
        });
        combinedTransform(value, result => observer.next(result));
      });
    });
  }

  static create(subscribe) {
    return new Observable(subscribe);
  }
}

const greaterThan = num => (value, done) => {
  if (value > num) {
    done(value);
  }
};

const append = suffix => (value, done) => {
  done(value + suffix);
};

module.exports = { Observable, greaterThan, append };
