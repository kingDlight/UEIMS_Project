import { test, expect } from '@playwright/test';

// TC-AUTH-014: UC-04: Đặt lại mật khẩu - Xác nhận sai
test('TC-AUTH-014: Reset password with mismatched confirmation', async ({ page }) => {
  // 1. Giả lập truy cập link reset hợp lệ
  const validToken = 'valid-token-from-db';
  await page.goto(`/reset-password?token=${validToken}`);

  // 2. Điền mật khẩu mới và xác nhận không khớp
  await page.fill('input[placeholder="A-Z, a-z, 0-9, !@#..."]', 'NewStrongPassword123!');
  await page.fill('input[placeholder="Nhập lại mật khẩu mới"]', 'MismatchPassword123!');

  // 3. Lưu
  await page.click('button[type="submit"]');

  // 4. Kiểm tra kết quả: Báo lỗi mật khẩu không khớp
  await expect(page.locator('.ant-message-error')).toContainText('Mật khẩu xác nhận không khớp!');
});
