import { test, expect } from '@playwright/test';

test('TC-AUTH-030: Cập nhật thông tin tài khoản', async ({ page }) => {
  // 1. Admin login
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForLoadState('networkidle');
  
  // 2. Sửa thông tin user
  await page.goto('/admin/users');
  await page.waitForLoadState('networkidle');
  
  // Wait for user cards to be visible
  await expect(page.locator('.ant-spin-spinning')).not.toBeVisible();
  
  // Click "Edit" button - using getByRole for better robustness
  const editButton = page.getByRole('button', { name: 'Edit' }).first();
  await editButton.waitFor({ state: 'visible', timeout: 30000 });
  await editButton.click();
  
  // Wait for Edit Modal
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  
  // Fill phone - using explicit role/id selector
  await modal.locator('input#phone').fill('0909999999');
  
  // Click "Save Changes"
  await modal.getByRole('button', { name: /Save Changes/i }).click();

  // Verify: Lưu thành công
  const successMsg = page.locator('.ant-message-success');
  await expect(successMsg).toBeVisible({ timeout: 10000 });
  await expect(successMsg).toContainText('User information updated');
});
