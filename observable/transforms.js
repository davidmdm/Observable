'use strict';

const greaterThan = num => (value, done) => {
  if (value > num) {
    done(value);
  }
};

const append = suffix => (value, done) => {
  done(value + suffix);
};

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

module.exports = { greaterThan, append, tap, delay, debounceTime, take };
