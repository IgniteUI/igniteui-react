import type { IgcComboComponent } from 'igniteui-webcomponents';
import { StrictMode } from 'react';
import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import type { ComboDataPage, ComboDataRequest } from '../../src/extras/combo-data-source';
import { type City, RemoteCombo } from './ComboDataSource';

const REMOTE = 'remote';

const combo = () => document.querySelector<IgcComboComponent<City>>('igc-combo')!;

const refresh = () => page.getByRole('button', { name: 'Refresh' }).click();

const cities = (...names: string[]): City[] => names.map((name, id) => ({ id, name }));

/** Answers at once. */
const answer = (items: City[]) =>
  vi.fn(async (_request: ComboDataRequest, _signal: AbortSignal) => ({
    items,
    totalCount: items.length,
  }));

/** Answers when the test calls `resolve`. */
function pending() {
  const page = Promise.withResolvers<ComboDataPage<City>>();
  const load = vi.fn((_request: ComboDataRequest, _signal: AbortSignal) => page.promise);
  const signal = () => load.mock.calls[0][1];

  return { load, signal, resolve: page.resolve };
}

test('binds a combo that renders after the hook and loads on open', async () => {
  const load = answer(cities('Sofia'));
  const { rerender } = await render(<RemoteCombo source={{ load }} combo="hidden" />);

  await rerender(<RemoteCombo source={{ load }} combo="shown" />);
  expect(combo().filteringOptions.mode).toBe(REMOTE);

  await page.getByRole('combobox').click();

  await expect.element(page.getByText('Sofia')).toBeVisible();
  expect(load).toHaveBeenCalledOnce();
});

test('resolves the preset value on mount', async () => {
  const sofia = cities('Sofia');
  const resolve = vi.fn(async (_values: unknown[], _signal: AbortSignal) => sofia);
  await render(<RemoteCombo source={{ load: answer([]), resolve }} value={[sofia[0].id]} />);

  await expect.poll(() => combo().selection).toEqual(sofia);
  expect(resolve).toHaveBeenCalledOnce();
});

test('binds once under StrictMode', async () => {
  const load = answer(cities('Sofia'));
  await render(
    <StrictMode>
      <RemoteCombo source={{ load }} />
    </StrictMode>,
  );

  await page.getByRole('combobox').click();

  await expect.element(page.getByText('Sofia')).toBeVisible();
  expect(load).toHaveBeenCalledOnce();
});

test('a new source on re-render keeps the request in flight', async () => {
  const first = pending();
  const { rerender } = await render(<RemoteCombo source={{ load: first.load }} />);

  await refresh();
  await rerender(<RemoteCombo source={{ load: answer([]) }} />);

  expect(first.signal().aborted).toBe(false);

  first.resolve({ items: cities('Sofia') });
  await expect.poll(() => combo().data).toEqual(cities('Sofia'));
});

test('refresh calls the latest load', async () => {
  const { rerender } = await render(<RemoteCombo source={{ load: answer(cities('Sofia')) }} />);

  const latest = answer(cities('Paris'));
  await rerender(<RemoteCombo source={{ load: latest }} />);
  await refresh();

  await expect.poll(() => combo().data).toEqual(cities('Paris'));
  expect(latest).toHaveBeenCalledOnce();
});

test('a new pageSize rebinds', async () => {
  const load = answer([]);
  const { rerender } = await render(<RemoteCombo source={{ load }} pageSize={10} />);

  await refresh();
  await rerender(<RemoteCombo source={{ load }} pageSize={20} />);
  await refresh();

  await expect.poll(() => load.mock.calls.map(([request]) => request.count)).toEqual([10, 20]);
});

test('unmount disposes the binding', async () => {
  const request = pending();
  const { unmount } = await render(<RemoteCombo source={{ load: request.load }} />);
  const element = combo();

  await refresh();
  await unmount();

  expect(request.signal().aborted).toBe(true);
  expect(element.filteringOptions.mode).not.toBe(REMOTE);
  expect(element.loading).toBe(false);
});
