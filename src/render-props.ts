import { noChange } from 'lit';
import {
  AsyncDirective,
  type ChildPart,
  type DirectiveParameters,
  directive,
} from 'lit/async-directive.js';
import { withDataContext } from './backfills.js';
import { equal } from './equal.js';
import { getUUID } from './random-uuid.js';

export const REQUEST_REMOVE = Symbol('renderer-remove');
const NOT_SET = Symbol('not-set');

type NgState<T> = T & { implicit: unknown };
type RendererState<T> = {
  previous: T;
  current: T;
};

function createRequestData<T>(
  name: string,
  data: T | typeof REQUEST_REMOVE,
  node: Element,
  key?: string,
): RendererRequest<T> {
  return {
    name,
    data: data === REQUEST_REMOVE ? data : withDataContext(data),
    slotName: key !== undefined ? `${name}${key}` : name,
    node,
  };
}

export type RendererRequest<T> = {
  data: T | typeof REQUEST_REMOVE;
  name: string;
  slotName: string;
  node: Element;
};

type RendererCallback<T> = (req: RendererRequest<T>) => unknown;

class RequestRenderer<T> extends AsyncDirective {
  private readonly _key = getUUID();
  private _part: WeakRef<ChildPart> | null = null;
  private _callback: WeakRef<RendererCallback<T>> | null = null;

  private _state = { previous: NOT_SET, current: undefined } as RendererState<T>;
  private _name!: string;

  private get _renderNode(): Element | undefined {
    return this._part?.deref()?.parentNode as Element | undefined;
  }

  private _shouldUpdateNG(_data: NgState<T>): boolean {
    /* Can't compare implicit, in main use case it'd be the cell value which might repeat,
      be undefined or otherwise unrelated to the template content. Disabled for now. Reevaluate: */

    // if (equal(data.$implicit, this._state.previous)) {
    //   return false;
    // }

    // this._state.previous = data.$implicit as T;
    return true;
  }

  private _shouldUpdate(): boolean {
    const data = this._state.current;

    if (data !== null && typeof data === 'object' && Reflect.has(data as NgState<T>, 'implicit')) {
      return this._shouldUpdateNG(data as NgState<T>);
    }

    if (equal(this._state.previous, data)) {
      return false;
    }

    this._state.previous = data;
    return true;
  }

  /** Dispatches a request for the current state, if there is somewhere to render it. */
  private _request(callback: RendererCallback<T>, data: T | typeof REQUEST_REMOVE): void {
    const node = this._renderNode;
    if (!node) return;

    callback(createRequestData(this._name, data, node, this._key));
  }

  public override render(_callback: RendererCallback<T>, _name: string, _data: T): symbol {
    return noChange;
  }

  public override update(
    part: ChildPart,
    [callback, name, data]: DirectiveParameters<this>,
  ): symbol {
    this._callback = new WeakRef(callback);
    this._name = name;
    this._state.current = data;
    this._part = new WeakRef(part);

    if (this.isConnected && callback && this._shouldUpdate()) {
      this._request(callback, this._state.current);
    }

    return noChange;
  }

  protected override reconnected(): void {
    const callback = this._callback?.deref();
    if (callback && this._shouldUpdate()) {
      this._request(callback, this._state.current);
    }
  }

  protected override disconnected(): void {
    const callback = this._callback?.deref();
    if (callback) {
      this._request(callback, REQUEST_REMOVE);
    }
    // drop prev, so a reconnect would behave like initial
    this._state.previous = NOT_SET as T;
  }
}

export const requestRenderer = directive(RequestRenderer);
