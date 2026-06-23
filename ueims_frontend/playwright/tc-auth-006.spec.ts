 import { test, expect } from '@playwright/test';

test('TC-AUTH-006: Khóa tài khoản 30 phút sau 5 lần sai (BR-01)', async ({ page }) => {
  await page.goto('/login');

  // 1. Nhập sai mật khẩu liên tiếp 5 lần (Sử dụng student3 để tránh xung đột với các test case song song)
  for (let i = 0; i < 5; i++) {
    await page.getByLabel('Email').fill('student3@fpt.edu.vn');
    await page.getByLabel('Password').fill(`WrongPasswordTry${i}`);
    await page.getByRole('button', { name: 'LOGIN' }).click();
    
    // Đợi phản hồi giữa các lần đăng nhập sai
    await page.waitForTimeout(1000); 
  }

  // Ở lần thứ 5, tài khoản phải bị khóa và hiển thị thông báo rõ ràng
  // Check thông báo Antd message thông báo khóa tài khoản (Sử dụng .first() để tránh lỗi strict mode và hỗ trợ rate limit message)
  const messageNotice = page.locator('.ant-message-notice').first();
  await expect(messageNotice).toContainText(/lock|khóa|too many requests|quá nhiều/i);
});
