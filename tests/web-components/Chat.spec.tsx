import { afterAll, expect, test, vi } from 'vitest';
import { locators, page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import Chat from './Chat';

afterAll(() => vi.restoreAllMocks());

test('Simple chat rendering and event', async () => {
  render(<Chat />);

  const header = page.getByText('Chat Header');
  await expect.element(header).toBeVisible();

  const headingTemplate = page.getByText('Customer Support BOLD');
  await expect.element(headingTemplate).toBeVisible();

  const mockLog = vi.spyOn(console, 'log');

  const input = page.getByRole('textbox', { name: 'Type your message here...' });
  await userEvent.fill(input, 'Text message');
  await userEvent.keyboard('{Enter}');

  expect(mockLog).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'igcMessageCreated',
      detail: expect.objectContaining({ text: 'Text message', sender: 'user' }),
    }),
  );

  const messages = page.getByPart('message-item').all();
  expect(messages.length).toBe(2);

  // count elements by text "Customer Support BOLD" - should be 1 (header only)
  const headings = page.getByText('Customer Support BOLD').all();
  expect(headings.length).toBe(1);
});

test('Markdown support with default renderer', async () => {
  render(<Chat />);

  const input = page.getByRole('textbox', { name: 'Type your message here...' });
  await userEvent.fill(input, '# Hello world');
  await userEvent.keyboard('{Enter}');

  await expect.poll(() => page.getByPart('message-item').all().length).toBe(2);

  // The default renderer is async - assert on the rendered result rather than waiting a
  // fixed number of frames. Shiki in particular resolves its grammar and theme lazily, so
  // a single animation frame is not always enough for the highlighted block to appear.
  let message = page.getByText('Hello world');
  await expect.element(message).toBeVisible();
  expect(message.element().tagName).toMatch(/h1/i);

  await userEvent.fill(input, '```ts\nconst chat = document.createElement("igc-chat");\n```');
  await userEvent.keyboard('{Enter}');

  message = page.getByText(/^const/);
  await expect.element(message).toBeVisible();
  await expect.poll(() => message.query()?.closest('pre')?.classList.contains('shiki')).toBe(true);

  await userEvent.fill(input, 'Powered by [Infragistics](https://infragistics.com/)');
  await userEvent.keyboard('{Enter}');

  message = page.getByText(/Infragistics/);
  await expect.element(message).toBeVisible();
  expect(message.element().tagName).toMatch(/a/i);
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
