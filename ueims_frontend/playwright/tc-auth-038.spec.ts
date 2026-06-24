import { test, expect } from '@playwright/test';

test('TC-AUTH-038: Export System Log Data', async ({ page }) => {
  // 1. Admin login (thật)
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@fpt.edu.vn');
  await page.getByLabel('Password').fill('1234567890');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  // Wait for login to complete and redirect to dashboard
  await page.waitForURL('**/admin/dashboard', { timeout: 30000 });
  await page.waitForLoadState('networkidle');

  // 2. Truy cập Audit Logs
  await page.goto('/admin/audit');
  await page.waitForLoadState('networkidle');
  
  // Debug: Log all buttons
  const buttons = page.locator('button');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    console.log(`Button ${i}:`, await buttons.nth(i).textContent());
  }

  // 3. Verify download
  const exportButton = page.getByRole('button', { name: /Export Excel/i });
  await exportButton.waitFor({ state: 'visible', timeout: 30000 });
  
  const downloadPromise = page.waitForEvent('download');
  await exportButton.click();
  const download = await downloadPromise;
  
  // Verify download
  expect(download).not.toBeNull();
});
