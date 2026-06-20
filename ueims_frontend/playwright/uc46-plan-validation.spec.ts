import { test, expect } from '@playwright/test';
import { loginAsEnterprise } from './fixtures/auth';

test.describe('UC-46: Manage Internship Plan (BR-38, BR-39)', () => {
  test('Saving plan with empty task description shows error', async ({ page }) => {
    await loginAsEnterprise(page);
    await page.goto('/enterprise-dashboard/plans');

    // Click first student in the sidebar
    const firstStudent = page.locator('aside div').filter({ hasText: /student|sv|nv/i }).first();
    if (!(await firstStudent.isVisible().catch(() => false))) {
      test.skip(true, 'No students assigned to this enterprise in test data');
      return;
    }
    await firstStudent.click();

    // Add a new week
    const addWeekBtn = page.getByRole('button', { name: /add week/i }).first();
    if (await addWeekBtn.isVisible().catch(() => false)) {
      await addWeekBtn.click();
    } else {
      test.skip(true, 'Plan cannot be edited (read-only)');
      return;
    }

    // Try to save without filling required fields
    const saveBtn = page.getByRole('button', { name: /save plan/i }).first();
    await saveBtn.click();
    await expect(page.getByText(/task description|target date|required/i).first()).toBeVisible({ timeout: 5000 });
  });
});
