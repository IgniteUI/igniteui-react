import { userEvent } from '@vitest/browser/context';
import React from 'react';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';

import BasicForm from './BasicForm';

test('Simple form rendering and validation', async () => {
  const screen = render(<BasicForm />);

  const input = screen.getByLabelText('Username');
  await expect.element(input).not.toBeValid();

  await userEvent.fill(input, 'Infragistics');
  await expect.element(input).toBeValid();
});
