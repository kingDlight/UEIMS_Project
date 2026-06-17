import { test, expect } from '@playwright/test';

// TC-AUTH-008: UC-03: Quên mật khẩu - Email hợp lệ
// Dữ liệu: TD-USR-01 (sv_test@fpt.edu.vn)
test('TC-AUTH-008: Forgot password with valid email', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.fill('input[placeholder="name@example.com"]', 'sv_test@fpt.edu.vn');
  await page.click('button[type="submit"]');
  // Sử dụng locator tổng quát hơn để chờ message
  await page.waitForLoadState('networkidle');
  // Antd message container usually has class .ant-message
  await expect(page.locator('.ant-message').first()).toBeVisible({ timeout: 20000 });
});
