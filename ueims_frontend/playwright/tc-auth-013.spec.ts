import { test, expect } from '@playwright/test';

test('TC-AUTH-013: Đặt lại mật khẩu - Mật khẩu yếu (BR)', async ({ page }) => {
  // 1. Đi đến link reset password
  await page.goto('/reset-password?token=valid-reset-token-123');

  // 2. Nhập mật khẩu yếu (Ví dụ quá ngắn)
  await page.locator('#newPassword').fill('123');
  await page.locator('#confirmPassword').fill('123');

  // 3. Click submit
  await page.locator('button[type="submit"]').click();

  // Verify: Báo lỗi validation mật khẩu không đủ độ mạnh
  const errorMsg = page.locator('.ant-message-error');
  await expect(errorMsg).toBeVisible();
});
