import { test, expect } from '@playwright/test';

test('TC-AUTH-016: Đổi mật khẩu thành công', async ({ page }) => {
  // Mock API đổi mật khẩu thành công
  await page.route('**/auth/change-password', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 1000,
        message: "Success",
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
  await expect(page).toHaveURL(/.*dashboard/);

  // 2. Mở Account Menu và click Change Password
  await page.locator('.modern-account-wrapper').click();
  await page.locator('.modern-menu-item', { hasText: /change\s*password|đổi\s*mật\s*khẩu/i }).click();

  // 3. Điền mật khẩu cũ, mật khẩu mới hợp lệ, và xác nhận
  await page.locator('#oldPassword').fill('1234567890');
  await page.locator('#newPassword').fill('NewPassword123!');
  await page.locator('#confirmPassword').fill('NewPassword123!');

  // 4. Click Save Changes để gửi yêu cầu
  await page.getByRole('button', { name: /save\s*changes|lưu/i }).click();

  // Verify: Đổi mật khẩu thành công, hiển thị thông báo
  const successMsg = page.locator('.ant-message-success');
  await expect(successMsg).toBeVisible();
});
