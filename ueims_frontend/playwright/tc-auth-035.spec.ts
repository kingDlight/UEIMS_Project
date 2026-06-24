import { test, expect } from '@playwright/test';

test('TC-AUTH-035: Xem Audit Logs hệ thống', async ({ page }) => {
  // 1. Admin login
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForLoadState('networkidle');
  
  // 2. Truy cập Audit Logs
  await page.goto('/admin/audit');
  await page.waitForLoadState('networkidle');
  
  // 3. Verify: Đợi danh sách log hiển thị
  // Tìm header "Audit Logs" để đảm bảo trang đã load
  await expect(page.getByRole('heading', { name: 'Audit Logs' })).toBeVisible();
  
  // Kiểm tra sự xuất hiện của log bằng text cụ thể có trong log entries
  // Dựa vào log debug, có text 'LOGIN_SUCCESS' hoặc tương tự
  await expect(page.locator('text=LOGIN').first()).toBeVisible({ timeout: 20000 });
});
