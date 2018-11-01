'use strict';

const { Observable, greaterThan, append } = require('./observable');

Observable.create(observer => {
  observer.next(5);
  observer.next(8);
  observer.next(1);
  observer.next(4);
  observer.next(3);
  observer.next(9);
  observer.next(0);
  observer.next(7);

  observer.complete();

  observer.next('nothing here will get caught');
  observer.next(100);
})
  .pipe(
    greaterThan(5),
    append('!!!')
  )
  .subscribe(console.log);
