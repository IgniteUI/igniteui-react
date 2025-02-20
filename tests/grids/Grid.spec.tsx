import React from 'react';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import Grid from './Grid';

test('Default grid sample', async () => {
  const { getByRole } = render(<Grid />);

  // templated cell
  await expect.element(getByRole('gridcell', { name: 'PK: 1' })).toBeVisible();

  // second template
  await expect.element(getByRole('gridcell', { name: 'Alice Doe' })).toBeVisible();

  // conditional element
  await getByRole('button', { name: 'Toggle toolbar advanced filter' }).click();
  await expect.element(getByRole('button', { name: 'Advanced filtering' })).toBeVisible();
});
