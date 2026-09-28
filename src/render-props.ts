import { noChange } from 'lit';
import {
  AsyncDirective,
  type ChildPart,
  type DirectiveParameters,
  directive,
} from 'lit/async-directive.js';
import { equal } from './equal.js';
import { isObject } from './is-object.js';
import { getUUID } from './random-uuid.js';

export const REQUEST_REMOVE = Symbol('renderer-remove');
const NOT_SET = Symbol('not-set');

export type RendererRequest = {
  data: unknown;
  name: string;
  slotName: string;
  node: Element;
};

type RendererCallback = (req: RendererRequest) => unknown;

class RequestRenderer extends AsyncDirective {
  private readonly _key = getUUID();
  private _part: WeakRef<ChildPart> | null = null;
  private _callback: WeakRef<RendererCallback> | null = null;
  private _name!: string;
  private _data: unknown;
  private _previous: unknown = NOT_SET;

  private _shouldUpdate(): boolean {
    // Angular context: `implicit` (e.g. cell value) may repeat; always update.
    if (isObject(this._data) && 'implicit' in this._data) {
      return true;
    }

    if (equal(this._previous, this._data)) {
      return false;
    }

    this._previous = this._data;
    return true;
  }

  private _request(callback: RendererCallback, data: unknown): void {
    const node = this._part?.deref()?.parentNode as Element | undefined;

    if (!node) {
      return;
    }

    callback({ name: this._name, data, slotName: `${this._name}${this._key}`, node });
  }

  private _sync(): void {
    const callback = this._callback?.deref();

    if (callback && this._shouldUpdate()) {
      this._request(callback, this._data);
    }
  }

  public override render(_callback: RendererCallback, _name: string, _data: unknown): symbol {
    return noChange;
  }

  public override update(
    part: ChildPart,
    [callback, name, data]: DirectiveParameters<this>,
  ): symbol {
    if (this._callback?.deref() !== callback) {
      this._callback = new WeakRef(callback);
    }

    this._part ??= new WeakRef(part);
    this._name = name;
    this._data = data;

    if (this.isConnected) {
      this._sync();
    }

    return noChange;
  }

  protected override reconnected(): void {
    this._sync();
  }

  protected override disconnected(): void {
    const callback = this._callback?.deref();

    if (callback) {
      this._request(callback, REQUEST_REMOVE);
    }

    // Reconnect acts like first render.
    this._previous = NOT_SET;
  }
}

export const requestRenderer = directive(RequestRenderer);
