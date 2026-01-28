import { afterAll, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import QueryBuilder from './QueryBuilder';

afterAll(() => vi.restoreAllMocks());

test('QueryBuilder', async () => {
  render(<QueryBuilder />);

  const entitySelect = page.getByRole('combobox', { name: 'Select entity' });
  await expect.element(entitySelect).toBeVisible();

  // header
  await expect.element(page.getByText('Header title')).toBeVisible();
  await expect.element(page.getByText('header content', { exact: true })).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'header content button' })).toBeVisible();

  const mockLog = vi.spyOn(console, 'log');
  await entitySelect.click();
  await expect.element(page.getByRole('option')).toBeVisible();
  await page.getByRole('option', { hasText: 'Customers' }).click();
  await expect.element(entitySelect).toHaveValue('Customers');
  expect(mockLog).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'expressionTreeChange',
      detail: expect.objectContaining({ entity: 'Customers' }),
    }),
  );

  // add orders entity
  await page.getByRole('button', { name: 'With orders entity' }).click();
  await entitySelect.click();
  await expect.element(page.getByRole('option').filter({ hasText: 'Orders' })).toBeVisible();

  // search value template:
  await page.getByRole('button', { name: 'Condition' }).click();
  await expect.element(page.getByTestId('search-template')).toBeVisible();
  await expect.element(page.getByTestId('search-template')).not.toHaveValue();
});
