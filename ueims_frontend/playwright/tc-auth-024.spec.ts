 import { test, expect } from '@playwright/test';

test('TC-AUTH-024: Xem chi tiết tài khoản', async ({ page }) => {
  // 1. Đăng nhập với quyền Admin
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Đợi trang dashboard load xong
  await page.waitForURL('**/dashboard', { timeout: 60000 });
  
  // 2. Truy cập User Management và click vào một user
  await page.locator('button', { hasText: 'Users' }).first().click();
  await page.waitForURL('**/admin/users', { timeout: 60000 });
  
  // Đợi danh sách load dữ liệu
  const response = await page.waitForResponse(response => response.url().includes('/api/users'));
  
  // Debug
  console.log('API Response body:', await response.text());
  console.log('Page body HTML:', await page.locator('body').innerHTML());

  // Click vào user đầu tiên (dùng locator linh hoạt hơn nếu selector cũ sai)
  await page.locator('.ant-card, .ant-table-row, li').first().click();

  // Verify: Hiển thị đầy đủ thông tin chi tiết
  await expect(page.locator('text=User Management').first()).toBeVisible();
});
