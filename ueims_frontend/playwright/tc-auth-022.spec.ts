import { test, expect } from '@playwright/test';

test('TC-AUTH-022: Tìm kiếm/Lọc tài khoản', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Đợi trang dashboard load xong
  await page.waitForURL('**/dashboard', { timeout: 60000 });
  
  // Click vào menu điều hướng để chuyển trang thay vì goto (tránh reload)
  await page.locator('button', { hasText: 'Users' }).first().click();
  await page.waitForURL('**/admin/users', { timeout: 60000 });
  
  // Đợi bảng load dữ liệu
  await page.waitForResponse(response => response.url().includes('/api/users'));
  
  // Verify: Danh sách hiển thị
  await expect(page.locator('text=HR Momo').first()).toBeVisible();
});
