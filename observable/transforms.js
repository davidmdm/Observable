'use strict';

const greaterThan = num => (value, done) => {
  if (value > num) {
    done(value);
  }
};

const append = suffix => (value, done) => {
  done(value + suffix);
};

module.exports = { greaterThan, append };
