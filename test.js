'use strict';

const { AsyncSubject, scan } = require('./observable');

let i = 0;

const subject = new AsyncSubject();

setInterval(() => subject.next(i++), 1000);

subject.subscribe(x => console.log('A:', x));

setTimeout(() => subject.subscribe(x => console.log('B:', x)), 3500);

setTimeout(() => subject.complete(), 6500);
