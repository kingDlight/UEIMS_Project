import { test, expect } from '@playwright/test';
import { loginAsEnterprise } from './fixtures/auth';

test.describe('UC-48: Review Weekly Report (BR-40)', () => {
  test('Reject without feedback shows warning (48.1.E1)', async ({ page }) => {
    await loginAsEnterprise(page);
    await page.goto('/enterprise-dashboard/reports');

    // Click first report card
    const firstCard = page.locator('div').filter({ hasText: /week/i }).first();
    if (!(await firstCard.isVisible().catch(() => false))) {
      test.skip(true, 'No weekly reports in test data');
      return;
    }
    await firstCard.click();

    // Click Reject
    const rejectBtn = page.getByRole('button', { name: /^reject$/i }).first();
    if (!(await rejectBtn.isVisible().catch(() => false))) {
      test.skip(true, 'Report is not in a state that can be rejected');
      return;
    }
    await rejectBtn.click();

    // Click Confirm without feedback
    await page.getByRole('button', { name: /^confirm$/i }).first().click();
    await expect(page.getByText(/feedback is required|reason/i).first()).toBeVisible({ timeout: 3000 });
  });
});
