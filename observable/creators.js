'use strict';

const { Observable } = require('./observable');

const fromEvent = (emitter, event) => {
  return new Observable(function(observer) {
    const listener = x => observer.next(x);
    this.cleanup.push(() => emitter.removeListener(event, listener));
    emitter.on(event, listener);
  });
};

module.exports = { fromEvent };
