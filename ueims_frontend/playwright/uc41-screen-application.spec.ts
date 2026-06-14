import { test, expect } from '@playwright/test';
import { loginAsEnterprise } from '../fixtures/auth';

test.describe('UC-41: Screen Application', () => {
  test('Reject without reason shows warning; Reject with reason succeeds', async ({ page }) => {
    await loginAsEnterprise(page);
    await page.getByRole('menuitem', { name: /applicants/i }).first().click();
    await page.waitForURL(/applicants$/);

    // Open any PENDING applicant
    const pendingColumn = page.locator('text=/pending/i').first();
    if (!(await pendingColumn.isVisible().catch(() => false))) {
      test.skip(true, 'No PENDING applicants in test data');
      return;
    }

    // Find first card under pending column
    const firstCard = page.locator('div').filter({ hasText: /student|studentname/i }).first();
    await firstCard.click().catch(() => {});

    // Click Reject in the detail modal
    const rejectBtn = page.getByRole('button', { name: /^reject$/i }).first();
    await rejectBtn.click();

    // Confirm modal opens
    await expect(page.getByText(/confirm rejection|reason/i).first()).toBeVisible({ timeout: 5000 });

    // Click Confirm without filling reason → should show warning
    await page.getByRole('button', { name: /^confirm$/i }).first().click();
    await expect(page.getByText(/justification|reason|required/i).first()).toBeVisible({ timeout: 3000 });

    // Fill reason and confirm
    const reasonArea = page.locator('textarea').first();
    await reasonArea.fill('Skills do not match the role requirements for this semester.');
    await page.getByRole('button', { name: /^confirm$/i }).first().click();

    // Wait for success toast
    await expect(page.getByText(/status updated successfully|application status updated/i).first()).toBeVisible({ timeout: 5000 });
  });
});
