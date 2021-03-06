'use strict';

const { assert } = require('chai');
const { Observable } = require('../observable');
const { of } = require('../observable/creators');
const operators = require('../observable/operators');

describe('Observables', () => {
  describe('Basic cases', () => {
    it('should complete normally', async () => {
      const observable = new Observable(subscriber => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.next(3);
        subscriber.complete();
      });

      const result = [];

      await new Promise(resolve => {
        observable.subscribe({
          next: x => result.push(x),
          complete: resolve,
        });
      });

      assert.deepEqual(result, [1, 2, 3]);
    });

    it('should not error out if it has completed', async () => {
      const observable = new Observable(subscriber => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.complete();
        subscriber.next(3);
        subscriber.error(new Error('test error'));
      });

      const result = [];

      observable.subscribe({
        next: value => result.push(value),
        error: err => result.push(err.message),
        complete: () => result.push('complete'),
      });

      await new Promise(resolve => process.nextTick(resolve));

      assert.deepEqual(result, [1, 2, 'complete']);
    });

    it('should not complete if there is an error', async () => {
      const observable = new Observable(subscriber => {
        subscriber.next(1);
        subscriber.next(2);
        subscriber.error(new Error('test error'));
        subscriber.next(3);
        subscriber.complete();
      });

      const result = [];

      observable.subscribe({
        next: value => result.push(value),
        error: err => result.push(err.message),
        complete: () => result.push('complete'),
      });

      await new Promise(resolve => process.nextTick(resolve));

      assert.deepEqual(result, [1, 2, 'test error']);
    });
  });

  describe('Operators', () => {
    describe('First-Order operators', () => {
      it('should tap and not affect subscription', async () => {
        const { tap } = operators;

        const result = [];
        const tapArray = [];

        new Observable(subscriber => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.complete();
        })
          .pipe(tap(x => tapArray.push(2 * x)))
          .subscribe(x => result.push(x));

        await new Promise(resolve => process.nextTick(resolve));

        assert.deepEqual(result, [1, 2]);
        assert.deepEqual(tapArray, [2, 4]);
      });

      it('should filter', async () => {
        const { tap, filter } = operators;

        const result = [];
        const tapArray = [];

        new Observable(subscriber => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.complete();
        })
          .pipe(
            tap(x => tapArray.push(2 * x)),
            filter(x => x > 1)
          )
          .subscribe(x => result.push(x));

        await new Promise(resolve => process.nextTick(resolve));

        assert.deepEqual(result, [2]);
        assert.deepEqual(tapArray, [2, 4]);
      });

      it('should take the number of values requested', async () => {
        const { take } = operators;

        const result = [];

        new Observable(subscriber => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.next(3);
          subscriber.next(4);
          subscriber.complete();
        })
          .pipe(take(2))
          .subscribe(x => result.push(x));

        await new Promise(resolve => process.nextTick(resolve));

        assert.deepEqual(result, [1, 2]);
      });

      it('should map the result', async () => {
        const { map } = operators;
        const result = [];

        new Observable(subscriber => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.complete();
        })
          .pipe(map(x => 2 * x))
          .subscribe(x => result.push(x));

        await new Promise(resolve => process.nextTick(resolve));

        assert.deepEqual(result, [2, 4]);
      });

      it('should scan (same as a reduce function for arrays)', async () => {
        const { scan } = operators;
        const result = [];

        new Observable(subscriber => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.next(3);
          subscriber.next(4);
          subscriber.complete();
        })
          .pipe(scan((acc, x) => acc + x))
          .subscribe(x => result.push(x));

        await new Promise(resolve => process.nextTick(resolve));

        assert.deepEqual(result, [1, 3, 6, 10]);
      });

      it('should scan with an initial seed (same as a reduce function for arrays)', async () => {
        const { scan } = operators;
        const result = [];

        new Observable(subscriber => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.next(3);
          subscriber.next(4);
          subscriber.complete();
        })
          .pipe(scan((acc, x) => acc + x, -10))
          .subscribe(x => result.push(x));

        await new Promise(resolve => process.nextTick(resolve));

        assert.deepEqual(result, [-9, -7, -4, 0]);
      });

      it('should add a delay to all events', async () => {
        const { delay } = operators;
        const result = [];

        new Observable(subscriber => {
          subscriber.next(1);
          subscriber.next(2);
          subscriber.complete();
        })
          .pipe(delay(5))
          .subscribe(x => result.push(x));

        await new Promise(resolve => process.nextTick(resolve));
        assert.deepEqual(result, []);

        await new Promise(resolve => setTimeout(resolve, 15));
        assert.deepEqual(result, [1, 2]);
      });

      it('should debounce values', async () => {
        const { debounceTime } = operators;
        const result = [];

        new Observable(subscriber => {
          let i = 1;
          const interval = setInterval(() => subscriber.next(i++), 10);
          setTimeout(() => clearInterval(interval), 100);
        })
          .pipe(debounceTime(20))
          .subscribe(x => result.push(x));

        await new Promise(resolve => setTimeout(resolve, 110));

        // It is hard to know at the boundaries which timeout will execute first and which values
        // will be taken, but there should only be half of the values that get through.
        assert.include([4, 5, 6], result.length);
      });

      it('should throttle values', async () => {
        const { throttleTime } = operators;
        const result = [];

        new Observable(subscriber => {
          let i = 1;
          const interval = setInterval(() => subscriber.next(i++), 10);
          setTimeout(() => clearInterval(interval), 50);
        })
          .pipe(throttleTime(35))
          .subscribe(x => result.push(x));

        await new Promise(resolve => setTimeout(resolve, 60));

        assert.include([1, 3], result.length);
      });
    });

    describe('Higher-Order Operators', () => {
      describe('switchmap', () => {
        it('should switch to latest observable discarding values from previous observables', async () => {
          const { switchMap, delay } = operators;

          const result = [];
          new Observable(subscriber => {
            setTimeout(() => subscriber.next(1), 0);
            setTimeout(() => subscriber.next(2), 20);
            setTimeout(() => subscriber.next(3), 40);
          })
            .pipe(switchMap(x => of(x).pipe(delay(50))))
            .subscribe(x => result.push(x));

          await new Promise(resolve => setTimeout(resolve, 100));
          assert.deepEqual(result, [3]);
        });
      });
    });
  });
});
