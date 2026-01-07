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

type NgState<T> = T & { $implicit: unknown };
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
  private _callback: RendererCallback<T> | null = null;

  private _state = { previous: NOT_SET, current: undefined } as RendererState<T>;
  private _name!: string;

  private get _renderNode(): Element {
    return this._part?.deref()?.parentNode as Element;
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

    if (Reflect.has(data as NgState<T>, 'implicit')) {
      return this._shouldUpdateNG(data as NgState<T>);
    }

    if (equal(this._state.previous, data)) {
      return false;
    }

    this._state.previous = data;
    return true;
  }

  public override render(_callback: any, _name: string, _data: T): symbol {
    return noChange;
  }

  public override update(
    part: ChildPart,
    [callback, name, data]: DirectiveParameters<this>,
  ): symbol {
    this._callback = callback;
    this._name = name;
    this._state.current = data;
    this._part = new WeakRef(part);

    if (this.isConnected && this._callback && this._shouldUpdate()) {
      this._callback(
        createRequestData(this._name, this._state.current, this._renderNode, this._key),
      );
    }

    return noChange;
  }

  protected override disconnected(): void {
    if (this._callback) {
      this._callback(
        createRequestData(this._name, REQUEST_REMOVE as T, this._renderNode, this._key),
      );
      this._callback = null;
      this._part = null;
      this._state = { previous: NOT_SET, current: undefined } as RendererState<T>;
    }
  }
}

export const requestRenderer = directive(RequestRenderer);
