import { test, expect } from '@playwright/test';

test('TC-AUTH-019: Đổi mật khẩu - Pass mới quá yếu', async ({ page }) => {
  // 1. Đăng nhập trước
  await page.goto('/login');
  await page.getByLabel('Email').fill('myplancantfail@gmail.com');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  // Chờ navigation sau khi login
  await page.waitForURL(/.*dashboard/);

  // 2. Mở Account Menu và click Change Password
  await page.locator('.modern-account-wrapper').click();
  await page.locator('.modern-menu-item', { hasText: /change\s*password|đổi\s*mật\s*khẩu/i }).click();

  // 3. Điền mật khẩu mới quá ngắn/yếu (Ví dụ: '123')
  await page.locator('#oldPassword').fill('1234567890');
  await page.locator('#newPassword').fill('123');
  await page.locator('#confirmPassword').fill('123');

  // 4. Click Save Changes
  await page.getByRole('button', { name: /save\s*changes|lưu/i }).click();

  // Verify: Báo lỗi validation độ mạnh mật khẩu (Lỗi của Antd Form)
  const errorMsg = page.locator('.ant-form-item-explain-error');
  await expect(errorMsg).toBeVisible();
});
