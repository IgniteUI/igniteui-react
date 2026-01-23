import { afterAll, expect, test, vi } from 'vitest';
import { type Locator, page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { configure } from 'vitest-browser-react/pure';
import type { IgrGrid } from '../../src/grids';
import Grid from './Grid';

afterAll(() => vi.restoreAllMocks());

test('Default grid sample', async () => {
  render(<Grid />);

  // templated cell
  await expect.element(page.getByRole('gridcell', { name: 'PK: 1' })).toBeVisible();

  // second template
  await expect.element(page.getByRole('gridcell', { name: 'Alice Doe' })).toBeVisible();

  // no-field template
  await expect.element(page.getByRole('button', { name: '📌' }).first()).toBeVisible();

  // conditional element
  await page.getByRole('button', { name: 'Toggle toolbar advanced filter' }).click();
  await expect.element(page.getByRole('button', { name: 'Advanced filtering' })).toBeVisible();

  const mockLog = vi.spyOn(console, 'log');
  await page.getByTitle('Next page').click();
  await expect.element(page.getByRole('gridcell', { name: 'PK: 6' })).toBeVisible();
  expect(mockLog).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'pagingDone', detail: { previous: 0, current: 1 } }),
  );

  // conditional element that moved (Angular template projection)
  await page.getByText('switch paging').click();
  await expect.element(page.getByTitle('Next page')).not.toBeInTheDocument();
  // TODO: Current limitation can't return element if there's an original immediate sibling due to React using `insertBefore`
  // await getByText('switch paging').click();
  // await expect.element(getByTitle('Next page')).toBeVisible();

  // remove age column
  await page.getByRole('button', { name: 'Without age column' }).click();
  await new Promise((resolve) => setTimeout(resolve, 20 /* Elements schedule delay */));
  expect(page.getByRole('columnheader').elements()).toHaveLength(4);
  // add back age column
  await page.getByRole('button', { name: 'With age column' }).click();
  await new Promise((resolve) => setTimeout(resolve, 20 /* Elements schedule delay */));
  expect(page.getByRole('columnheader').elements()).toHaveLength(5);
});

test('should maintain projected parents in Strict mode', async () => {
  configure({
    // disabled by default
    reactStrictMode: true,
  });
  render(<Grid />);

  // paginator content
  await expect.element(page.getByRole('navigation')).toBeVisible();

  const paginatorContent = page.getByRole('navigation').query()!;
  const paginator = paginatorContent.closest('igc-paginator')!;
  const grid = paginator.closest('igc-grid');

  expect(paginator.parentElement!.classList).toContain('igx-grid__footer');
  expect(paginator.parentElement).not.toBe(grid);
  configure({
    reactStrictMode: false,
  });
});

test('should render correct template values on repeating cell values between rows', async () => {
  render(<Grid />);
  await page.getByText('switch paging').click();
  await expect.element(page.getByRole('gridcell', { name: 'PK: 6' })).toBeInTheDocument();

  async function checkRowTemplatedButtonId(rows: Locator[]) {
    for (const row of rows) {
      const id = Number(row.element().getAttribute('data-rowindex')) + 1;
      const button = row.getByRole('button', { name: '📌' });
      await expect.element(button, { timeout: 100 }).toHaveAttribute('data-id', `${id}`);
    }
  }

  let rows = page.getByRole('row').filter({ hasText: 'PK:' }).all();
  const grid = document.querySelector<IgrGrid>('igc-grid')!;

  await checkRowTemplatedButtonId(rows);

  grid.navigateTo(9);
  await expect.element(page.getByRole('gridcell', { name: 'PK: 10' })).toBeInViewport();
  rows = rows = page.getByRole('row').filter({ hasText: 'PK:' }).all();

  await checkRowTemplatedButtonId(rows);
});
