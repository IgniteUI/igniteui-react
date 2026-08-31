import { expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { OptionalTemplate, StatefulTemplate } from './Templates';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('render props observe updated React state', async () => {
  render(<StatefulTemplate />);

  await expect.element(page.getByText('V:1/C:0', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Increment' }).click();

  // the template closes over `count` - it must re-render with the new value
  await expect.element(page.getByText('V:1/C:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('V:2/C:1', { exact: true })).toBeVisible();
});

test('a render prop passed as undefined leaves its siblings intact', async () => {
  render(<OptionalTemplate />);

  await expect.element(page.getByText('V:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('V:2', { exact: true })).toBeVisible();
});

test('a render prop passed as undefined does not spin the render loop', async () => {
  render(<OptionalTemplate />);

  const cell = page.getByText('V:1', { exact: true });
  await expect.element(cell).toBeVisible();

  // portals are torn down and recreated on every cycle, so a settled component
  // keeps the same DOM node
  const node = cell.element();
  await delay(300);
  expect(cell.element()).toBe(node);
});

test('a render prop added on a later render does not evict the existing ones', async () => {
  render(<OptionalTemplate />);

  await expect.element(page.getByText('V:1', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Add header template' }).click();

  await expect.element(page.getByText('H:id', { exact: true })).toBeVisible();
  await expect.element(page.getByText('V:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('V:2', { exact: true })).toBeVisible();
});
