import { test, expect } from '@playwright/test';

test('TC-AUTH-031: Cập nhật trạng thái Active/Inactive', async ({ page }) => {
  // 1. Admin login
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForLoadState('networkidle');

  // 2. Truy cập User Management
  await page.goto('/admin/users');
  await page.waitForLoadState('networkidle');

  // Đợi danh sách user load xong
  await expect(page.locator('.ant-spin-spinning')).not.toBeVisible();
  
  // 3. Tìm nút Lock hoặc Unlock button trên card
  // Sử dụng selector tìm button chứa text Lock hoặc Unlock
  const lockUnlockButton = page.locator('button:has-text("Lock"), button:has-text("Unlock")').first();
  await lockUnlockButton.waitFor({ state: 'visible', timeout: 20000 });
  await lockUnlockButton.click();
  
  // 4. Confirm in Modal
  const confirmButton = page.getByRole('button', { name: /Yes, (Deactivate|Reactivate)/i });
  if (await confirmButton.isVisible()) {
    await confirmButton.click();
  }
  
  // 5. Verify: Success message
  await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 20000 });
});
