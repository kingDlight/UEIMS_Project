import { test, expect } from '@playwright/test';
import { loginAsEnterprise } from './fixtures/auth';

test.describe('UC-44: Record Interview Result', () => {
  test('Fail without notes shows warning; Fail with notes succeeds (44.0.E1)', async ({ page }) => {
    await loginAsEnterprise(page);
    await page.goto('/enterprise-dashboard/results');

    // Look for the first Fail button
    const failBtn = page.getByRole('button', { name: /^fail$/i }).first();
    if (!(await failBtn.isVisible().catch(() => false))) {
      test.skip(true, 'No completed interviews ready for grading');
      return;
    }
    await failBtn.click();

    // Confirm modal opens
    await expect(page.getByText(/confirm fail|justification/i).first()).toBeVisible();

    // Click Confirm without notes → warning
    await page.getByRole('button', { name: /^confirm$/i }).first().click();
    await expect(page.getByText(/justification|required/i).first()).toBeVisible({ timeout: 3000 });

    // Fill notes
    await page.locator('textarea').first().fill('Candidate was unable to answer basic system design questions.');
    await page.getByRole('button', { name: /^confirm$/i }).first().click();
    await expect(page.getByText(/recruitment results saved/i).first()).toBeVisible({ timeout: 5000 });
  });
});

