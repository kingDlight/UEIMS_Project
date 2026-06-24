import { test, expect } from '@playwright/test';

test('TC-AUTH-026: Tạo tài khoản mới thành công', async ({ page }) => {
  // Tạo thông tin ngẫu nhiên
  const randomName = `New User ${Date.now()}`;
  const randomEmail = `testuser_${Date.now()}@fpt.edu.vn`;

  // 1. Đăng nhập với quyền Admin
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForLoadState('networkidle');

  // 2. Truy cập User Management
  await page.goto('/admin/users');
  
  // 3. Click nút "Thêm User"
  await page.getByRole('button', { name: /add/i }).click();

  // 4. Điền form
  await page.getByLabel('Full Name').fill(randomName);
  await page.getByLabel('Email').fill(randomEmail);
  
  // Chọn Role
  await page.locator('.ant-select-selector').last().click();
  await page.waitForSelector('.ant-select-item-option-content:has-text("STUDENT")');
  await page.locator('.ant-select-item-option-content:has-text("STUDENT")').click();
 // 5. Save
  console.log('Clicking Create Account button...');
  
  // Lắng nghe tất cả request và response để debug
  page.on('request', req => console.log('Request:', req.method(), req.url(), req.postData()));
  page.on('response', resp => console.log('Response:', resp.status(), resp.url()));

  await page.getByRole('button', { name: 'Create Account' }).click({ force: true });

  // Chờ cho API POST (create) xong rồi chờ API GET (fetch list) cập nhật danh sách
  await page.waitForResponse(response => response.url().includes('/api/users') && response.request().method() === 'POST', { timeout: 40000 });
  await page.waitForResponse(response => response.url().includes('/api/users') && response.request().method() === 'GET', { timeout: 40000 });

  // Verify: User xuất hiện - Đợi element hiển thị rõ ràng hơn
  await expect(page.getByText(randomName)).toBeVisible();
  await expect(page.getByText(randomEmail)).toBeVisible();
});
