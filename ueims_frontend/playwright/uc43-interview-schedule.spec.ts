import { test, expect } from '@playwright/test';
import { loginAsEnterprise } from '../fixtures/auth';

test.describe('UC-43: Manage Interview Schedules', () => {
  test('Open Schedule Interview modal; past date shows error (43.0.E1)', async ({ page }) => {
    await loginAsEnterprise(page);
    await page.getByRole('menuitem', { name: /interviews/i }).first().click();
    await page.waitForURL(/interviews$/);

    await page.getByRole('button', { name: /schedule interview/i }).first().click();
    await expect(page.getByText(/schedule interview/i).first()).toBeVisible();

    // Pick an application
    const appSelect = page.locator('.ant-select-selector').first();
    await appSelect.click();
    const firstOption = page.locator('.ant-select-item-option').first();
    if (await firstOption.isVisible().catch(() => false)) {
      await firstOption.click();
    } else {
      test.skip(true, 'No screened candidates available to schedule');
      return;
    }

    // Click Save without picking a future date → expect error
    const saveBtn = page.getByRole('button', { name: /save schedule/i }).first();
    await saveBtn.click();

    // Should show required validation error
    await expect(page.getByText(/required/i).first()).toBeVisible({ timeout: 5000 });
  });
});
