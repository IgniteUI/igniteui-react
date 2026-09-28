/** biome-ignore-all lint/complexity/noBannedTypes: use `{}` literals */

import { createComponent as _createComponent, type EventName, type Options } from '@lit/react';
import { html } from 'lit';
import type React from 'react';
import { createPortal } from 'react-dom';
import { type WithDataContext, withDataContext } from './backfills.js';
import { isObject } from './is-object.js';
import { REQUEST_REMOVE, type RendererRequest, requestRenderer } from './render-props.js';

export type { EventName } from '@lit/react';

type DistributiveOmit<T, K extends PropertyKey> = T extends any
  ? K extends keyof T
    ? Omit<T, K>
    : T
  : T;
type PropsWithoutRef<T> = DistributiveOmit<T, 'ref'>;

// React prop → event name.
type EventNames = Record<string, EventName | string>;

type EventListeners<R extends EventNames> = {
  [K in keyof R]?: R[K] extends EventName ? (e: R[K]['__eventType']) => void : (e: Event) => void;
};

type ElementProps<I> = Partial<Omit<I, keyof HTMLElement>>;

type ComponentProps<I, E extends EventNames> = Omit<
  React.HTMLAttributes<I>,
  // Element and event props win over HTMLAttributes.
  keyof E | keyof ElementProps<I>
> &
  EventListeners<E> &
  ElementProps<I>;

/** Prop name → renderer name, or a nested map for config props (e.g. `igc-chat`). */
type Renderers = Record<string, unknown>;

/** Render props return `ReactNode`; nested maps recurse. */
type WithJsxRenderProps<T, R> = {
  [K in keyof T]: K extends keyof R
    ? R[K] extends string
      ? NonNullable<T[K]> extends (...args: infer Args) => unknown
        ? ((...args: WithDataContext<Args>) => React.ReactNode) | Extract<T[K], undefined>
        : T[K]
      : R[K] extends Renderers
        ? WithJsxRenderProps<NonNullable<T[K]>, R[K]> | Extract<T[K], undefined>
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

type ReactModule = typeof React;

type Props = Record<string, unknown>;
type RenderProp = (data: unknown) => React.ReactNode;
type Template = (ctx: unknown) => unknown;

type Reparenting = 'move-back' | 'none';
type NgElement = HTMLElement & { ngElementStrategy?: { parentElement?: WeakRef<HTMLElement> } };

type PortalSlot = RendererRequest & {
  callback?: RenderProp;
  /** Boxed: `reason` may be `undefined`. */
  failure?: { reason: unknown };
  portal?: React.ReactPortal;
};

interface WrapperOptions<I extends HTMLElement, E extends EventNames, R extends Renderers>
  extends Options<I, E> {
  renderProps?: R;
  moveBackOnDelete?: boolean;
}

class TemplateBridge {
  private readonly _templates = new Map<string, Template>();
  private readonly _slots = new Map<string, PortalSlot>();

  /** Reused while shallow-equal: a new object updates the element. */
  private readonly _containers = new Map<string, Props>();

  constructor(
    private readonly _renderers: Renderers,
    private readonly _notify: () => void,
  ) {}

  public resolve(props: Props): { props: Props; portals: React.ReactPortal[] } {
    const callbacks = new Map<string, RenderProp>();
    const elementProps = this._collect(props, this._renderers, callbacks);

    return { props: elementProps, portals: this._portals(callbacks) };
  }

  /** Arrow: templates call it unbound. */
  private readonly _request = (req: RendererRequest): void => {
    if (req.data === REQUEST_REMOVE) {
      this._slots.delete(req.slotName);
    } else {
      const previous = this._slots.get(req.slotName);

      this._slots.set(req.slotName, {
        ...req,
        data: withDataContext(req.data),
        // Keep the old content until the new one renders.
        portal: previous?.node === req.node ? previous.portal : undefined,
      });
    }

    this._notify();
  };

  private _collect(
    props: Props,
    renderers: Renderers,
    callbacks: Map<string, RenderProp>,
    prefix = '',
  ): Props {
    const out: Props = {};

    for (const prop in props) {
      const path = prefix ? `${prefix}.${prop}` : prop;
      const renderer = renderers[prop];
      const value = props[prop];

      if (typeof renderer === 'string' && typeof value === 'function') {
        callbacks.set(renderer, value as RenderProp);
        out[prop] = this._template(path, renderer);
      } else if (isObject(renderer) && isObject(value)) {
        out[prop] = this._container(path, this._collect(value, renderer, callbacks, path));
      } else {
        // Also non-function render props, e.g. `undefined`: the element uses its default.
        out[prop] = value;
      }
    }

    return out;
  }

  /** Captures only the renderer name, so it never goes stale. */
  private _template(path: string, name: string): Template {
    let template = this._templates.get(path);

    if (!template) {
      template = (ctx) => html`${requestRenderer(this._request, name, ctx)}`;
      this._templates.set(path, template);
    }

    return template;
  }

  private _container(path: string, next: Props): Props {
    const previous = this._containers.get(path);

    if (previous && shallowEqual(previous, next)) {
      return previous;
    }

    this._containers.set(path, next);
    return next;
  }

  private _portals(callbacks: Map<string, RenderProp>): React.ReactPortal[] {
    const portals: React.ReactPortal[] = [];

    for (const slot of this._slots.values()) {
      const callback = callbacks.get(slot.name);

      // Prop removed: element releases the slot.
      if (!callback) {
        continue;
      }

      this._invoke(slot, callback);

      if (slot.failure) {
        throw slot.failure.reason;
      }

      if (slot.portal) {
        portals.push(slot.portal);
      }
    }

    return portals;
  }

  /**
   * New render prop re-invokes: it may close over state the element can't see.
   * Same one keeps its portal; a fresh portal would re-commit and loop.
   */
  private _invoke(slot: PortalSlot, callback: RenderProp): void {
    if (slot.callback === callback) {
      return;
    }

    const { node, slotName } = slot;
    const content = callback(slot.data);

    slot.callback = callback;
    slot.failure = undefined;

    if (!isThenable(content)) {
      slot.portal = createPortal(content, node, slotName);
      return;
    }

    // No Suspense: inline render props yield a new promise per render.
    const settle = (patch: Partial<PortalSlot>) => {
      if (this._slots.get(slotName) !== slot || slot.callback !== callback) {
        return;
      }

      Object.assign(slot, patch);
      this._notify();
    };

    content.then(
      (resolved) => settle({ portal: createPortal(resolved, node, slotName) }),
      (reason: unknown) => settle({ failure: { reason } }),
    );
  }
}

function useTemplateBridge(react: ReactModule, renderers: Renderers): TemplateBridge {
  const [, forceUpdate] = react.useReducer((n: number) => n + 1, 0);
  const [bridge] = react.useState(() => new TemplateBridge(renderers, forceUpdate));

  return bridge;
}

function useForwardedRef<I extends HTMLElement>(
  react: ReactModule,
  ref: React.ForwardedRef<I>,
): readonly [React.RefObject<I | null>, (node: I) => void] {
  const elementRef = react.useRef<I | null>(null);

  const setRef = react.useCallback(
    (node: I) => {
      elementRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref !== null) {
        ref.current = node;
      }
    },
    [ref],
  );

  return [elementRef, setRef];
}

