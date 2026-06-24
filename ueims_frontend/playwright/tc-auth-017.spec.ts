import { test, expect } from '@playwright/test';

test('TC-AUTH-017: Đổi mật khẩu - Sai pass cũ', async ({ page }) => {
  // Mock API đổi mật khẩu thất bại (sai pass cũ)
  await page.route('**/auth/change-password', async route => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 2002,
        message: "Current password is incorrect!",
        result: null
      })
    });
  });

  // 1. Đăng nhập trước
  await page.goto('/login');
  await page.getByLabel('Email').fill('myplancantfail@gmail.com');
  await page.getByLabel('Password').fill('1234567890');
  // Click nút đăng nhập
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Chờ cho ứng dụng chuyển hướng xong
  await page.waitForLoadState('networkidle');
  await page.waitForURL(/.*dashboard/, { timeout: 15000 });
  await expect(page).toHaveURL(/.*dashboard/);

  // 2. Mở Account Menu và click Change Password
  await page.locator('.modern-account-wrapper').click();
  await page.locator('.modern-menu-item', { hasText: /change\s*password|đổi\s*mật\s*khẩu/i }).click();

  // 3. Điền mật khẩu cũ sai
  await page.locator('#oldPassword').fill('WrongCurrentPassword');
  await page.locator('#newPassword').fill('NewPassword123!');
  await page.locator('#confirmPassword').fill('NewPassword123!');

  // 4. Click Save Changes
  await page.getByRole('button', { name: /save\s*changes|lưu/i }).click();

  // Verify: Báo lỗi mật khẩu hiện tại không đúng
  const errorMsg = page.locator('.ant-form-item-explain-error, .ant-message-error').first();
  await expect(errorMsg).toBeVisible();
});
