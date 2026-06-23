import { test, expect } from '@playwright/test';

test('TC-AUTH-010: Quên mật khẩu - Định dạng email sai (BR)', async ({ page }) => {
  // 1. Click vào ô input tương ứng và tiến hành nhập định dạng sai (vd: abc.com)
  await page.goto('/forgot-password');
  await page.getByLabel('Email').fill('invalid-email-format.com');

  // 2. Gửi yêu cầu
  await page.getByRole('button', { name: /send|gửi/i }).click();

  // Verify: Hiển thị lỗi validation định dạng email
  const errorMsg = page.locator('.ant-form-item-explain-error');
  await expect(errorMsg).toBeVisible();
});
