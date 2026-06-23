import { test, expect } from '@playwright/test';

test('TC-AUTH-001: Đăng nhập thành công', async ({ page }) => {
  // 1. Khởi động trình duyệt web và truy cập vào URL của trang đăng nhập
  console.log('Current URL:', page.url());
  await page.goto('/login');

  // 2. Tại form nhập liệu, điền chính xác thông tin vào trường email và mật khẩu đúng
  await page.getByLabel('Email').fill('demo.student@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');

  // 3. Tìm và click xác nhận vào nút Đăng nhập
  page.on('console', msg => console.log('Browser log:', msg.text()));
  
  // Click nút đăng nhập
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Chờ URL thay đổi (SPA navigation)
  await page.waitForURL(/.*dashboard/, { timeout: 10000 }).catch(e => console.log('Timeout waiting for URL:', page.url()));
  
  console.log('Post-login URL:', page.url());

  // Verify: Đăng nhập thành công, chuyển hướng đến Dashboard tương ứng role
  await expect(page).toHaveURL(/.*dashboard/);
});
