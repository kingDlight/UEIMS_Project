import { test, expect } from '@playwright/test';

// TC-AUTH-012: UC-04: Đặt lại mật khẩu - Link hết hạn
test('TC-AUTH-012: Reset password with expired link', async ({ page }) => {
  const expiredToken = 'expired-token';
  await page.goto(`/reset-password?token=${expiredToken}`);
  await page.fill('input[placeholder="A-Z, a-z, 0-9, !@#..."]', 'NewValidPass@2026');
  await page.fill('input[placeholder="Nhập lại mật khẩu mới"]', 'NewValidPass@2026');
  await page.click('button[type="submit"]');
  // Sử dụng locator bao quát hơn
  await expect(page.locator('.ant-message-error').first()).toBeVisible({ timeout: 15000 });
});
