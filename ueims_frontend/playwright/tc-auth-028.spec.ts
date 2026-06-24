import { test, expect } from '@playwright/test';

test('TC-AUTH-028: Tạo tài khoản thiếu trường bắt buộc', async ({ page }) => {
  // 1. Admin login
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForLoadState('networkidle');

  // 2. Truy cập thêm user, bỏ trống các trường required
  await page.goto('/admin/users');
  
  // Wait for the modal to appear
  await page.getByRole('button', { name: /add new user/i }).click();
  
  // Wait for the modal to be visible
  await expect(page.getByRole('dialog', { name: /add new user/i })).toBeVisible();

  // Click save inside the modal
  await page.getByRole('button', { name: /create account/i }).click();

  // Verify: Validation error, không cho save
  const errors = page.locator('.ant-form-item-explain-error');
  await expect(errors.first()).toBeVisible();
});
