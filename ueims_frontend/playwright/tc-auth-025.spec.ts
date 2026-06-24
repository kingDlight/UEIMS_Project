import { test, expect } from '@playwright/test';

test('TC-AUTH-025: Xem chi tiết tài khoản không tồn tại', async ({ page }) => {
  // 1. Đăng nhập với quyền Admin
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForLoadState('networkidle');

  // 2. Truy cập URL ID user không tồn tại
  await page.goto('/admin/users/non-existent-uuid');

  // Verify: Trả về thông báo lỗi hoặc 404
  await expect(page.locator('text=404')).toBeVisible();
});
