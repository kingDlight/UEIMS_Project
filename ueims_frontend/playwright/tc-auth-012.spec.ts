import { test, expect } from '@playwright/test';

test('TC-AUTH-012: Đặt lại mật khẩu - Link hết hạn', async ({ page }) => {
  // Mock API reset password thất bại do token hết hạn
  await page.route('**/auth/reset-password', async route => {
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 2004,
        message: "Reset token has expired or is invalid",
        result: null
      })
    });
  });

  // 1. Đi đến link reset password với token đã hết hạn
  await page.goto('/reset-password?token=expired-reset-token');

  // 2. Điền thông tin mật khẩu mới
  await page.locator('#newPassword').fill('ValidPassword123!');
  await page.locator('#confirmPassword').fill('ValidPassword123!');

  // 3. Click submit
  await page.locator('button[type="submit"]').click();

  // Verify: Báo lỗi link hết hạn hoặc không hợp lệ
  const errorMsg = page.locator('.ant-message-error');
  await expect(errorMsg).toBeVisible();
  await expect(errorMsg).toContainText(/expired|hết hạn|invalid/i);
});
