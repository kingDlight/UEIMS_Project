import { test, expect } from '@playwright/test';

test('TC-AUTH-015: Đặt lại mật khẩu - Trùng mật khẩu cũ (BR)', async ({ page }) => {
  // Mock API báo lỗi trùng mật khẩu cũ
  await page.route('**/auth/reset-password', async route => {
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

  // 1. Đi đến link reset password
  await page.goto('/reset-password?token=valid-reset-token-123');

  // 2. Điền mật khẩu mới trùng với mật khẩu cũ
  await page.locator('#newPassword').fill('OldPassword123!');
  await page.locator('#confirmPassword').fill('OldPassword123!');

  // 3. Click submit
  await page.locator('button[type="submit"]').click();

  // Verify: Báo lỗi không được dùng lại mật khẩu cũ
  const errorMsg = page.locator('.ant-message-error');
  await expect(errorMsg).toBeVisible();
});
