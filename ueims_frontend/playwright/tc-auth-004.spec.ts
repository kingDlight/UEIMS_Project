import { test, expect } from '@playwright/test';

test('TC-AUTH-004: Đăng nhập bỏ trống trường', async ({ page }) => {
  // 1. Khởi động trình duyệt web và truy cập vào URL của trang đăng nhập
  await page.goto('/login');

  // 2. Cố tình không nhập liệu (để trống) tại trường email hoặc mật khẩu
  await page.getByLabel('Email').fill('');
  await page.getByLabel('Password').fill('');

  // 3. Tìm và click xác nhận vào nút Đăng nhập
  await page.getByRole('button', { name: 'LOGIN' }).click();

  // Verify: Hiển thị lỗi validation yêu cầu nhập đầy đủ, URL vẫn ở /login
  await expect(page).toHaveURL(/.*login/);
  
  // Xác nhận xuất hiện các lỗi validation bắt buộc của Antd Form
  const errors = page.locator('.ant-form-item-explain-error');
  await expect(errors).toHaveCount(2); // Cả email và password đều báo lỗi
});
