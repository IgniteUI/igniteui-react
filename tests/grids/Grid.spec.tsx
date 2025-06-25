import { afterAll, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { configure } from 'vitest-browser-react/pure';

import Grid from './Grid';

afterAll(() => vi.restoreAllMocks());

test('Default grid sample', async () => {
  const { getByRole, getByTitle, getByText } = render(<Grid />);

  // templated cell
  await expect.element(getByRole('gridcell', { name: 'PK: 1' })).toBeVisible();

  // second template
  await expect.element(getByRole('gridcell', { name: 'Alice Doe' })).toBeVisible();

  // no-field template
  await expect.element(getByRole('button', { name: '📌' }).first()).toBeVisible();

  // conditional element
  await getByRole('button', { name: 'Toggle toolbar advanced filter' }).click();
  await expect.element(getByRole('button', { name: 'Advanced filtering' })).toBeVisible();

  const mockLog = vi.spyOn(console, 'log');
  await getByTitle('Next page').click();
  await expect.element(getByRole('gridcell', { name: 'PK: 6' })).toBeVisible();
  expect(mockLog).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'pagingDone', detail: { previous: 0, current: 1 } }),
  );

  // conditional element that moved (Angular template projection)
  await getByText('switch paging').click();
  await expect.element(getByTitle('Next page')).not.toBeInTheDocument();
  // TODO: Current limitation can't return element if there's an original immediate sibling due to React using `insertBefore`
  // await getByText('switch paging').click();
  // await expect.element(getByTitle('Next page')).toBeVisible();

  // remove age column
  await getByRole('button', { name: 'Without age column' }).click();
  await new Promise((resolve) => setTimeout(resolve, 20 /* Elements schedule delay */));
  expect(getByRole('columnheader').elements()).toHaveLength(4);
  // add back age column
  await getByRole('button', { name: 'With age column' }).click();
  await new Promise((resolve) => setTimeout(resolve, 20 /* Elements schedule delay */));
  expect(getByRole('columnheader').elements()).toHaveLength(5);
});

test('should maintain projected parents in Strict mode', async () => {
  configure({
    // disabled by default
    reactStrictMode: true,
  });
  const { getByRole } = render(<Grid />);

  // paginator content
  await expect.element(getByRole('navigation')).toBeVisible();

  const paginatorContent = getByRole('navigation').query()!;
  const paginator = paginatorContent.closest('igc-paginator')!;
  const grid = paginator.closest('igc-grid');

  expect(paginator.parentElement!.classList).toContain('igx-grid__footer');
  expect(paginator.parentElement).not.toBe(grid);
  configure({
    reactStrictMode: false,
  });
});
