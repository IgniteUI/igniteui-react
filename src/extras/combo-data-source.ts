/**
 *   render     ──► latest { source, onError }
 *   ref(combo) ──► after commit: bindComboDataSource(combo, follow(() => latest.source))
 *   ref(null)  ──► dispose()
 */

import type { IgcComboComponent } from 'igniteui-webcomponents';
import {
  bindComboDataSource,
  type ComboDataBinding,
  type ComboDataSource,
  type ComboDataSourceOptions,
} from 'igniteui-webcomponents/extras/combo-data-source';
import { type RefCallback, useCallback, useLayoutEffect, useMemo, useRef } from 'react';

export type {
  ComboDataPage,
  ComboDataRequest,
  ComboDataSource,
  ComboDataSourceOptions,
} from 'igniteui-webcomponents/extras/combo-data-source';

export interface IgrComboDataBinding<T extends object> {
  /** Pass to the `ref` of `IgrCombo`. */
  ref: RefCallback<IgcComboComponent<T>>;
  /** Reloads the first page. */
  refresh: () => Promise<void>;
}

/** Calls the latest `load` and `resolve`, so a new source needs no rebind. */
function follow<T>(current: () => ComboDataSource<T>): ComboDataSource<T> {
  return {
    load: (request, signal) => current().load(request, signal),

    get resolve() {
      const source = current();
      return source.resolve?.bind(source);
    },
  };
}

/**
 * Binds an `IgrCombo` to a server that searches and pages.
 * It owns `data`, `loading` and `totalItemCount`; do not pass them as props.
 *
 * @example
 * ```tsx
 * const cities = useComboDataSource<City>({
 *   load: async ({ searchText, startIndex, count }, signal) => {
 *     const query = `q=${encodeURIComponent(searchText)}&skip=${startIndex}&top=${count}`;
 *     const response = await fetch(`/api/cities?${query}`, { signal });
 *     const { items, total } = await response.json();
 *     return { items, totalCount: total };
 *   },
 * });
 *
 * return <IgrCombo ref={cities.ref} valueKey="id" displayKey="name" />;
 * ```
 */
export function useComboDataSource<T extends object>(
  source: ComboDataSource<T>,
  { debounce, pageSize, loadOnOpen, onError }: ComboDataSourceOptions = {},
): IgrComboDataBinding<T> {
  const latest = useRef({ source, onError });
  const binding = useRef<ComboDataBinding | null>(null);
  const pending = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    latest.current = { source, onError };
  });

  // Options are read once at bind; a change rebinds.
  const ref = useCallback(
    (combo: IgcComboComponent<T> | null) => {
      binding.current?.dispose();
      binding.current = null;
      pending.current = null;

      if (!combo) {
        return;
      }

      // The ref attaches before IgrCombo sets `valueKey` and `value`.
      // Bind after the commit, so the first `resolve` sees them.
      const bind = () => {
        // Detached or attached again meanwhile, e.g. StrictMode.
        if (pending.current !== bind) {
          return;
        }

        const source = follow(() => latest.current.source);
        binding.current = bindComboDataSource(combo, source, {
          debounce,
          pageSize,
          loadOnOpen,
          onError: (error) => latest.current.onError?.(error),
        });
      };

      pending.current = bind;
      queueMicrotask(bind);
    },
    [debounce, pageSize, loadOnOpen],
  );

  const refresh = useCallback(() => binding.current?.refresh() ?? Promise.resolve(), []);

  // Stable, so `useEffect(..., [binding])` does not refresh every render.
  return useMemo(() => ({ ref, refresh }), [ref, refresh]);
}
