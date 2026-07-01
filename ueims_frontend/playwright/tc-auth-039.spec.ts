import { test, expect } from '@playwright/test';

test('TC-AUTH-039: Export khi không có dữ liệu', async ({ page }) => {
  // 1. Admin login (thật)
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.waitForLoadState('networkidle');

  // 2. Truy cập Audit Logs
  await page.goto('/admin/audit');
  await page.waitForLoadState('networkidle');
  
  // 3. Lọc dữ liệu không có kết quả (nếu có dữ liệu)
  const searchInput = page.getByPlaceholder('Search user, action, entity, IP...');
  const emptyState = page.locator('.ant-empty');

  // Chờ input hoặc empty state xuất hiện
  await Promise.race([
    searchInput.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
    emptyState.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {})
  ]);

  if (await searchInput.isVisible()) {
    await searchInput.fill('non-existent-log-query-12345');
  }
  
  // 4. Verify: Empty component should be visible
  await expect(emptyState).toBeVisible({ timeout: 20000 });
  
  // 5. Verify: Nút Export Excel (có thể vẫn hiển thị nhưng nên disable hoặc không cho click)
  const exportButton = page.getByRole('button', { name: /Export Excel/i });
  await expect(exportButton).toBeVisible();
});
