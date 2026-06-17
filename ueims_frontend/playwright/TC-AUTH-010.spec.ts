import { test, expect } from '@playwright/test';

// TC-AUTH-010: Quên mật khẩu - Định dạng email sai (BR)
test('TC-AUTH-010: Forgot password with invalid email format', async ({ page }) => {
  await page.goto('/forgot-password');
  // Use placeholder selector
  await page.fill('input[placeholder="name@example.com"]', 'invalid-email-format');
  await page.click('button[type="submit"]');
  await expect(page.locator('.ant-form-item-explain-error')).toContainText('Email không hợp lệ!');
});
