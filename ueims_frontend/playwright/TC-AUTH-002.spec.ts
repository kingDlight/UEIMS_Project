import { test, expect } from '@playwright/test';

// TC-AUTH-002: UC-01: Đăng nhập sai mật khẩu
test('TC-AUTH-002: Login with incorrect password', async ({ page }) => {
  await page.goto('/login');
  await page.fill('.auth-input', 'sv_test@fpt.edu.vn');
  await page.fill('.auth-input-password input', 'WrongPassword123!');
  await page.click('button[type="submit"]');

  // Kiểm tra lỗi hiển thị trong form (do hệ thống sử dụng form error cho sai password)
  await expect(page.locator('.ant-form-item-explain-error').first()).toBeVisible({ timeout: 10000 });
});
