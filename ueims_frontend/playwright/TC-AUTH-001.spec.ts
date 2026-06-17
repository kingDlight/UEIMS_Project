import { test, expect } from '@playwright/test';

// TC-AUTH-001: UC-01: Đăng nhập thành công
// Dữ liệu: TD-USR-01 (sv_test@fpt.edu.vn / Valid@2026)
test('TC-AUTH-001: Successful Login', async ({ page }) => {
  // Log API response for debugging
  page.on('response', response => {
    if (response.url().includes('/auth/')) {
      console.log('<<', response.status(), response.url());
    }
  });
  page.on('requestfailed', request => {
    console.log('>>', request.failure()?.errorText, request.url());
  });

  // 1. Khởi động trình duyệt web và truy cập vào URL của trang đăng nhập
  await page.goto('/login');

  // 2. Tại form nhập liệu, điền chính xác thông tin vào trường email và mật khẩu đúng
  await page.fill('.auth-input', 'tm@ueims.edu.vn');
  await page.fill('.auth-input-password input', '1234567890');

  // 3. Tìm và click xác nhận vào nút Đăng nhập
  await page.click('button[type="submit"]');

  // Đợi phản hồi hoặc chuyển hướng
  // Kiểm tra thông báo lỗi nếu xuất hiện
  const errorMsg = page.locator('.ant-message-error');
  if (await errorMsg.isVisible()) {
    const errorText = await errorMsg.textContent();
    throw new Error(`Login failed with message: ${errorText}`);
  }

  // Đợi chuyển hướng (Kết quả mong đợi: chuyển hướng đến Dashboard hoặc Change Password)
  await expect(page).toHaveURL(/\/dashboard|\/change-password/, { timeout: 10000 });
  
  // Kiểm tra thông báo thành công hoặc yêu cầu đổi mật khẩu
  await expect(page.locator('.ant-message-success, .ant-message-warning')).toBeVisible();
});
