import React from 'react';
import { afterAll, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import Grid from './Grid';

afterAll(() => vi.restoreAllMocks());

test('Default grid sample', async () => {
  const { getByRole, getByTitle } = render(<Grid />);

  // templated cell
  await expect.element(getByRole('gridcell', { name: 'PK: 1' })).toBeVisible();

  // second template
  await expect.element(getByRole('gridcell', { name: 'Alice Doe' })).toBeVisible();

  // conditional element
  await getByRole('button', { name: 'Toggle toolbar advanced filter' }).click();
  await expect.element(getByRole('button', { name: 'Advanced filtering' })).toBeVisible();

  const mockLog = vi.spyOn(console, 'log');
  await getByTitle('Next page').click();
  await expect.element(getByRole('gridcell', { name: 'PK: 6' })).toBeVisible();
  expect(mockLog).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'pagingDone', detail: { previous: 0, current: 1 } }),
  );
});
