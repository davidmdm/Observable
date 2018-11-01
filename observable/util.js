'use strict';

const combine = transforms => {
  return transforms.reduce((prev, next) => {
    return (value, done) =>
      prev(value, result => {
        next(result, done);
      });
  });
};

module.exports = { combine };
