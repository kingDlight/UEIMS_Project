import { test, expect } from '@playwright/test';

test('TC-AUTH-021: Xem danh sách tài khoản', async ({ page }) => {
  // 1. Đăng nhập với quyền Admin
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  
  // Đăng nhập bằng cách nhấn Enter
  await page.getByLabel('Password').press('Enter');
  
  // Đợi trang dashboard load xong
  await page.waitForURL('**/dashboard', { timeout: 60000 });
  
  // 2. Truy cập User Management
  // Click vào menu điều hướng để chuyển trang thay vì goto (tránh reload)
  await page.locator('button', { hasText: 'Users' }).first().click();
  
  // Chờ URL thay đổi sang trang user management
  await page.waitForURL('**/admin/users', { timeout: 60000 });
  
  // Chờ API list users trả về
  await page.waitForResponse(response => response.url().includes('/api/users'));
  
  // Verify: Danh sách hiển thị - Tìm kiếm phần tử đặc trưng của danh sách user
  await expect(page.locator('text=User Management').first()).toBeVisible();
});
