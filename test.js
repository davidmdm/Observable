'use strict';

const { Observable, scan } = require('./observable');

Observable.create(observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.next(4);
  observer.next(5);
  observer.next(6);
})
  .pipe(scan((acc, value) => acc + value, -21))
  .subscribe(console.log);
