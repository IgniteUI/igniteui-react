import { isObject } from './is-object.js';

type Visited = WeakMap<object, WeakSet<object>>;

export function equal<T>(a: unknown, b: T, visited?: Visited): boolean {
  // Early return
  if (Object.is(a, b)) {
    return true;
  }

  if (!isObject(a) || !isObject(b)) {
    return false;
  }

  if (a.constructor !== b.constructor) {
    return false;
  }

  // Track pairs, not objects: failed Set/Map probes must not count as visited.
  const pairs: Visited = visited ?? new WeakMap();
  const pending = pairs.get(a) ?? new WeakSet<object>();

  if (pending.has(b)) {
    return true;
  }

  pairs.set(a, pending.add(b));

  try {
    return compare(a, b, pairs);
  } finally {
    pending.delete(b);
  }
}

function compare(a: object, b: object, visited: Visited): boolean {
  // RegExp
  if (isRegExp(a) && isRegExp(b)) {
    return a.source === b.source && a.flags === b.flags;
  }

  // Map entries iterate as [key, value] arrays.
  if ((a instanceof Map && b instanceof Map) || (a instanceof Set && b instanceof Set)) {
    return a.size === b.size && matchOneToOne(a, b, visited);
  }

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    const length = a.length;

    if (length !== b.length) {
      return false;
    }

    for (let i = 0; i < length; i++) {
      if (!equal(a[i], b[i], visited)) {
        return false;
      }
    }
    return true;
  }

  // toPrimitive; absent on null-prototype objects.
  if (typeof a.valueOf === 'function' && a.valueOf !== Object.prototype.valueOf) {
    return a.valueOf() === b.valueOf();
  }

  // Strings based
  if (typeof a.toString === 'function' && a.toString !== Object.prototype.toString) {
    return a.toString() === b.toString();
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (!Object.hasOwn(b, key)) {
      return false;
    }
  }

  for (const key of aKeys) {
    if (!equal(a[key as keyof typeof a], b[key as keyof typeof b], visited)) {
      return false;
    }
  }

  return true;
}

/** Greedy suffices: `equal` is transitive. */
function matchOneToOne(
  left: Iterable<unknown>,
  right: Iterable<unknown>,
  visited: Visited,
): boolean {
  const pool = [...right];

  for (const a of left) {
    const index = pool.findIndex((b) => equal(a, b, visited));

    if (index < 0) {
      return false;
    }
    pool.splice(index, 1);
  }

  return true;
}

function isRegExp(value: unknown): value is RegExp {
  return value != null && value.constructor === RegExp;
}
