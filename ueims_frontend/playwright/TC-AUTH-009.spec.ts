import { test, expect } from '@playwright/test';

// TC-AUTH-009: UC-03: Quên mật khẩu - Email không tồn tại
// Dữ liệu: TD-USR-04 (notfound@fpt.edu.vn)
test('TC-AUTH-009: Forgot password with non-existent email', async ({ page }) => {
  await page.goto('/forgot-password');
  // Use placeholder selector
  await page.fill('input[placeholder="name@example.com"]', 'notfound@fpt.edu.vn');
  await page.click('button[type="submit"]');
  await expect(page.locator('.ant-message-error')).toContainText('Email không tồn tại trong hệ thống.');
});
