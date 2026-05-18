import { test, expect } from '@playwright/test';

test('create project, fill overview, export', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Project name').fill('E2E Demo');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByLabel('App name').fill('E2E Demo');
  await page.getByLabel('One-line description').fill('Smoke test app');
  await page.waitForTimeout(800); // debounce
  await page.getByRole('button', { name: /export/i }).click();
  await expect(page.getByRole('dialog', { name: /export brief/i })).toBeVisible();
  await expect(page.locator('pre')).toContainText('E2E Demo');
});
