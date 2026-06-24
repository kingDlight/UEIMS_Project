import { test, expect } from '@playwright/test';

test('TC-AUTH-007: Đăng xuất và Hủy Token (BR-03)', async ({ page }) => {
  // 1. Đăng nhập trước
  await page.goto('/login');
  await page.getByLabel('Email').fill('student11@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  // Click nút đăng nhập
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Chờ navigation sau khi login - tăng timeout để ổn định hơn
  await page.waitForLoadState('networkidle');
  await page.waitForURL(/.*dashboard/, { timeout: 15000 });

  // 2. Click vào avatar/menu user để mở dropdown (sử dụng selector của ModernLayout)
  await page.locator('.modern-account-wrapper').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('.modern-account-wrapper').click();

  // 3. Nhấn vào danh sách dropdown và chọn Đăng xuất (Logout)
  await page.locator('.modern-menu-item', { hasText: /logout|đăng\s*xuất/i }).click();

  // Verify: Session kết thúc, redirect về trang Login
  await page.waitForURL(/.*login/);
  await expect(page).toHaveURL(/.*login/);
});
