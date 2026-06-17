import { test, expect } from '@playwright/test';

// TC-AUTH-011: UC-04: Đặt lại mật khẩu thành công
test('TC-AUTH-011: Reset password successfully', async ({ page }) => {
  const validToken = 'valid-token-from-db';
  await page.goto(`/reset-password?token=${validToken}`);
  await page.fill('input[placeholder="A-Z, a-z, 0-9, !@#..."]', 'NewValidPass@2026');
  await page.fill('input[placeholder="Nhập lại mật khẩu mới"]', 'NewValidPass@2026');
  await page.click('button[type="submit"]');
  // Chờ message thông báo (thành công hoặc thất bại)
  await expect(page.locator('.ant-message-notice-content').first()).toBeVisible({ timeout: 10000 });
});
