import { locators, userEvent } from '@vitest/browser/context';
import { afterAll, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';

import Chat from './Chat';

afterAll(() => vi.restoreAllMocks());

test('Simple chat rendering and event', async () => {
  const screen = render(<Chat />);

  const header = screen.getByText('Chat Header');
  await expect.element(header).toBeVisible();

  const headingTemplate = screen.getByText('Customer Support BOLD');
  await expect.element(headingTemplate).toBeVisible();

  const mockLog = vi.spyOn(console, 'log');

  const input = screen.getByRole('textbox', { name: 'Type your message here...' });
  await userEvent.fill(input, 'Text message');
  await userEvent.keyboard('{Enter}');

  expect(mockLog).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'igcMessageCreated',
      detail: expect.objectContaining({ text: 'Text message', sender: 'user' }),
    }),
  );

  const messages = screen.getByPart('message-item').all();
  expect(messages.length).toBe(2);

  // count elements by text "Customer Support BOLD" - should be 1 (header only)
  const headings = screen.getByText('Customer Support BOLD').all();
  expect(headings.length).toBe(1);
});

//#region Locator extension
locators.extend({
  getByPart(part: string) {
    return `[part="${part}"]`;
  },
});

declare module '@vitest/browser/context' {
  interface LocatorSelectors {
    getByPart(part: string): Locator;
  }
}
//#endregion Locator extension
