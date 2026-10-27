import { expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { TemplatedCombo } from './Combo';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('template renders do not set the element properties again', async () => {
  render(<TemplatedCombo />);

  await page.getByRole('combobox').click();
  await expect.element(page.getByText('T:AAPL', { exact: true })).toBeVisible();

  const combo = document.querySelector('igc-combo')!;
  const sets = vi.spyOn(combo, 'singleSelect', 'set');

  // Filters the list, so the item templates render again.
  await userEvent.keyboard('n');
  await expect.element(page.getByText('T:NVDA', { exact: true })).toBeVisible();
  await delay(300);

  expect(sets).not.toHaveBeenCalled();
  await expect.element(page.getByText('T:AAPL', { exact: true })).not.toBeInTheDocument();
});

test('a click in a template fires the onClick of the wrapper once', async () => {
  const onClick = vi.fn();
  render(<TemplatedCombo onClick={onClick} />);

  await page.getByRole('combobox').click();
  await expect.element(page.getByText('T:MSFT', { exact: true })).toBeVisible();
  onClick.mockClear();

  await page.getByText('T:MSFT', { exact: true }).click();

  expect(onClick).toHaveBeenCalledOnce();
});
