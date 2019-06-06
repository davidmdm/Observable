'use strict';

const { Observable } = require('./observable');

const fromEvent = (emitter, event) => {
  return new Observable(function(observer) {
    const listener = x => observer.next(x);
    this.cleanup.push(() => emitter.removeListener(event, listener));
    emitter.on(event, listener);
  });
};

const fromPromise = promise => {
  return new Observable(observer => {
    promise
      .then(value => {
        observer.next(value);
        observer.complete();
      })
      .catch(err => observer.error(err));
  });
};

module.exports = { fromEvent, fromPromise };
