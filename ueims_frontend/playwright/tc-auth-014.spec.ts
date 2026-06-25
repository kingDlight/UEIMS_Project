import { test, expect } from '@playwright/test';

test('TC-AUTH-014: Đặt lại mật khẩu - Xác nhận sai', async ({ page }) => {
  // 1. Đi đến link reset password
  await page.goto('/reset-password?token=valid-reset-token-123');

  // 2. Điền thông tin vào trường xác nhận khác với mật khẩu mới
  await page.locator('#newPassword').fill('ValidPassword123!');
  await page.locator('#confirmPassword').fill('MismatchPassword123!');

  // 3. Click submit
  await page.locator('button[type="submit"]').click();

  // Verify: Báo lỗi mật khẩu xác nhận không khớp
  const errorMsg = page.locator('.ant-message-error');
  await expect(errorMsg).toBeVisible();
});
