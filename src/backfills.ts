const DATA_CONTEXT_PROP = 'dataContext';
let once = false;

/**
 * Creates a proxy around template context data that adds back
 * the `dataContext` prop returning the original data
 */
export function withDataContext(data: unknown) {
  return new Proxy(data as any, {
    get(target, prop, receiver) {
      if (prop === DATA_CONTEXT_PROP) {
        if (!once) {
          once = true;
          console.warn(
            'dataContext is deprecated and template context props are now available as the root object and can be accessed directly',
          );
        }
        // return the original object:
        return target;
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

interface DataContextProp<T> {
  /**
   * @deprecated template context props are now available as the root object and can be accessed directly.
   * E.g. instead of `ctx.dataContext.<prop>` just `ctx.<prop>`
   */
  dataContext: T;
}

export type WithDataContext<T> = T extends [infer F, ...infer R]
  ? [F & DataContextProp<F>, ...WithDataContext<R>]
  : [];
