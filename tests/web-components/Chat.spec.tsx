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

test('Markdown support with default renderer', async () => {
  const screen = render(<Chat />);

  const input = screen.getByRole('textbox', { name: 'Type your message here...' });
  await userEvent.fill(input, '# Hello world');
  await userEvent.keyboard('{Enter}');

  const messages = screen.getByPart('message-item').all();
  expect(messages.length).toBe(2);

  // The default renderer is async so wait for the DOM to be ready
  await nextFrame();

  let message = screen.getByText('Hello world');

  expect(message).toBeVisible();
  expect(message.element().tagName).toMatch(/h1/i);

  await userEvent.fill(input, '```ts\nconst chat = document.createElement("igc-chat");\n```');
  await userEvent.keyboard('{Enter}');
  await nextFrame();

  message = screen.getByText(/^const/);
  expect(message).toBeVisible();

  const shikiContainer = message.element().closest('pre');
  expect(shikiContainer?.classList.contains('shiki')).to.be.true;
  expect(shikiContainer?.classList.contains('shiki')).to.be.true;

  await userEvent.fill(input, 'Powered by [Infragistics](https://infragistics.com/)');
  await userEvent.keyboard('{Enter}');
  await nextFrame();

  message = screen.getByText(/Infragistics/);
  expect(message).toBeVisible();
  expect(message.element().tagName).toMatch(/a/i);
});

async function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

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
