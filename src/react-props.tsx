/** biome-ignore-all lint/complexity/noBannedTypes: use `{}` literals */

import { createComponent as _createComponent, type EventName, type Options } from '@lit/react';
import { html } from 'lit';
import type React from 'react';
import { createPortal } from 'react-dom';
import type { WithDataContext } from './backfills.js';
import { REQUEST_REMOVE, type RendererRequest, requestRenderer } from './render-props.js';

export type { EventName } from '@lit/react';

type DistributiveOmit<T, K extends string | number | symbol> = T extends any
  ? K extends keyof T
    ? Omit<T, K>
    : T
  : T;
type PropsWithoutRef<T> = DistributiveOmit<T, 'ref'>;

// A key value map matching React prop names to event names.
type EventNames = Record<string, EventName | string>;

// A map of expected event listener types based on EventNames.
type EventListeners<R extends EventNames> = {
  [K in keyof R]?: R[K] extends EventName ? (e: R[K]['__eventType']) => void : (e: Event) => void;
};

type ElementProps<I> = Partial<Omit<I, keyof HTMLElement>>;

// Acceptable props to the React component.
type ComponentProps<I, E extends EventNames> = Omit<
  React.HTMLAttributes<I>,
  // Prefer type of provided event handler props or those on element over
  // built-in HTMLAttributes
  keyof E | keyof ElementProps<I>
> &
  EventListeners<E> &
  ElementProps<I>;

/** Mapped type to update the render props callback return type */
type WithJsxRenderProps<T, R extends Renderers> = {
  [K in keyof T]: K extends keyof R
    ? NonNullable<T[K]> extends (...args: infer Args) => unknown
      ? (...args: WithDataContext<Args>) => React.ReactNode
      : T[K]
    : T[K];
};

export type ReactWebComponent<
  I extends HTMLElement,
  E extends EventNames,
  R extends Renderers,
> = React.ForwardRefExoticComponent<
  // TODO(augustjk): Remove and use `React.PropsWithoutRef` when
  // https://github.com/preactjs/preact/issues/4124 is fixed.
  PropsWithoutRef<WithJsxRenderProps<ComponentProps<I, E>, R>> & React.RefAttributes<I>
>;

type Renderers = Record<string, unknown>;

interface WrapperOptions<I extends HTMLElement, E extends EventNames, R extends Renderers>
  extends Options<I, E> {
  renderProps?: R;
  moveBackOnDelete?: boolean;
}

export const createComponent = <
  I extends HTMLElement,
  E extends EventNames = {},
  R extends Renderers = {},
