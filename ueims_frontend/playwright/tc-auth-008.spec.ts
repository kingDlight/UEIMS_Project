import { test, expect } from '@playwright/test';

test('TC-AUTH-008: Quên mật khẩu - Email hợp lệ', async ({ page }) => {
  // Mock API để tránh lỗi gửi mail SMTP thất bại từ Backend
  await page.route('**/auth/forgot-password', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 1000,
        message: "Success",
        result: null
      })
    });
  });

  // 1. Khởi động trình duyệt web và truy cập vào URL của trang Quên mật khẩu
  await page.goto('/forgot-password');

  // 2. Tại form nhập liệu, điền chính xác thông tin vào trường email hợp lệ
  await page.getByLabel('Email').fill('myplancantfail@gmail.com');

  // 3. Gửi yêu cầu
  await page.getByRole('button', { name: /send|gửi/i }).click();

  // Verify: Hiển thị thông báo đã gửi link reset thành công
  // Antd message global notice
  const successMessage = page.locator('.ant-message-success');
  await expect(successMessage).toBeVisible();
});
