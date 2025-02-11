import { describe, expect, test } from 'vitest';
import { equal } from '../src/equal';

describe('Equal', () => {
  test('String', () => {
    expect(equal('a', 'a')).to.be.true;
    expect(equal('a', 'aaa')).to.be.false;
    expect(equal('a', new String('a'))).to.be.false;
  });

  test('Number', () => {
    expect(equal(0, 0)).to.be.true;
    expect(equal(0, 1)).to.be.false;
    expect(equal(0, new Number(0))).to.be.false;
  });

  test('ECMA global properties', () => {
    expect(equal(Number.NaN, Number.NaN)).to.be.true; // XXX: By design!
    expect(equal(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).to.be.true;
    expect(equal(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY)).to.be.false;

    expect(equal(null, null)).to.be.true;
    expect(equal(undefined, undefined)).to.be.true;
    expect(equal(null, undefined)).to.be.false;
  });

  test('Functions', () => {
    const func = () => {};

    expect(equal(equal, equal)).to.be.true;
    expect(equal(equal, func)).to.be.false;

    expect(equal(Array, Array)).to.be.true;
    expect(equal(Array, Set)).to.be.false;
  });

  test('RegExpr', () => {
    const [r1, r2, r3, r4] = [/a/, /a/, /a/i, /a+/];

    expect(equal(r1, r2)).to.be.true;
    expect(equal(r1, r3)).to.be.false;
    expect(equal(r1, r4)).to.be.false;
    expect(equal(r3, r4)).to.be.false;
    expect(equal(r1, 'a')).to.be.false;
    expect(equal(r1, '/a/')).to.be.false;
  });

  test('Date', () => {
    const d1 = new Date(2024, 0, 1);
    const d2 = new Date(2024, 0, 1);
    const d3 = new Date();

    expect(equal(d1, d2)).to.be.true;
    expect(equal(d1, d3)).to.be.false;
  });

  test('Plain old Javascript objects', () => {
    const user1 = { id: 1, name: '1', active: true };
    const user2 = { name: '1', active: true, id: 1 };

    const point1 = {
      id: 1,
      point: {
        x: 0,
        y: 0,
      },
    };

    const point2 = {
      id: 1,
      point: {
        y: 0,
        x: 0,
      },
    };

    expect(equal(user1, user2)).to.be.true;
    expect(equal(point1, point2)).to.be.true;
    expect(equal({ a: 1, b: 1 }, { a: 1, b: '1' })).to.be.false;
    expect(equal({ a: 1 }, { a: 1, b: 1 })).to.be.false;
  });

  test('Arrays', () => {
    const arr1 = [1, 2, 3, 4, [1, 1, 1], { a: 1 }];
    const arr2 = [1, 2, 3, 4, [1, 1, 1], { a: 1 }];
    const arr3 = [1, 3, 2, 4, [1, 1, 1]];
    const arr4 = [1, 2, 3];

    expect(equal(arr1, arr2)).to.be.true;
    expect(equal(arr1, arr3)).to.be.false;
    expect(equal(arr1, arr4)).to.be.false;
    expect(equal(arr3, arr4)).to.be.false;
  });

  test('Sets', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([1, 2, 3]);
    const set3 = new Set([1, 2]);
    const set4 = new Set(['a', 'b', 'c']);

    expect(equal(set1, set2)).to.be.true;
    expect(equal(set1, set3)).to.be.false;
    expect(equal(set1, set4)).to.be.false;
    expect(equal(set3, set4)).to.be.false;
  });

  test('Maps', () => {
    const map1 = new Map(
      Object.entries({
        a: 1,
        b: 2,
        c: 3,
      }),
    );

    const map2 = new Map(
      Object.entries({
        c: 3,
        b: 2,
        a: 1,
      }),
    );

    const map3 = new Map(
      Object.entries({
        a: 1,
        b: 2,
        c: 5,
      }),
    );

    expect(equal(map1, map2)).to.be.true;
    expect(equal(map1, map3)).to.be.false;
  });
});
