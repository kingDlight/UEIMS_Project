import { test, expect } from '@playwright/test';

// TC-AUTH-013: UC-04: Đặt lại mật khẩu - Mật khẩu yếu (BR)
test('TC-AUTH-013: Reset password with weak password', async ({ page }) => {
  // 1. Giả lập truy cập link reset hợp lệ
  const validToken = 'valid-token-from-db';
  await page.goto(`/reset-password?token=${validToken}`);

  // 2. Điền mật khẩu quá ngắn/yếu
  await page.fill('input[placeholder="A-Z, a-z, 0-9, !@#..."]', '123');
  await page.fill('input[placeholder="Nhập lại mật khẩu mới"]', '123');

  // 3. Lưu
  await page.click('button[type="submit"]');

  // 4. Kiểm tra kết quả: Báo lỗi validation
  await expect(page.locator('.ant-message-error')).toContainText('Mật khẩu chưa đủ mạnh');
});
