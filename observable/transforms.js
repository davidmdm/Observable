'use strict';

const tap = fn => (value, done) => {
  fn(value);
  done(value);
};

const filter = fn => (value, done) => {
  if (filter(value)) {
    done(value);
  }
};

const delay = ms => (value, done) => {
  setTimeout(done, ms, value);
};

const debounceTime = ms => {
  let timeout;
  let gate = -1;

  return (value, done) => {
    const now = Date.now();
    if (now > gate) {
      gate = now + ms;
      return done(value);
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      done(value);
      gate = Date.now() + ms;
    }, gate - now);
  };
};

const take = j => {
  let i = 0;
  return (value, done) => {
    if (i++ < j) {
      done(value);
    }
  };
};

const map = fn => (value, done) => {
  done(fn(value));
};

const scan = function(fn, seed) {
  let hasSeed = arguments.length > 1;
  return (value, done) => {
    if (!hasSeed) {
      seed = value;
      hasSeed = true;
      return done(value);
    }
    const result = fn(seed, value);
    seed = result;
    done(result);
  };
};

module.exports = {
  tap,
  delay,
  debounceTime,
  take,
  map,
  scan,
};
