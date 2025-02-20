//@ts-nocheck

import { type EventName, type Options, createComponent as _createComponent } from '@lit/react';
import { html } from 'lit';
import type React from 'react';
import { createPortal } from 'react-dom';
import { type SlotRequest, _removeEvent } from './render-event.js';
import { requestRenderer } from './render-props.js';

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
      ? (...args: Parameters<T[K]>) => React.JSX.Element
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
}: WrapperOptions<I, E, R>): ReactWebComponent<I, E, R> => {
  // Register our components
  if ('register' in elementClass) {
    (elementClass as { register: () => void }).register();
  }

  if (!renderProps) {
    return _createComponent({ react: React, tagName, elementClass, events, displayName });
  }

  type Props = ComponentProps<I, E>;

  events ??= {} as E;
  Object.assign(events, { onSlotRequest: 'slot-request' as EventName<SlotRequest> });

  const component = _createComponent({ react: React, tagName, elementClass, events, displayName });

  return React.forwardRef<I, Props>((props, ref) => {
    const listeners = React.useRef(new Map<string, unknown>());
    const elementRef = React.useRef<I | null>(null);
    const [renderers, setRenderers] = React.useState(new Map<string, unknown>());
    const outProps: Record<string, unknown> = {};
    const portals: Record<string, (e: E) => unknown> = {};

    const slotRequestHandler = React.useCallback(
      (event: SlotRequest) => {
        if (event.data === _removeEvent) {
          renderers.delete(event.slotName);
        } else {
          renderers.set(
            event.slotName,
            createPortal(portals[event.name]?.(event.data), event.node, event.slotName),
          );
        }

        setRenderers(() => new Map(renderers));
      },
      [portals, renderers],
    );

    for (const key of listeners.current.keys()) {
      if (props[key] === undefined) {
        listeners.current.delete(key);
      }
    }

    for (const prop in props) {
      if (renderProps[prop] === undefined) {
        outProps[prop] = props[prop];
      } else {
        portals[renderProps[prop]] = props[prop];

        if (elementRef.current && listeners.current.has(prop)) {
          outProps[prop] = listeners.current.get(prop);
        } else {
          const patched = (ctx: unknown) =>
            html`${requestRenderer(renderProps[prop], ctx, elementRef.current as Element)}`;
          outProps[prop] = patched;
          listeners.current.set(prop, patched);
        }
      }
    }

    if (listeners.current.size) {
      Object.assign(outProps, {
        onSlotRequest: slotRequestHandler,
        children: [...React.Children.toArray(props.children), ...renderers.values()],
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
