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

/** React 18's `ReactNode` lacks promises. */
type RenderResult = React.ReactNode | PromiseLike<React.ReactNode>;

/** Render props return `RenderResult`; nested maps recurse. */
type WithJsxRenderProps<T, R> = {
  [K in keyof T]: K extends keyof R
    ? R[K] extends string
      ? NonNullable<T[K]> extends (...args: infer Args) => unknown
        ? ((...args: WithDataContext<Args>) => RenderResult) | Extract<T[K], undefined>
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
type RenderProp = (data: unknown) => RenderResult;
type Template = (ctx: unknown) => unknown;

type Reparenting = 'move-back' | 'none';
/** Cleared render prop: keep its template, or unset it. */
type Clearing = 'keep' | 'unset';
type NgElement = HTMLElement & { ngElementStrategy?: { parentElement?: WeakRef<HTMLElement> } };

type PortalSlot = RendererRequest & {
  callback?: RenderProp;
  portal?: React.ReactPortal;
};

type SlotProps = { render: RenderProp; data: unknown };
type SlotRenderer = (props: SlotProps) => React.ReactNode;

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
    private readonly _clearing: Clearing,
    private readonly _slot: SlotRenderer,
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
      this._slots.set(req.slotName, { ...req, data: withDataContext(req.data) });
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
      const path = toPath(prefix, prop);
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

    if (this._clearing === 'unset') {
      return out;
    }

    // Cleared or dropped: keep; Angular Elements throw on an unset template.
    for (const prop in renderers) {
      const template = this._templates.get(toPath(prefix, prop));

      if (template) {
        out[prop] ??= template;
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

      portals.push(this._portal(slot, callback));
    }

    return portals;
  }

  /**
   * New render prop re-renders its slot: it may close over state the element can't see.
   * Same one keeps its portal; a fresh portal would re-commit and loop.
   */
  private _portal(slot: PortalSlot, callback: RenderProp): React.ReactPortal {
    if (slot.portal && slot.callback === callback) {
      return slot.portal;
    }

    const content = this._slot({ render: callback, data: slot.data });

    slot.callback = callback;
    slot.portal = createPortal(content, slot.node, slot.slotName);
    return slot.portal;
  }
}

/**
 * Each slot is its own React tree, isolated from its neighbors:
 *
 *   Boundary       throws or rejects → empty slot; React logs it
 *   └ Suspense     `use()` → empty slot until resolved
 *     └ Content    calls the render prop
 *       └ Pending  async result; keeps the previous one until it settles
 */
function createSlot(react: ReactModule): SlotRenderer {
  type BoundaryState = Partial<SlotProps> & { failed: boolean };

  class Boundary extends react.Component<SlotProps, BoundaryState> {
    public state: BoundaryState = { failed: false };

    /** New render prop or data: retry. */
    public static getDerivedStateFromProps(
      { render, data }: SlotProps,
      state: BoundaryState,
    ): BoundaryState | null {
      if (render === state.render && data === state.data) {
        return null;
      }

      return { failed: false, render, data };
    }

    public static getDerivedStateFromError(): Partial<BoundaryState> {
      return { failed: true };
    }

    public render(): React.ReactNode {
      if (this.state.failed) {
        return null;
      }

      return react.createElement(
        react.Suspense,
        { fallback: null },
        react.createElement(Content, this.props),
      );
    }
  }

  // Not `use()`: a new promise per render never settles.
  function Pending({ promise }: { promise: PromiseLike<React.ReactNode> }): React.ReactNode {
    const [content, setContent] = react.useState<React.ReactNode>(null);
    const [, setFailure] = react.useState();

    react.useEffect(() => {
      let current = true;

      // Drops superseded results and failures.
      promise.then(
        (resolved) => {
          if (!current) {
            return;
          }

          // Boxed: a function would run as an updater.
          setContent(() => resolved);
        },
        (reason: unknown) => {
          if (!current) {
            return;
          }

          // Throws on render, into the boundary.
          setFailure(() => {
            throw reason;
          });
        },
      );

      return () => {
        current = false;
      };
    }, [promise]);

    return content ?? null;
  }

  function Content({ render, data }: SlotProps): React.ReactNode {
    const content = render(data);

    // React 17 throws on `undefined`.
    if (!isThenable(content)) {
      return content ?? null;
    }

    // Handled now: a render that never commits never mounts `Pending`.
    content.then(undefined, () => {});
    return react.createElement(Pending, { promise: content });
  }

  return (props) => react.createElement(Boundary, props);
}

function useTemplateBridge(
  react: ReactModule,
  renderers: Renderers,
  clearing: Clearing,
  slot: SlotRenderer,
): TemplateBridge {
  const [, forceUpdate] = react.useReducer((n: number) => n + 1, 0);
  const [bridge] = react.useState(() => new TemplateBridge(renderers, clearing, slot, forceUpdate));

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
  // `moveBackOnDelete` marks Angular Elements.
  const clearing: Clearing = moveBackOnDelete ? 'keep' : 'unset';
  const slot = createSlot(React);

  return React.forwardRef<I, WithJsxRenderProps<ComponentProps<I, E>, R>>((props, ref) => {
    const bridge = useTemplateBridge(React, renderers, clearing, slot);
    const [elementRef, setRef] = useForwardedRef(React, ref);
    useReparenting(React, reparenting, elementRef);

    const { props: elementProps, portals } = bridge.resolve(props as Props);

    // A bridge update keeps `props`: reuse the element, so @lit/react does not
    // set every property again. Portals render into their nodes from anywhere.
    const element = React.useMemo(
      () =>
        React.createElement(component, {
          ...elementProps,
          ref: setRef,
        } as PropsWithoutRef<ComponentProps<I, E>> & React.RefAttributes<I>),
      [props, setRef],
    );

    return React.createElement(React.Fragment, null, element, portals);
  });
};

function toPath(prefix: string, prop: string): string {
  return prefix ? `${prefix}.${prop}` : prop;
}

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
