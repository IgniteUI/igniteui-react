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

/**
 * Mapped type to update the render props callback return type.
 *
 * A renderer entry is either a name (a template directly on the component) or a nested map of
 * them (a template on a config object, as `igc-chat` declares its renderers), so it recurses.
 */
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

/** A map of prop names to renderer names, nested to mirror the shape of the props themselves. */
type Renderers = Record<string, unknown>;

/** The React module, which is injected rather than imported so Preact can be swapped in. */
type ReactModule = typeof React;

type Props = Record<string, unknown>;
type RenderProp = (data: unknown) => React.ReactNode;

/** A patched template handed to the element, and the renderer it stands in for. */
type PatchedTemplate = {
  patched: (ctx: unknown) => unknown;
  rendererName: string;
};

/** A slot the element has asked us to fill, and the portal currently filling it. */
type PortalSlot = {
  name: string;
  data: unknown;
  node: Element;
  callback: RenderProp | undefined;
  portal: React.ReactPortal;
};

interface WrapperOptions<I extends HTMLElement, E extends EventNames, R extends Renderers>
  extends Options<I, E> {
  renderProps?: R;
  moveBackOnDelete?: boolean;
}

/**
 * Owns the render prop machinery of a single component instance.
 *
 * All of this state has to outlive the render that created it: the element holds on to the patched
 * templates indefinitely and can invoke them whenever it likes, so what they read and write belongs
 * to the instance rather than to a render.
 */
class TemplateBridge {
  /** Patched templates handed to the element, keyed by their full prop path. */
  private readonly _templates = new Map<string, PatchedTemplate>();

  /** The *current* render prop callbacks, keyed by renderer name. */
  private readonly _callbacks = new Map<string, RenderProp>();

  /** Slots the element has asked us to fill, keyed by slot name. */
  private readonly _slots = new Map<string, PortalSlot>();

  /** Nested prop containers, kept around so their identity is stable while their contents are. */
  private readonly _containers = new Map<string, Props>();

  private readonly _renderers: Renderers;
  private readonly _notify: () => void;

  constructor(renderers: Renderers, notify: () => void) {
    this._renderers = renderers;
    this._notify = notify;
  }

  /**
   * Turns the component props into the props handed to the element, swapping every render prop for
   * a patched template of stable identity.
   */
  public resolve(props: Props): Props {
    const elementProps: Props = {};

    this._prune(props);
    this._collect(props, this._renderers, elementProps);
    this._refresh();

    return elementProps;
  }

  /** The portals currently filling the element's slots. */
  public *portals(): Generator<React.ReactPortal> {
    for (const { portal } of this._slots.values()) {
      yield portal;
    }
  }

  /**
   * Fills or clears a slot at the element's request. Bound once per instance, since the patched
   * templates hold on to it for as long as the element does.
   */
  private readonly _request = (req: RendererRequest<unknown>): void => {
    if (req.data === REQUEST_REMOVE) {
      this._slots.delete(req.slotName);
    } else {
      const callback = this._callbacks.get(req.name);

      this._slots.set(req.slotName, {
        name: req.name,
        data: req.data,
        node: req.node,
        callback,
        portal: createPortal(callback?.(req.data), req.node, req.slotName),
      });
    }

    this._notify();
  };

  /**
   * Drops patched templates whose render prop is gone - either the prop was removed, or it is no
   * longer a function. Both have to be pruned: leaving one behind hands the element a stale
   * template, while recreating one on every render feeds it a new identity and spins the loop.
   */
  private _prune(props: Props): void {
    for (const [path, { rendererName }] of this._templates) {
      if (typeof getAtPath(props, path) === 'function') {
        continue;
      }

      this._templates.delete(path);
      this._callbacks.delete(rendererName);

      // Drop the slots as well. The directive does emit a remove request when it disconnects, but
      // it reaches for the callback through a `WeakRef` - once the patched template above is gone
      // that request may never arrive, and the portal would linger for the component's lifetime.
      for (const [slotName, slot] of this._slots) {
        if (slot.name === rendererName) {
          this._slots.delete(slotName);
        }
      }
    }
  }

  /** Copies the props over, swapping render props for templates and recursing into config objects. */
  private _collect(props: Props, renderers: Renderers, out: Props, prefix = ''): void {
    for (const prop in props) {
      const path = prefix ? `${prefix}.${prop}` : prop;
      const renderer = renderers[prop];
      const value = props[prop];

      if (typeof renderer === 'string') {
        out[prop] = this._template(path, renderer, value);
      } else if (isRecord(renderer) && isRecord(value)) {
        const nested: Props = {};

        this._collect(value, renderer, nested, path);
        out[prop] = this._container(path, nested);
      } else {
        out[prop] = value;
      }
    }
  }

