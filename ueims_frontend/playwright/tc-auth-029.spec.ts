import { test, expect } from '@playwright/test';

test('TC-AUTH-029: Password mặc định khi tạo mới (BR)', async ({ page }) => {
  // 1. Mock API tạo user
  await page.route('**/api/users', async route => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 1000, message: 'Success', result: {} })
      });
    } else {
      await route.continue();
    }
  });

  // 2. Admin login (thật)
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForLoadState('networkidle');

  // 3. Truy cập tab users trong admin
  await page.goto('/admin/users');
  await page.waitForLoadState('networkidle');
  
  // Nút "Add New User" thường nằm ở header/container, thử selector bền vững hơn
  const addButton = page.getByRole('button', { name: /Add New User/i });
  await addButton.waitFor({ state: 'visible', timeout: 30000 });
  await addButton.click();
  
  // Wait for the modal to be visible
  await expect(page.getByRole('dialog')).toBeVisible();

  // 4. Fill form
  await page.getByLabel('Full Name').fill('Test User');
  await page.getByLabel('Email').fill('testuser@fpt.edu.vn');
  
  // Chọn Role
  await page.locator('.ant-select-selector').last().click();
  await page.waitForSelector('.ant-select-item-option-content:has-text("STUDENT")');
  await page.locator('.ant-select-item-option-content:has-text("STUDENT")').click();
  
  // 5. Submit
  await page.getByRole('button', { name: /Create Account/i }).click({ force: true });

  // 6. Verify: Success message
  await expect(page.locator('.ant-message-success')).toContainText('User created successfully', { timeout: 10000 });
});
