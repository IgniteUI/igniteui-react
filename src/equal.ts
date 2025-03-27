export function equal<T>(a: unknown, b: T): boolean {
  // Try the base case and return early
  if (Object.is(a, b)) return true;

  // https://en.meming.world/wiki/File:Ah_Shit,_Here_We_Go_Again.jpg/
  if (isObject(a) && isObject(b)) {
    if (a.constructor !== b.constructor) return false;

    let length: number;
    let i: number;
    let keys: string[];

    // Arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      length = a.length;
      if (length !== b.length) return false;
      for (i = length - 1; i !== 0; i--) {
        if (!equal(a[i], b[i])) return false;
      }
      return true;
    }

    // Maps
    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false;
      for (const i of a.entries()) {
        if (!b.has(i[0])) return false;
      }
      for (const i of a.entries()) {
        if (!equal(i[1], b.get(i[0]))) return false;
      }
      return true;
    }

    // Sets
    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false;
      for (const i of a.entries()) {
        if (!b.has(i[0])) return false;
      }
      return true;
    }

    // RegExp
    if (isRegExp(a) && isRegExp(b)) return a.source === b.source && a.flags === b.flags;
    // toPrimitive
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    // Strings based
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length - 1; i !== 0; i--) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    }

    for (i = length - 1; i !== 0; i--) {
      const key = keys[i];
      if (!equal(a[key as keyof typeof a], b[key as keyof typeof b])) return false;
    }
    return true;
  }

  return false;
}

function isObject(value: unknown): value is object {
  return value != null && typeof value === 'object';
}

function isRegExp(value: unknown): value is RegExp {
  return value != null && value.constructor === RegExp;
}
