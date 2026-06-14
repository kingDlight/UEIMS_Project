import { test, expect } from '@playwright/test';
import { loginAsEnterprise } from '../fixtures/auth';

test.describe('UC-49: Report Critical Incident (BR-41)', () => {
  test('Submitting without category + description shows error', async ({ page }) => {
    await loginAsEnterprise(page);
    await page.getByRole('menuitem', { name: /incidents/i }).first().click();
    await page.waitForURL(/incidents$/);

    // Open report modal
    await page.getByRole('button', { name: /report incident/i }).first().click();
    await expect(page.getByText(/report critical incident/i).first()).toBeVisible();

    // Click Submit Report without filling anything
    const submitBtn = page.getByRole('button', { name: /submit report/i }).first();
    await submitBtn.click();

    // Both required fields should be highlighted
    await expect(page.getByText(/pick a student|select a category|description|required/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Submitting valid incident succeeds', async ({ page }) => {
    await loginAsEnterprise(page);
    await page.getByRole('menuitem', { name: /incidents/i }).first().click();
    await page.waitForURL(/incidents$/);

    await page.getByRole('button', { name: /report incident/i }).first().click();

    // Pick a student
    const studentSelect = page.locator('.ant-select-selector').first();
    await studentSelect.click();
    const firstStudentOption = page.locator('.ant-select-item-option').first();
    if (!(await firstStudentOption.isVisible().catch(() => false))) {
      test.skip(true, 'No students assigned to this enterprise in test data');
      return;
    }
    await firstStudentOption.click();

    // Pick category
    const categorySelect = page.locator('.ant-select-selector').nth(1);
    await categorySelect.click();
    await page.locator('.ant-select-item-option').first().click();

    // Fill description
    await page.locator('textarea').first().fill('Student was repeatedly absent without prior notice during week 5 of the internship program.');

    // Submit
    await page.getByRole('button', { name: /submit report/i }).first().click();
    await expect(page.getByText(/incident reported successfully|training manager has been notified/i).first()).toBeVisible({ timeout: 5000 });
  });
});
