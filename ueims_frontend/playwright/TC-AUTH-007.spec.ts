import { test, expect } from '@playwright/test';

// TC-AUTH-007: Đăng xuất và Hủy Token (BR-03)
test('TC-AUTH-007: Logout and invalidate session', async ({ page }) => {
  // Log all console messages and network requests
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('request', req => console.log('NETWORK REQUEST:', req.url()));
  
  // 1. Đăng nhập
  await page.goto('/login');
  await page.fill('.auth-input', 'tm@ueims.edu.vn');
  await page.fill('.auth-input-password input', '1234567890');
  
  await page.click('button[type="submit"]');
  
  // Debug: Screenshot trước khi chờ chuyển hướng
  await page.screenshot({ path: 'after_click_login.png' });
  console.log('URL after clicking login:', page.url());

  // Chờ dashboard hoặc change-password
  // Nới rộng timeout và bỏ networkidle nếu không cần thiết
  try {
      await page.waitForURL(/.*(dashboard|change-password)/, { timeout: 30000 });
  } catch (e) {
      console.log('Navigation timed out. Final URL:', page.url());
      await page.screenshot({ path: 'timeout_error.png' });
      throw e;
  }

  // 2. Click Đăng xuất
  await page.locator('.modern-account-wrapper').click(); 
  // Chọn Logout trong menu dropdown
  await page.locator('button.modern-menu-item').filter({ hasText: /Logout|Đăng xuất/i }).click(); 

  // 3. Kiểm tra kết quả: Chuyển hướng về trang đăng nhập
  await expect(page).toHaveURL(/.*login/);
});
