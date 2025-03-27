import { describe, expect, test } from 'vitest';
import { equal } from '../src/equal';

describe('Equal', () => {
  test('String', () => {
    expect(equal('a', 'a')).is.true;
    expect(equal('a', 'aaa')).is.false;
    expect(equal('a', new String('a'))).is.false;
    expect(equal(new String('a'), new String('a'))).is.true;
    expect(equal(new String('a'), new String('b'))).is.false;
  });

  test('Number', () => {
    expect(equal(0, 0)).is.true;
    expect(equal(0, -0)).is.false;
    expect(equal(0, 1)).is.false;
    expect(equal(0, new Number(0))).is.false;
    expect(equal(new Number(0), new Number(0))).is.true;
    expect(equal(new Number(0), new Number(1))).is.false;
    expect(equal(Number.NaN, Number.NaN)).is.true;
    expect(equal(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).is.true;
    expect(equal(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY)).is.false;
  });

  test('ECMA global properties', () => {
    expect(equal(null, null)).is.true;
    expect(equal(undefined, undefined)).is.true;
    expect(equal(null, undefined)).is.false;
  });

  test('Functions', () => {
    const func = () => {};
    class MockObject {}
    class ChildMockObject extends MockObject {}

    expect(equal(equal, equal)).is.true;
    expect(equal(equal, func)).is.false;

    expect(equal(Array, Array)).is.true;
    expect(equal(Array, Set)).is.false;

    expect(equal(MockObject, MockObject)).is.true;
    expect(equal(MockObject, ChildMockObject)).is.false;
  });

  test('RegExpr', () => {
    const [r1, r2, r3, r4] = [/a/, /a/, /a/i, /a+/];

    expect(equal(r1, r2)).is.true;
    expect(equal(r1, r3)).is.false;
    expect(equal(r1, r4)).is.false;
    expect(equal(r3, r4)).is.false;
    expect(equal(r1, 'a')).is.false;
    expect(equal(r1, '/a/')).is.false;
  });

  test('Date', () => {
    const d1 = new Date(2024, 0, 1);
    const d2 = new Date(2024, 0, 1);
    const d3 = new Date();

    expect(equal(d1, d2)).is.true;
    expect(equal(d1, d3)).is.false;
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

    const point3 = { point: { y: 1, x: 1 } };

    expect(equal(user1, user2)).is.true;
    expect(equal(point1, point2)).is.true;
    expect(equal(point1, point3)).is.false;
    expect(equal({ a: 1, b: 1 }, { a: 1, b: '1' })).is.false;
    expect(equal({ a: 1 }, { a: 1, b: 1 })).is.false;
  });

  test('Arrays', () => {
    const arr1 = [1, 2, 3, 4, [1, 1, 1], { a: 1 }];
    const arr2 = [1, 2, 3, 4, [1, 1, 1], { a: 1 }];
    const arr3 = [1, 3, 2, 4, [1, 1, 1]];
    const arr4 = [1, 2, 3];

    expect(equal(arr1, arr2)).is.true;
    expect(equal(arr1, arr3)).is.false;
    expect(equal(arr1, arr4)).is.false;
    expect(equal(arr3, arr4)).is.false;
  });

  test('Sets', () => {
    const set1 = new Set([1, 2, 3]);
    const set2 = new Set([1, 2, 3]);
    const set3 = new Set([1, 2]);
    const set4 = new Set(['a', 'b', 'c']);

    expect(equal(set1, set2)).is.true;
    expect(equal(set1, set3)).is.false;
    expect(equal(set1, set4)).is.false;
    expect(equal(set3, set4)).is.false;
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
        d: 10,
      }),
    );

    expect(equal(map1, map2)).is.true;
    expect(equal(map1, map3)).is.false;
  });
});
