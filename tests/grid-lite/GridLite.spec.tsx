import { afterAll, expect, test, vi } from 'vitest';
import { type Locator, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import type { IgrGridLite } from '../../src/grid-lite';
import GridLite from './GridLite';

afterAll(() => vi.restoreAllMocks());

test('Default grid lite sample', async () => {
  await render(<GridLite />);
  const grid = document.querySelector<IgrGridLite>('igc-grid-lite')!;

  // templated cell
  await expect.element(page.getByText('PK: 1', { exact: true })).toBeVisible();

  // second template
  await expect.element(page.getByText('Alice Doe')).toBeVisible();

  // no-field template
  await expect.element(page.getByRole('button', { name: '🧪' }).first()).toBeVisible();

  // sort operation element
  await expect.element(page.getByText('Jack Doe'), { timeout: 500 }).not.toBeInViewport();
  await expect.element(page.getByText('PK: 10')).not.toBeInViewport();
  await page.getByRole('button', { name: 'Sort name' }).click();
  await expect.element(page.getByText('Jack Doe'), { timeout: 500 }).toBeInViewport();
  await expect.element(page.getByText('PK: 10')).toBeInViewport();

  // sort click + event
  const mockLog = vi.spyOn(console, 'log');
  const header = page.getByText('name', { exact: true }).element();
  const sortIcon = (header.getRootNode() as ShadowRoot).querySelector('[part="sorting-action"]');
  expect(sortIcon).not.toBeNull();
  expect(sortIcon).toBeVisible();

  await userEvent.click(sortIcon!);
  await grid.updateComplete;
  await expect.element(page.getByText('PK: 1', { exact: true })).toBeInViewport();
  expect(mockLog).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'sorted',
      detail: expect.objectContaining({ key: 'name', direction: 'none' }),
    }),
  );

  // remove age column
  await page.getByRole('button', { name: 'Without age column' }).click();
  await grid.updateComplete;
  expect(grid.columns).toHaveLength(4);
  // add back age column
  await page.getByRole('button', { name: 'With age column' }).click();
  await grid.updateComplete;
  expect(grid.columns).toHaveLength(5);
});

test('should render correct template values on repeating cell values between rows', async () => {
  await render(<GridLite />);
  await expect.element(page.getByText('PK: 1', { exact: true })).toBeVisible();

  async function checkRowTemplatedButtonId(buttons: Locator[]) {
    for (const button of buttons) {
      const cell = (button.element().getRootNode() as ShadowRoot).host;
      const id = (cell as any).row.data.id;
      await expect.element(button, { timeout: 100 }).toHaveAttribute('data-id', `${id}`);
    }
  }

  let buttons = page.getByRole('button', { name: '🧪' }).all();
  await checkRowTemplatedButtonId(buttons);

  const grid = document.querySelector<IgrGridLite>('igc-grid-lite')!;
  grid.navigateTo(9);
  await expect.element(page.getByText('PK: 10')).toBeInViewport();
  buttons = page.getByRole('button', { name: '🧪' }).all();

  await checkRowTemplatedButtonId(buttons);
});
