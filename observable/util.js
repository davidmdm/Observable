'use strict';

const combine = transforms => {
  return transforms.reduce((prev, next) => {
    return (value, done) =>
      prev(value, result => {
        next(result, done);
      });
  });
};

function createObserver(state) {
  let done = false;
  const { nextFn, completeFn, errorFn } = state;

  const observer = (function*() {
    while (true) {
      const val = yield;
      if (done || state.cancelled) {
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
}

module.exports = { combine, createObserver };
