import { test, expect } from '@playwright/test';

test('TC-AUTH-027: Bắt buộc đổi mật khẩu lần đầu đăng nhập (BR-04)', async ({ page }) => {
  // Mock API login để trả về mustChangePassword: true
  // Endpoint đúng là /auth/token theo AuthService.ts
  await page.route('**/auth/token', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 1000,
        message: "Success",
        result: {
          accessToken: 'mock_token',
          refreshToken: 'mock_refresh_token',
          authenticated: true,
          mustChangePassword: true
        }
      })
    });
  });

  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  
  // Login và đợi response
  const loginResponse = page.waitForResponse(response => response.url().includes('/auth/token'));
  await page.getByRole('button', { name: /login/i }).click();
  await loginResponse;
  
  // Verify: Bị redirect sang trang đổi mật khẩu
  await expect(page).toHaveURL(/.*change-password/);
});
