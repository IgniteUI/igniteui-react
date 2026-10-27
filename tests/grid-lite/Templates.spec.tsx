import { StrictMode } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import {
  AsyncTemplate,
  ClearedTemplate,
  FailingTemplate,
  FunctionResultTemplate,
  OptionalTemplate,
  StatefulTemplate,
  SuspendingTemplate,
} from './Templates';

afterEach(() => vi.restoreAllMocks());

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const muteLog = () => vi.spyOn(console, 'error').mockImplementation(() => {});

test('render props observe updated React state', async () => {
  render(<StatefulTemplate />);

  await expect.element(page.getByText('V:1/C:0', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Increment' }).click();

  await expect.element(page.getByText('V:1/C:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('V:2/C:1', { exact: true })).toBeVisible();
});

test('a render prop passed as undefined falls back to the default rendering', async () => {
  render(<OptionalTemplate />);

  await expect.element(page.getByText('V:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('id', { exact: true })).toBeVisible();
});

test('a cleared render prop falls back to the default rendering', async () => {
  render(<ClearedTemplate />);

  await expect.element(page.getByText('V:1', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Clear template' }).click();

  await expect.element(page.getByText('1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('V:1', { exact: true })).not.toBeInTheDocument();
});

test('a render prop added on a later render does not evict the existing ones', async () => {
  render(<OptionalTemplate />);

  await expect.element(page.getByText('V:1', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Add header template' }).click();

  await expect.element(page.getByText('H:id', { exact: true })).toBeVisible();
  await expect.element(page.getByText('V:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('V:2', { exact: true })).toBeVisible();
});

test('an async render prop keeps its content until the new one settles', async () => {
  let gate = Promise.withResolvers<void>();
  const wait = vi.fn(() => gate.promise);
  const open = () => {
    gate.resolve();
    gate = Promise.withResolvers<void>();
  };

  render(<AsyncTemplate wait={wait} />);

  await expect.poll(() => wait.mock.calls.length).toBeGreaterThan(0);
  open();
  await expect.element(page.getByText('A:1/C:0', { exact: true })).toBeVisible();

  const initial = wait.mock.calls.length;
  await page.getByRole('button', { name: 'Increment' }).click();

  await expect.element(page.getByText('Count:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('A:1/C:0', { exact: true })).toBeVisible();

  await expect.poll(() => wait.mock.calls.length).toBeGreaterThan(initial);
  open();
  await expect.element(page.getByText('A:1/C:1', { exact: true })).toBeVisible();

  // No render loop.
  const settled = wait.mock.calls.length;
  await delay(300);
  expect(wait).toHaveBeenCalledTimes(settled);
});

test.each(['sync', 'async', 'nested'] as const)(
  'a %s render prop failure stays in its cell',
  async (failure) => {
    const log = muteLog();
    const report = vi.spyOn(window, 'reportError').mockImplementation(() => {});

    render(<FailingTemplate failure={failure} />);

    await expect.element(page.getByText('V:2', { exact: true })).toBeVisible();

    // Logged once, by React: caught, not uncaught.
    await vi.waitFor(() => expect(log.mock.calls.flat()).toContainEqual(new Error('boom')));
    expect(report).not.toHaveBeenCalled();

    // Let the failure's re-render land.
    await delay(100);

    await expect.element(page.getByText('V:2', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Caught:boom', { exact: true })).not.toBeInTheDocument();
  },
);

test('a superseded async render prop does not report its failure', async () => {
  const log = muteLog();
  let gate = Promise.withResolvers<void>();
  const wait = vi.fn(() => gate.promise);

  render(<AsyncTemplate wait={wait} />);

  await expect.poll(() => wait.mock.calls.length).toBeGreaterThan(0);

  const stale = gate;
  gate = Promise.withResolvers<void>();
  const initial = wait.mock.calls.length;

  await page.getByRole('button', { name: 'Increment' }).click();
  await expect.poll(() => wait.mock.calls.length).toBeGreaterThan(initial);

  stale.reject(new Error('stale'));
  gate.resolve();

  await expect.element(page.getByText('A:1/C:1', { exact: true })).toBeVisible();
  expect(log.mock.calls.flat()).not.toContainEqual(new Error('stale'));
});

test('a render prop suspending with use() suspends its cell only', async () => {
  const log = muteLog();
  const loads = new Map<number, PromiseWithResolvers<string>>();

  const load = (id: number) => {
    const entry = loads.get(id) ?? Promise.withResolvers<string>();
    loads.set(id, entry);
    return entry.promise;
  };

  render(<SuspendingTemplate load={load} />);

  await expect.poll(() => loads.size).toBe(2);
  await expect.element(page.getByText('Alice', { exact: true })).toBeVisible();

  for (const [id, { resolve }] of loads) {
    resolve(`S:${id}`);
  }

  await expect.element(page.getByText('S:1', { exact: true })).toBeVisible();
  await expect.element(page.getByText('S:2', { exact: true })).toBeVisible();
  expect(log).not.toHaveBeenCalled();
});

test('an async render prop rejecting under StrictMode leaves no unhandled rejection', async () => {
  muteLog();
  const unhandled = vi.fn((event: PromiseRejectionEvent) => event.preventDefault());
  window.addEventListener('unhandledrejection', unhandled);

  try {
    render(
      <StrictMode>
        <FailingTemplate failure="async" />
      </StrictMode>,
    );

    await expect.element(page.getByText('V:2', { exact: true })).toBeVisible();
    await delay(100);

    expect(unhandled).not.toHaveBeenCalled();
  } finally {
    window.removeEventListener('unhandledrejection', unhandled);
  }
});

test('an async render prop resolving to a function does not call it', async () => {
  // React warns about function children.
  muteLog();

  render(<FunctionResultTemplate />);

  await expect.element(page.getByText('V:2', { exact: true })).toBeVisible();
  await delay(100);

  await expect.element(page.getByText('F', { exact: true })).not.toBeInTheDocument();
});
