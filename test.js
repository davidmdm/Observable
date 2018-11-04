'use strict';

const { Subject, scan } = require('./observable');

let i = 0;

const subject = new Subject();

setInterval(() => subject.next(i++), 1000);

subject.subscribe(x => console.log('A:', x));

setTimeout(() => subject.subscribe(x => console.log('B:', x)), 3500);

setTimeout(() => subject.complete(), 6500);
