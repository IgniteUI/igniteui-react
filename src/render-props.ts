import { noChange } from 'lit';
import {
  AsyncDirective,
  type ChildPart,
  type DirectiveParameters,
  directive,
} from 'lit/async-directive.js';
import { equal } from './equal.js';
import { SlotRequest, _removeEvent } from './render-event.js';

type NgState<T> = T & { $implicit: unknown };
type RendererState<T> = {
  previous: T;
  current: T;
};

class RequestRenderer<T> extends AsyncDirective {
  private readonly _key = crypto.randomUUID();
  private _part!: ChildPart;
  private _state = { current: undefined, previous: undefined } as RendererState<T>;
  private _name!: string;
  private _host!: Element;
  private _target?: Element;

  private get _renderNode(): Element {
    return this._part.parentNode as Element;
  }

  private get _eventTarget(): Element {
    return this._target ?? this._host;
  }

  private _emit(data: T | typeof _removeEvent): SlotRequest {
    return new SlotRequest(this._name, data, this._renderNode, this._key);
  }

  private _shouldUpdateNG(data: NgState<T>): boolean {
    if (equal(data.$implicit, this._state.previous)) {
      return false;
    }

    this._state.previous = data.$implicit as T;
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

  public override render(_name: string, _data: T, _target?: Element): symbol {
    return noChange;
  }

  public override update(part: ChildPart, [name, data, target]: DirectiveParameters<this>): symbol {
    this._part = part;
    this._name = name;
    this._state.current = data;
    this._target = target;
    this._host = part.options?.host as Element;

    if (this._eventTarget && this._shouldUpdate()) {
      this._eventTarget.dispatchEvent(this._emit(this._state.current));
    }
    return noChange;
  }

  protected override disconnected(): void {
    this._eventTarget.dispatchEvent(this._emit(_removeEvent));
  }
}

export const requestRenderer = directive(RequestRenderer);
