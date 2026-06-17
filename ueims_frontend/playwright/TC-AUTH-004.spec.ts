import { test, expect } from '@playwright/test';

// TC-AUTH-004: UC-01: Đăng nhập bỏ trống trường
test('TC-AUTH-004: Login with empty fields', async ({ page }) => {
  await page.goto('/login');
  await page.click('button[type="submit"]');
  await expect(page.locator('.ant-form-item-explain-error').first()).toBeVisible();
});
