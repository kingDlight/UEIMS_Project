import { test, expect } from '@playwright/test';

test('TC-AUTH-009: Quên mật khẩu - Email không tồn tại', async ({ page }) => {
  // 1. Click vào ô input tương ứng và tiến hành nhập email không tồn tại
  await page.goto('/forgot-password');
  await page.getByLabel('Email').fill('notfound@fpt.edu.vn');

  // 2. Gửi yêu cầu
  await page.getByRole('button', { name: /send|gửi/i }).click();

  // Verify: Hiển thị thông báo không tìm thấy tài khoản (error message)
  const errorMessage = page.locator('.ant-message-error');
  await expect(errorMessage).toBeVisible();
});
