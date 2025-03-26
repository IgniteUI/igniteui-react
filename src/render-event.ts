import { withDataContext } from './backfills.js';

export const _removeEvent = Symbol('remove-slot-request');

export class SlotRequest extends Event {
  public readonly data: unknown;
  public readonly name: string;
  public readonly slotName: string;
  public readonly node: Element;

  constructor(name: string, data: unknown, node: Element, key?: string) {
    super('slot-request', { bubbles: false, composed: false });
    this.name = name;
    this.data = data === _removeEvent ? data : withDataContext(data);
    this.slotName = key !== undefined ? `${name}${key}` : name;
    this.node = node;
  }
}
