'use strict';

const { fromEvent, Observable, greaterThan, append, debounceTime, tap, take } = require('./observable');

// const { Observable, fromEvent } = require('rxjs');

const Events = require('events');

const emitter = new Events();

emitter.on('e', () => {
  console.log(emitter.listeners('e').length);
});

setInterval(() => emitter.emit('e'), 1000);

const sub = fromEvent(emitter, 'e').subscribe(() => console.log('Observable received event'));

setTimeout(() => sub.unsubscribe(), 5000);

// Observable.create(observer => {
//   observer.next(5);
//   observer.next(8);
//   observer.next(1);
//   observer.next(4);
//   observer.next(3);
//   observer.next(9);
//   observer.next(0);
//   observer.next(7);

//   observer.complete();

//   observer.next('nothing here will get caught');
//   observer.next(100);
// })
//   .pipe(
//     greaterThan(5),
//     append('!!!')
//   )
//   .subscribe(console.log);

// Observable.create(observer => {
//   let i = 0;
//   setInterval(() => observer.next(i++), 100);
// })
//   .pipe(
//     tap(x => console.log('I am tapped in and i see:', x)),
//     debounceTime(1000),
//     take(3)
//   )
//   .subscribe(console.log);
