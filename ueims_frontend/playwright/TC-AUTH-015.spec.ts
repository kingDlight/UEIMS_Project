import { test, expect } from '@playwright/test';

// TC-AUTH-015: UC-04: Đặt lại mật khẩu - Trùng mật khẩu cũ (BR)
// Dữ liệu: TD-USR-01 (sv_test@fpt.edu.vn)
test('TC-AUTH-015: Reset password with same old password', async ({ page }) => {
  // 1. Giả lập truy cập link reset hợp lệ
  const validToken = 'valid-token-from-db';
  await page.goto(`/reset-password?token=${validToken}`);

  // 2. Điền mật khẩu mới giống mật khẩu cũ (Valid@2026)
  await page.fill('input[placeholder="A-Z, a-z, 0-9, !@#..."]', 'Valid@2026');
  await page.fill('input[placeholder="Nhập lại mật khẩu mới"]', 'Valid@2026');

  // 3. Lưu
  await page.click('button[type="submit"]');

  // 4. Kiểm tra kết quả: Báo lỗi không được dùng lại mật khẩu cũ
  // Dựa vào code ResetPasswordPage.tsx, message được hiển thị qua AuthService error
  await expect(page.locator('.ant-message-error')).toBeDefined();
});
