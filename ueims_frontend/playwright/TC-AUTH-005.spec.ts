import { test, expect } from '@playwright/test';

// TC-AUTH-005: UC-01: Đăng nhập tài khoản bị khóa (BR)
// Dữ liệu: TD-USR-02 (locked_user@fpt.edu.vn / Valid@2026)
test('TC-AUTH-005: Login with locked account', async ({ page }) => {
  await page.goto('/login');
  await page.fill('.auth-input', 'locked_user@fpt.edu.vn');
  await page.fill('.auth-input-password input', 'Valid@2026');
  await page.click('button[type="submit"]');
  await expect(page.locator('.ant-message-error')).toContainText('Account locked');
});
