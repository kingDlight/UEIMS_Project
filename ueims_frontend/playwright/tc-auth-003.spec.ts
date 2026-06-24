import { test, expect } from '@playwright/test';

test('TC-AUTH-003: Đăng nhập tài khoản không tồn tại', async ({ page }) => {
  // 1. Khởi động trình duyệt web và truy cập vào URL của trang đăng nhập
  await page.goto('/login');

  // 2. Tại form nhập liệu, điền chính xác thông tin vào trường email chưa đăng ký
  await page.getByLabel('Email').fill('notfound@fpt.edu.vn');
  await page.getByLabel('Password').fill('Wrong123!');

  // 3. Tìm và click xác nhận vào nút Đăng nhập
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Verify: Hiển thị thông báo lỗi tài khoản không tồn tại (URL vẫn ở /login)
  await expect(page).toHaveURL(/.*login/);
  
  // Kiểm tra thông báo lỗi của Antd Form cho trường email hoặc thông báo message lỗi chung
  const emailError = page.locator('.ant-form-item-explain-error, .ant-message-notice').first();
  await expect(emailError).toBeVisible();
});
