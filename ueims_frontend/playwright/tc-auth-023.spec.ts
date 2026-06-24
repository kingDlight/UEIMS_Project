import { test, expect } from '@playwright/test';

test('TC-AUTH-023: Không có quyền xem danh sách', async ({ page }) => {
  // 1. Đăng nhập với quyền Student
  await page.goto('/login');
  await page.getByLabel('Email').fill('demo.student@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForLoadState('networkidle');

  // 2. Cố gắng truy cập URL user management
  await page.goto('/admin/users');

  // Verify: Bị chặn (không hiển thị table/list)
  await expect(page.locator('ul')).not.toBeVisible();
});
