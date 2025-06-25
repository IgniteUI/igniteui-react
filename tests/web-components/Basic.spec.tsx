import { userEvent } from '@vitest/browser/context';
import { afterAll, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import BasicForm from './BasicForm';

afterAll(() => vi.restoreAllMocks());

test('Simple form rendering and validation', async () => {
  const screen = render(<BasicForm />);

  const input = screen.getByLabelText('Username');
  await expect.element(input).not.toBeValid();

  await userEvent.fill(input, 'Infragistics');
  await expect.element(input).toBeValid();

  const mockLog = vi.spyOn(console, 'log');

  // getByRole/LabelText don't work w/ Shadow DOM https://github.com/testing-library/dom-testing-library/issues/413?
  await screen.getByText('Remember credentials').click();
  expect(mockLog).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'igcChange',
      detail: {
        checked: true,
      },
    }),
  );

  await screen.getByText('Off', { exact: true }).click();
  expect(mockLog).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'igcChange',
      detail: {
        checked: true,
        value: 'off',
      },
    }),
  );
});
