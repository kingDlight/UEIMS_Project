import { test, expect } from '@playwright/test';

// TC-AUTH-003: UC-01: Đăng nhập tài khoản không tồn tại
// Dữ liệu: TD-USR-04 (notfound@fpt.edu.vn / Wrong123!)
test('TC-AUTH-003: Login with non-existent account', async ({ page }) => {
  await page.goto('/login');
  await page.fill('.auth-input', 'notfound@fpt.edu.vn');
  await page.fill('.auth-input-password input', 'Wrong123!');
  await page.click('button[type="submit"]');
  await expect(page.locator('.ant-form-item-explain-error')).toContainText('Account does not exist in the system.');
});
