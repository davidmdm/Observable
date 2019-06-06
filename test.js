'use strict';

const { Observable, mergeMap } = require('./observable');

const genEven = () => {
  const i = Math.floor(8 * Math.random());
  if (i % 2 === 0) {
    return i;
  }
  return i + 1;
};

const genOdd = () => genEven() + 1;

const Even = new Observable(observer => {
  const interval = setInterval(() => observer.next(genEven()), 500);
  setTimeout(() => {
    clearInterval(interval);
    observer.complete();
  }, 10000);
});

const Odd = new Observable(observer => {
  const interval = setInterval(() => observer.next(genOdd(), 500));
  setTimeout(() => {
    clearInterval(interval);
    observer.complete();
  }, 10000);
});

Even.subscribe(console.log);