  /**
   * The patched template standing in for a render prop, created on first sight.
   *
   * Only a function is a template. Anything else - most often `undefined` from a conditional prop -
   * has to reach the element untouched so it can fall back to its own default rendering.
   */
  private _template(path: string, name: string, value: unknown): unknown {
    if (typeof value !== 'function') {
      return value;
    }

    // Refreshed on every render. The patched template is cached so the element sees a stable prop,
    // but the callback it invokes must always be the current one, or the template renders against
    // a stale closure.
    this._callbacks.set(name, value as RenderProp);

    let template = this._templates.get(path);

    if (!template) {
      template = { patched: createPatched(this._request, name), rendererName: name };
      this._templates.set(path, template);
    }

    return template.patched;
  }

  /** Reuses the previous container while its contents are unchanged, to keep its identity stable. */
  private _container(path: string, next: Props): Props {
    const previous = this._containers.get(path);

    if (previous && shallowEqual(previous, next)) {
      return previous;
    }

    this._containers.set(path, next);
    return next;
  }

  /**
   * A portal is built when the element requests its slot and reused as-is afterwards - handing
   * React a fresh portal on every render would re-commit the template into the element, which
   * re-renders the element, which requests the template again.
   *
   * It does have to be rebuilt when the render prop itself changes, though. Templates commonly
   * close over state, and the element has no reason to re-request one just because the React tree
   * above it re-rendered.
   */
  private _refresh(): void {
    for (const [slotName, slot] of this._slots) {
      const callback = this._callbacks.get(slot.name);

      if (slot.callback !== callback) {
        slot.callback = callback;
        slot.portal = createPortal(callback?.(slot.data), slot.node, slotName);
      }
    }
  }
}

/** Creates the render prop state of this component instance and keeps it for its lifetime. */
function useTemplateBridge(react: ReactModule, renderers: Renderers): TemplateBridge {
  const [, forceUpdate] = react.useReducer(increment, 0);
  const bridge = react.useRef<TemplateBridge | null>(null);

  // `forceUpdate` is stable for the lifetime of the component, so capturing the first one is safe.
  bridge.current ??= new TemplateBridge(renderers, forceUpdate);

  return bridge.current;
}

/** Forwards the ref while keeping a local handle on the element for the hooks that need one. */
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

/**
 * Handles element re-parenting for the Angular integration, where Angular Elements moves a
 * projected element away from the parent React knows about.
 */
function useReparenting<I extends HTMLElement>(
  react: ReactModule,
  enabled: boolean | undefined,
  elementRef: React.RefObject<I | null>,
): void {
  const projectionParent = react.useRef<WeakRef<HTMLElement> | null>(null);

  // https://react.dev/learn/reusing-logic-with-custom-hooks#keep-your-custom-hooks-focused-on-concrete-high-level-use-cases
  // Runs once after first render.
  react.useLayoutEffect(() => {
    if (!enabled) {
      return;
    }

    // already too late to save elementRef.current?.parentElement, rely on Elements
    // secondary run (likely dev strict mode), move back to projection:
    const prevParent = projectionParent.current?.deref();

    if (prevParent && elementRef.current && prevParent !== elementRef.current.parentElement) {
      prevParent.appendChild(elementRef.current);
    }
    projectionParent.current = null;

    return () => {
      // cleanup **before** component is removed from the DOM
      const element = elementRef.current;

      if (!element) {
        return;
      }

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
  }, [enabled, elementRef]);
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

  const component = _createComponent({
    react: React,
    tagName,
    elementClass,
    events,
    displayName,
  });

  if (!renderProps && !moveBackOnDelete) {
    // When R is empty (no renderProps), the component types are equivalent at runtime
    return component as unknown as ReactWebComponent<I, E, R>;
  }

  const renderers: Renderers = renderProps ?? {};

  type PropsWithRenderProps = WithJsxRenderProps<ComponentProps<I, E>, R>;

  return React.forwardRef<I, PropsWithRenderProps>((props, ref) => {
    const bridge = useTemplateBridge(React, renderers);
    const [elementRef, setRef] = useForwardedRef<I>(React, ref);
    useReparenting(React, moveBackOnDelete, elementRef);

    const elementProps = bridge.resolve(props as Props);
    const children = React.Children.toArray((props as { children?: React.ReactNode }).children);

    children.push(...bridge.portals());
    elementProps.children = children;

    return React.createElement(component, {
      ...elementProps,
      ref: setRef,
    } as PropsWithoutRef<ComponentProps<I, E>> & React.RefAttributes<I>);
  });
};

function createPatched(callback: (req: RendererRequest<unknown>) => void, propertyName: string) {
  return (ctx: unknown) => html`${requestRenderer(callback, propertyName, ctx)}`;
}

function increment(count: number): number {
  return count + 1;
}

function isRecord(value: unknown): value is Props {
  return typeof value === 'object' && value !== null;
}

function shallowEqual(a: Props, b: Props): boolean {
  const keys = Object.keys(a);

  if (keys.length !== Object.keys(b).length) {
    return false;
  }

  return keys.every((key) => Object.is(a[key], b[key]));
}

/** Resolves a dot delimited path, returning `undefined` if any segment is missing. */
function getAtPath(object: Props, path: string): unknown {
  let current: unknown = object;

  for (const part of path.split('.')) {
    if (!isRecord(current)) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}
