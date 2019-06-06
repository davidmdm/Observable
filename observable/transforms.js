'use strict';

const tap = fn => (value, next) => {
  fn(value);
  next(value);
};

const filter = fn => (value, next) => {
  if (filter(value)) {
    next(value);
  }
};

const delay = ms => (value, next) => {
  setTimeout(next, ms, value);
};

const debounceTime = ms => {
  let timeout;
  let gate = -1;

  return (value, next) => {
    const now = Date.now();
    if (now > gate) {
      gate = now + ms;
      return next(value);
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      next(value);
      gate = Date.now() + ms;
    }, gate - now);
  };
};

const take = j => {
  let i = 0;
  return (value, next) => {
    if (i++ < j) {
      next(value);
    }
  };
};

const map = fn => (value, next) => {
  next(fn(value));
};

const scan = function(fn, seed) {
  let hasSeed = arguments.length > 1;
  return (value, next) => {
    if (!hasSeed) {
      seed = value;
      hasSeed = true;
      return next(value);
    }
    const result = fn(seed, value);
    seed = result;
    next(result);
  };
};

const mergeMap = fn => (value, next) => {
  const observable = fn(value);
  observable.subscribe(next);
};

const switchMap = fn => {
  let unsubscribe = null;
  return (value, next) => {
    if (unsubscribe) {
      unsubscribe();
    }
    const observable = fn(value);
    const subscription = observable.subscribe(next);
    unsubscribe = subscription.unsubscribe.bind(observable);
  };
};

const exhaustMap = fn => {
  let exhausted = true;
  return (value, next) => {
    if (!exhausted) {
      return;
    }
    exhausted = false;
    const observable = fn(value);
    observable.subscribe({
      next,
      complete: () => {
        exhausted = true;
      },
    });
  };
};

const concatMap = fn => {
  // todo use linked list instead of array
  const queue = [];
  let active = null;

  const startNextActiveObservable = next => {
    active = queue.shift();
    if (!active) {
      return;
    }
    active.subscribe({
      next,
      complete: () => startNextActiveObservable(next),
    });
  };

  return (value, next) => {
    queue.push(fn(value));
    if (!active) {
      startNextActiveObservable(next);
    }
  };
};

module.exports = {
  tap,
  delay,
  debounceTime,
  take,
  map,
  scan,
  mergeMap,
  switchMap,
  exhaustMap,
  concatMap,
};
