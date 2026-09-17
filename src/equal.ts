/** Pairs currently being compared, so a cycle terminates without swallowing real differences. */
type Visited = WeakMap<object, WeakSet<object>>;

export function equal<T>(a: unknown, b: T, visited: Visited = new WeakMap()): boolean {
  // Early return
  if (Object.is(a, b)) return true;

  if (!isObject(a) || !isObject(b)) return false;
  if (a.constructor !== b.constructor) return false;

  // Circular references. This tracks the *pair*, not the two objects separately: the Map and Set
  // comparisons below probe candidates they expect to fail, and marking those objects on their own
  // would make a later comparison of the same pair short circuit to `true`.
  let pending = visited.get(a);
  if (pending?.has(b)) return true;

  if (!pending) {
    pending = new WeakSet();
    visited.set(a, pending);
  }
  pending.add(b);

  try {
    return compare(a, b, visited);
  } finally {
    // Always release the pair, including on the early returns in `compare`.
    pending.delete(b);
  }
}

function compare(a: object, b: object, visited: Visited): boolean {
  // RegExp
  if (isRegExp(a) && isRegExp(b)) return a.source === b.source && a.flags === b.flags;

  // Maps
  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [keyA, valueA] of a.entries()) {
      let found = false;
      for (const [keyB, valueB] of b.entries()) {
        if (equal(keyA, keyB, visited) && equal(valueA, valueB, visited)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  // Sets
  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    for (const valueA of a) {
      let found = false;
      for (const valueB of b) {
        if (equal(valueA, valueB, visited)) {
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    const length = a.length;
    if (length !== b.length) return false;
    for (let i = 0; i < length; i++) {
      if (!equal(a[i], b[i], visited)) return false;
    }
    return true;
  }

  // toPrimitive
  if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
  // Strings based
  if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  for (const key of aKeys) {
    if (!Object.hasOwn(b, key)) return false;
  }

  for (const key of aKeys) {
    if (!equal(a[key as keyof typeof a], b[key as keyof typeof b], visited)) return false;
  }

  return true;
}

function isObject(value: unknown): value is object {
  return value != null && typeof value === 'object';
}

function isRegExp(value: unknown): value is RegExp {
  return value != null && value.constructor === RegExp;
}
