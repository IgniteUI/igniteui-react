import { afterAll, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import BasicDocManager from './Basic';

afterAll(() => vi.restoreAllMocks());

test('Default dock manager sample', async () => {
  render(<BasicDocManager />);

  const mockLog = vi.spyOn(console, 'log');
  await page.getByRole('group', { name: 'Floating Pane' }).click();
  expect(mockLog).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'activePaneChanged',
      detail: {
        newPane: expect.objectContaining({
          type: 'contentPane',
          header: 'Floating Pane',
        }),
        oldPane: null,
      },
    }),
  );
});
