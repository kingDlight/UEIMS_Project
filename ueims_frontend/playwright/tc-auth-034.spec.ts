import { test, expect } from '@playwright/test';

test('TC-AUTH-034: Ràng buộc role (BR)', async ({ page }) => {
  // Test scenario: User with insufficient role attempts to access admin pages
  // Login as a student (insufficient role)
  await page.goto('/login');
  await page.getByLabel('Email').fill('student38@fpt.edu.vn'); // Assuming this is a student
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForLoadState('networkidle');

  // Attempt to access admin page
  await page.goto('/admin/users');
  
  // Verify redirect to unauthorized or home (nó tự redirect về dashboard nếu không có quyền)
  await expect(page).toHaveURL(/.*dashboard/);
});