/** Moves the element back to its Angular Elements parent before React unmounts it. */
function useReparenting(
  react: ReactModule,
  mode: Reparenting,
  elementRef: React.RefObject<NgElement | null>,
): void {
  const projectionParent = react.useRef<WeakRef<HTMLElement> | null>(null);

  react.useLayoutEffect(() => {
    if (mode === 'none') {
      return;
    }

    // Strict mode re-run: return to the projection parent.
    const prevParent = projectionParent.current?.deref();

    if (prevParent && elementRef.current && prevParent !== elementRef.current.parentElement) {
      prevParent.appendChild(elementRef.current);
      projectionParent.current = null;
    }

    // Runs before DOM removal.
    return () => {
      const element = elementRef.current;
      const creationParent = element?.ngElementStrategy?.parentElement?.deref();

      if (!element || !creationParent || creationParent === element.parentElement) {
        return;
      }

      if (element.parentElement) {
        projectionParent.current = new WeakRef(element.parentElement);
      }
      creationParent.appendChild(element);
    };
  }, [mode, elementRef]);
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
  if ('register' in elementClass) {
    (elementClass as { register: () => void }).register();
  }

  const component = _createComponent({
    react: React,
    tagName,
    elementClass,
    events,
    displayName,
  });

  if (!renderProps && !moveBackOnDelete) {
    // Runtime shape matches; only types differ.
    return component as unknown as ReactWebComponent<I, E, R>;
  }

  const renderers: Renderers = renderProps ?? {};
  const reparenting: Reparenting = moveBackOnDelete ? 'move-back' : 'none';

  return React.forwardRef<I, WithJsxRenderProps<ComponentProps<I, E>, R>>((props, ref) => {
    const bridge = useTemplateBridge(React, renderers);
    const [elementRef, setRef] = useForwardedRef(React, ref);
    useReparenting(React, reparenting, elementRef);

    const { props: elementProps, portals } = bridge.resolve(props as Props);
    const { children } = props as { children?: React.ReactNode };

    elementProps.children = [...React.Children.toArray(children), ...portals];

    return React.createElement(component, {
      ...elementProps,
      ref: setRef,
    } as PropsWithoutRef<ComponentProps<I, E>> & React.RefAttributes<I>);
  });
};

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return isObject(value) && typeof value.then === 'function';
}

function shallowEqual(a: Props, b: Props): boolean {
  const keys = Object.keys(a);

  if (keys.length !== Object.keys(b).length) {
    return false;
  }

  return keys.every((key) => Object.is(a[key], b[key]));
}
