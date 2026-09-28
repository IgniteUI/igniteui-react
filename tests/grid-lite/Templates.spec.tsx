import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { AsyncTemplate, FailingTemplate, OptionalTemplate, StatefulTemplate } from './Templates';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('render props observe updated React state', async () => {
  render(<StatefulTemplate />);

  await expect.element(page.getByText('V:1/C:0', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Increment' }).click();

  await expect.element(page.getByText('V:1/C:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('V:2/C:1', { exact: true })).toBeVisible();
});

test('a render prop passed as undefined falls back to the default rendering', async () => {
  render(<OptionalTemplate />);

  await expect.element(page.getByText('V:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('id', { exact: true })).toBeVisible();
});

test('a render prop added on a later render does not evict the existing ones', async () => {
  render(<OptionalTemplate />);

  await expect.element(page.getByText('V:1', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Add header template' }).click();

  await expect.element(page.getByText('H:id', { exact: true })).toBeVisible();
  await expect.element(page.getByText('V:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('V:2', { exact: true })).toBeVisible();
});

test('an async render prop keeps its content until the new one settles', async () => {
  let gate = Promise.withResolvers<void>();
  const wait = vi.fn(() => gate.promise);
  const open = () => {
    gate.resolve();
    gate = Promise.withResolvers<void>();
  };

  render(<AsyncTemplate wait={wait} />);

  await expect.poll(() => wait.mock.calls.length).toBeGreaterThan(0);
  open();
  await expect.element(page.getByText('A:1/C:0', { exact: true })).toBeVisible();

  const initial = wait.mock.calls.length;
  await page.getByRole('button', { name: 'Increment' }).click();

  await expect.element(page.getByText('Count:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('A:1/C:0', { exact: true })).toBeVisible();

  await expect.poll(() => wait.mock.calls.length).toBeGreaterThan(initial);
  open();
  await expect.element(page.getByText('A:1/C:1', { exact: true })).toBeVisible();

  // No render loop.
  const settled = wait.mock.calls.length;
  await delay(300);
  expect(wait).toHaveBeenCalledTimes(settled);
});

test('an async render prop that rejects reaches the error boundary', async () => {
  render(<FailingTemplate />);

  await expect.element(page.getByText('Caught:boom', { exact: true })).toBeVisible();
});
