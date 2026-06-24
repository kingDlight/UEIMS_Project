import { test, expect } from '@playwright/test';

test('TC-AUTH-002: Đăng nhập sai mật khẩu', async ({ page }) => {
  // 1. Khởi động trình duyệt web và truy cập vào URL của trang đăng nhập
  await page.goto('/login');

  // 2. Tại form nhập liệu, điền chính xác thông tin vào trường email đúng, mật khẩu sai
  await page.getByLabel('Email').fill('myplancantfail@gmail.com');
  await page.getByLabel('Password').fill('WrongPassword123');

  // 3. Tìm và click xác nhận vào nút Đăng nhập
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Verify: Hiển thị thông báo lỗi sai mật khẩu, không đăng nhập được (URL vẫn ở /login)
  await expect(page).toHaveURL(/.*login/);
  
  // Xác nhận xuất hiện thông báo lỗi của Antd Form hoặc Antd message thông báo lỗi
  const errorLocator = page.locator('.ant-form-item-explain-error, .ant-message-notice').first();
  await expect(errorLocator).toBeVisible();
});