>({
  react: React,
  tagName,
  elementClass,
  events,
  displayName,
  renderProps,
  moveBackOnDelete,
}: WrapperOptions<I, E, R>): ReactWebComponent<I, E, R> => {
  // Register our components
  if ('register' in elementClass) {
    (elementClass as { register: () => void }).register();
  }

  if (!renderProps && !moveBackOnDelete) {
    // When R is empty (no renderProps), the component types are equivalent at runtime
    return _createComponent({
      react: React,
      tagName,
      elementClass,
      events,
      displayName,
    }) as unknown as ReactWebComponent<I, E, R>;
  }

  type Props = ComponentProps<I, E>;

  const safeEvents = events ?? ({} as E);
  const component = _createComponent({
    react: React,
    tagName,
    elementClass,
    events: safeEvents,
    displayName,
  });

  type PropsWithRenderProps = WithJsxRenderProps<Props, R>;

  return React.forwardRef<I, PropsWithRenderProps>((props, ref) => {
    const listeners = React.useRef(new Map<string, unknown>());
    const elementRef = React.useRef<I | null>(null);
    const projectionParent = React.useRef<WeakRef<HTMLElement> | null>(null);
    const [renderers, setRenderers] = React.useState(new Map<string, unknown>());
    const outProps: Record<string, unknown> = {};
    const portals: Record<string, (data: unknown) => React.ReactNode> = {};

    // https://react.dev/learn/reusing-logic-with-custom-hooks#keep-your-custom-hooks-focused-on-concrete-high-level-use-cases
    // Runs once after first render to handle element re-parenting for Angular integration.
    React.useLayoutEffect(() => {
      if (!moveBackOnDelete) return;

      // already too late to save elementRef.current?.parentElement, rely on Elements
      // secondary run (likely dev strict mode), move back to projection:
      const prevParent = projectionParent.current?.deref();
      if (prevParent && elementRef.current && prevParent !== elementRef.current.parentElement) {
        prevParent.appendChild(elementRef.current);
        projectionParent.current = null;
      }
      return () => {
        // cleanup **before** component is removed from the DOM
        const element = elementRef.current;
        if (!element) return;

        const creationParent = (
          element as I & { ngElementStrategy?: { parentElement?: WeakRef<HTMLElement> } }
        ).ngElementStrategy?.parentElement?.deref();
        if (creationParent && creationParent !== element.parentElement) {
          // move back to original parent
          if (element.parentElement) {
            projectionParent.current = new WeakRef(element.parentElement);
          }
          creationParent.appendChild(element);
        }
      };
    }, [moveBackOnDelete]);

    // Don't wrap in an `useCallback` hook since there is no mechanism in React to dispose of the cached function(s),
    // potentially leading to a memory leak/higher memory usage for heavily templated component instances.
    const renderFunc = (req: RendererRequest<unknown>) => {
      if (req.data === REQUEST_REMOVE) {
        renderers.delete(req.slotName);
      } else {
        renderers.set(
          req.slotName,
          createPortal(portals[req.name]?.(req.data), req.node, req.slotName),
        );
      }
      setRenderers(() => new Map(renderers));
    };

    const processProps = (
      propMap: Record<string, unknown>,
      propDefinitions: Record<string, unknown>,
      outProps: Record<string, unknown>,
      prefix = '',
    ) => {
      for (const prop in propMap) {
        const fullPropName = prefix ? `${prefix}.${prop}` : prop;
        const rendererName = propDefinitions?.[prop];

        if (rendererName !== undefined && typeof rendererName === 'string') {
          if (listeners.current.has(fullPropName)) {
            outProps[prop] = listeners.current.get(fullPropName);
          } else {
            portals[rendererName] = propMap[prop] as (data: unknown) => React.ReactNode;
            const patched = createPatched(renderFunc, rendererName);
            outProps[prop] = patched;
            listeners.current.set(fullPropName, patched);
          }
        } else if (
          typeof propMap[prop] === 'object' &&
          propMap[prop] !== null &&
          propDefinitions?.[prop] &&
          typeof propDefinitions[prop] === 'object'
        ) {
          outProps[prop] = {};
          processProps(
            propMap[prop] as Record<string, unknown>,
            propDefinitions?.[prop] as Record<string, unknown>,
            outProps[prop] as Record<string, unknown>,
            fullPropName,
          );
        } else {
          outProps[prop] = propMap[prop];
        }
      }
    };

    for (const key of listeners.current.keys()) {
      if (!hasNestedProperty(props, key)) {
        listeners.current.delete(key);
      }
    }

    processProps(props, renderProps ?? {}, outProps);

    const propsWithChildren = props as Props & { children?: React.ReactNode };
    if (listeners.current.size) {
      Object.assign(outProps, {
        children: [...React.Children.toArray(propsWithChildren.children), ...renderers.values()],
      });
    } else {
      Object.assign(outProps, {
        children: React.Children.toArray(propsWithChildren.children),
      });
    }

    return React.createElement(component, {
      ...outProps,
      ref: React.useCallback(
        (node: I) => {
          elementRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref !== null) {
            ref.current = node;
          }
        },
        [ref],
      ),
    } as PropsWithoutRef<ComponentProps<I, E>> & React.RefAttributes<I>);
  });
};

function createPatched(callback: (req: RendererRequest<unknown>) => void, propertyName: string) {
  return (ctx: unknown) => html`${requestRenderer(callback, propertyName, ctx)}`;
}

function hasNestedProperty(object: Record<string, unknown>, path: string): boolean {
  const parts = path.split('.');
  let current: unknown = object;
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return false;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current !== undefined;
}
