import { test, expect } from '@playwright/test';

test('TC-AUTH-020: Đổi mật khẩu - Trùng pass cũ', async ({ page }) => {
  // Mock API đổi mật khẩu thất bại (trùng pass cũ)
  await page.route('**/auth/change-password', async route => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 2005,
        message: "New password must be different from the old password",
        result: null
      })
    });
  });

  // 1. Đăng nhập trước
  await page.goto('/login');
  await page.getByLabel('Email').fill('myplancantfail@gmail.com');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Chờ navigation sau khi login - tăng timeout để ổn định hơn
  await page.waitForURL(/.*dashboard/, { timeout: 15000 });

  // 2. Mở Account Menu và click Change Password
  await page.locator('.modern-account-wrapper').click();
  await page.locator('.modern-menu-item', { hasText: /change\s*password|đổi\s*mật\s*khẩu/i }).click();

  // 3. Điền mật khẩu mới giống mật khẩu cũ
  await page.locator('#oldPassword').fill('1234567890');
  await page.locator('#newPassword').fill('1234567890');
  await page.locator('#confirmPassword').fill('1234567890');

  // 4. Click Save Changes
  await page.getByRole('button', { name: /save\s*changes|lưu/i }).click();

  // Verify: Báo lỗi mật khẩu mới phải khác mật khẩu hiện tại
  const errorMsg = page.locator('.ant-form-item-explain-error, .ant-message-error').first();
  await expect(errorMsg).toBeVisible();
});
