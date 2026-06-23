import { test, expect } from '@playwright/test';

test('TC-AUTH-011: Đặt lại mật khẩu thành công', async ({ page }) => {
  // Mock API reset password thành công
  await page.route('**/auth/reset-password', async route => {
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

  // 1. Đi đến link reset password với token hợp lệ
  await page.goto('/reset-password?token=valid-reset-token-123');
  
  // Debug: In nội dung trang để xem có bị crash không
  const content = await page.content();
  console.log('Page Content HTML:', content);

  // 2. Tại form nhập liệu, điền chính xác thông tin vào trường mật khẩu mới và xác nhận
  await page.locator('#newPassword').fill('ValidPassword123!');
  await page.locator('#confirmPassword').fill('ValidPassword123!');

  // 3. Click submit để đặt lại mật khẩu (Sử dụng selector kiểu nút submit của form)
  await page.locator('button[type="submit"]').click();

  // Verify: Hiển thị thông báo thành công và chuyển hướng đến trang đăng nhập
  const successMsg = page.locator('.ant-message-success');
  await expect(successMsg).toBeVisible();

  await page.waitForURL(/.*login/, { timeout: 5000 });
  await expect(page).toHaveURL(/.*login/);
});
