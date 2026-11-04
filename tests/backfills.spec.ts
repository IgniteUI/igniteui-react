import { describe, expect, it } from 'vitest';
import { withDataContext } from '../src/backfills';

describe('withDataContext', () => {
  it('passes non-object contexts through', () => {
    expect(withDataContext(undefined)).toBeUndefined();
    expect(withDataContext(1)).toBe(1);
  });
});
