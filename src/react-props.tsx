//@ts-nocheck

import { type EventName, type Options, createComponent as _createComponent } from '@lit/react';
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
    ? NonNullable<T[K]> extends (...args: any[]) => any
      ? (...args: WithDataContext<Parameters<T[K]>>) => React.JSX.Element
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

type Renderers = Record<string, string>;

interface WrapperOptions<I extends HTMLElement, E extends EventNames, R extends Renderers>
  extends Options<I, E> {
  renderProps?: R;
  moveBackOnDelete?: boolean;
}

export const createComponent = <
  I extends HTMLElement,
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  E extends EventNames = {},
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
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
    return _createComponent({ react: React, tagName, elementClass, events, displayName });
  }

  type Props = ComponentProps<I, E>;

  events ??= {} as E;
  const component = _createComponent({ react: React, tagName, elementClass, events, displayName });

  return React.forwardRef<I, Props>((props, ref) => {
    const listeners = React.useRef(new Map<string, unknown>());
    const elementRef = React.useRef<I | null>(null);
    const projectionParent = React.useRef<WeakRef<HTMLElement> | null>(null);
    const [renderers, setRenderers] = React.useState(new Map<string, unknown>());
    const outProps: Record<string, unknown> = {};
    const portals: Record<string, (e: E) => unknown> = {};

    if (moveBackOnDelete) {
      // https://react.dev/learn/reusing-logic-with-custom-hooks#keep-your-custom-hooks-focused-on-concrete-high-level-use-cases
      // https://stackoverflow.com/questions/53464595/how-to-use-componentwillmount-in-react-hooks ?
      // Empty dependency array so this will only run once after first render.
      React.useLayoutEffect(() => {
        // already too late to save elementRef.current?.parentElement, rely on Elements
        // secondary run (likely dev strict mode), move back to projection:
        const prevParent = projectionParent.current?.deref();
        if (prevParent && prevParent !== elementRef.current.parentElement) {
          prevParent.appendChild(elementRef.current);
          projectionParent.current = null;
        }
        return () => {
          // cleanup **before** component is removed from the DOM
          const creationParent = elementRef.current?.ngElementStrategy?.parentElement?.deref();
          if (creationParent && creationParent !== elementRef.current.parentElement) {
            // move back to original parent
            projectionParent.current = new WeakRef(elementRef.current.parentElement);
            creationParent.appendChild(elementRef.current);
          }
        };
      }, []);
    }

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

    if (renderProps) {
      for (const key of listeners.current.keys()) {
        if (props[key] === undefined) {
          listeners.current.delete(key);
        }
      }
    }

    renderProps ??= {};
    for (const prop in props) {
      const renderProp = renderProps[prop];
      if (renderProp === undefined) {
        outProps[prop] = props[prop];
      } else {
        portals[renderProp] = props[prop];

        if (elementRef.current && listeners.current.has(prop)) {
          outProps[prop] = listeners.current.get(prop);
        } else {
          const patched = createPatched(renderFunc, renderProp);
          outProps[prop] = patched;
          listeners.current.set(prop, patched);
        }
      }
    }

    if (listeners.current.size) {
      Object.assign(outProps, {
        children: [...React.Children.toArray(props.children), ...renderers.values()],
      });
    } else {
      Object.assign(outProps, {
        children: React.Children.toArray(props.children),
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

function createPatched(callback: any, propertyName: string) {
  return (ctx: unknown) => html`${requestRenderer(callback, propertyName, ctx)}`;
}
