import { test, expect } from '@playwright/test';

test('TC-AUTH-033: Cấp/Đổi quyền (Role) cho tài khoản', async ({ page }) => {
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
  
  // 3. Click nút "Roles" trên user card đầu tiên
  const rolesButton = page.locator('button:has-text("Roles")');
  await rolesButton.first().waitFor({ state: 'visible', timeout: 15000 });
  await rolesButton.first().click();
  
  // 4. Chọn role trong modal
  const modal = page.getByRole('dialog', { name: /Assign Roles/i });
  await expect(modal).toBeVisible();
  
  // Chọn một role
  await modal.locator('.ant-select-selector').click();
  await page.waitForSelector('.ant-select-item-option');
  await page.locator('.ant-select-item-option').first().click();
  
  // Đóng dropdown bằng cách nhấn ESC
  await page.keyboard.press('Escape');
  
  // 5. Lưu và debug response
  page.on('response', resp => {
      if (resp.url().includes('/users/role')) {
          console.log('Role update response:', resp.status(), resp.statusText());
      }
  });
  
  await modal.getByRole('button', { name: /Save Configuration/i }).click();

  // 6. Verify: Success message
  // Antd message often appears in the body
  await expect(page.locator('.ant-message, .ant-message-notice-success').first()).toBeVisible({ timeout: 10000 });
});
