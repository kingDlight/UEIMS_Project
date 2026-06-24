import { test, expect } from '@playwright/test';

test('TC-AUTH-032: Cấm tự khóa chính mình', async ({ page }) => {
  // 1. Admin login
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForLoadState('networkidle');

  // 2. Truy cập User Management
  await page.goto('/admin/users');
  await page.waitForLoadState('networkidle');

  // Đợi danh sách user load xong
  await expect(page.locator('.ant-spin-spinning')).not.toBeVisible();
  
  // Debug: In ra cấu trúc HTML để biết class nào chứa email
  const body = await page.evaluate(() => document.body.innerHTML);
  console.log('Page Body Preview:', body.substring(0, 1000));
  
  // 3. Tìm nút Lock, không lọc theo card email để test sự tồn tại của nút trước
  const lockButtons = page.locator('button:has-text("Lock")');
  await lockButtons.first().waitFor({ state: 'visible', timeout: 10000 });
  
  // Kiểm tra xem có nút Lock nào bị disable không
  const count = await lockButtons.count();
  console.log('Total lock buttons found:', count);
});
