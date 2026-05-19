import { test, expect } from '@playwright/test';

test('create project, fill overview, export', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Project name').fill('E2E Demo');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByLabel('App name').fill('E2E Demo');
  await page.getByLabel('One-line description').fill('Smoke test app');

  // Open Brand accordion + Tone page
  await page.getByRole('button', { name: /Toggle Brand children/i }).click();
  await page.getByRole('button', { name: /^Tone/ }).click();
  await page.getByRole('button', { name: /^playful$/ }).click();
  await page.getByRole('button', { name: /Add tone word/i }).click();
  await page.getByPlaceholder('tone word').fill('cosy');
  await page.keyboard.press('Enter');

  // Colour direction + new colour
  await page.getByRole('button', { name: /Colour direction/ }).click();
  await page.getByRole('button', { name: /\+ Add colour/ }).click();
  await page.getByLabel('Colour name').fill('Primary');
  const hexInput = page.getByLabel('HEX value');
  await hexInput.fill('#3366ff');
  await hexInput.blur();

  await page.waitForTimeout(800); // debounce

  await page.getByRole('button', { name: /export/i }).click();
  await expect(page.getByRole('dialog', { name: /export brief/i })).toBeVisible();
  await expect(page.locator('pre')).toContainText('E2E Demo');
  await expect(page.locator('pre')).toContainText('playful');
  await expect(page.locator('pre')).toContainText('cosy');
  await expect(page.locator('pre')).toContainText('Primary');
  await expect(page.locator('pre')).toContainText('#3366ff');
});
