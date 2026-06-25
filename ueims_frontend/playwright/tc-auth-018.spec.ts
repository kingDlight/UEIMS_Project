import { test, expect } from '@playwright/test';

test('TC-AUTH-018: Đổi mật khẩu - Pass mới không khớp', async ({ page }) => {
  // 1. Đăng nhập trước
  await page.goto('/login');
  await page.getByLabel('Email').fill('myplancantfail@gmail.com');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  // Chờ navigation sau khi login
  await page.waitForURL(/.*dashboard/, { timeout: 15000 });

  // 2. Mở Account Menu và click Change Password
  await page.locator('.modern-account-wrapper').click();
  await page.locator('.modern-menu-item', { hasText: /change\s*password|đổi\s*mật\s*khẩu/i }).click();

  // 3. Điền mật khẩu mới và mật khẩu xác nhận không khớp
  await page.locator('#oldPassword').fill('1234567890');
  await page.locator('#newPassword').fill('NewPassword123!');
  await page.locator('#confirmPassword').fill('MismatchPassword123!');

  // 4. Click Save Changes
  await page.getByRole('button', { name: /save\s*changes|lưu/i }).click();

  // Verify: Báo lỗi xác nhận không khớp (Lỗi hiển thị ngay trên Form của Antd)
  const errorMsg = page.locator('.ant-form-item-explain-error');
  await expect(errorMsg).toBeVisible();
});
