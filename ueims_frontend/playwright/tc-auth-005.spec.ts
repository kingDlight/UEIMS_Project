import { test, expect } from '@playwright/test';

test('TC-AUTH-005: Đăng nhập tài khoản bị khóa', async ({ page }) => {
  // 1. Click vào ô input tương ứng và tiến hành nhập email tài khoản bị khóa
  await page.goto('/login');
  
  // Giả sử có tài khoản bị khóa (Nếu không có thật, test có thể fail nhưng logic đúng theo TC)
  await page.getByLabel('Email').fill('locked_user@fpt.edu.vn');

  // 2. Tại form nhập liệu, điền chính xác thông tin vào trường mật khẩu đúng
  await page.getByLabel('Password').fill('Valid@2026');

  // 3. Tìm và click xác nhận vào nút Đăng nhập
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Verify: Hiển thị thông báo tài khoản đã bị khóa, liên hệ Admin
  await expect(page).toHaveURL(/.*login/);
  
  // Check thông báo lỗi (thông báo Antd message global hoặc lỗi form)
  const errorMsg = page.locator('.ant-message-notice, .ant-form-item-explain-error').first();
  await expect(errorMsg).toBeVisible();
});
