import { test, expect } from '@playwright/test';

// Function to generate a mock base64 token payload without depending on Buffer
function createMockToken(payload: any) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encodedHeader}.${encodedPayload}.signature`;
}

test('TC-AUTH-036: Lọc Audit Logs', async ({ page }) => {
  const mockToken = createMockToken({
      userId: 'admin-1',
      sub: 'admin@fpt.edu.vn',
      authorities: 'ADMIN',
      must_change_password: false,
      full_name: 'Admin',
      exp: Math.floor(Date.now() / 1000) + 3600
  });

  // Mock API audit logs
  await page.route('**/api/audit-logs', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
            { id: 'log-1', userEmail: 'admin@fpt.edu.vn', action: 'LOGIN', timestamp: new Date().toISOString() },
            { id: 'log-2', userEmail: 'other@fpt.edu.vn', action: 'UPDATE', timestamp: new Date().toISOString() }
        ])
      });
  });

  // 1. Admin login
  await page.goto('/login');
  await page.evaluate((token) => localStorage.setItem('token', token), mockToken);
  
  // 2. Truy cập Audit Logs
  await page.goto('/admin/audit');
  await page.waitForLoadState('networkidle');
  
  // 3. Lọc dữ liệu
  const searchInput = page.locator('input.ant-input').first();
  await searchInput.fill('LOGIN');
  
  // 4. Verify: Đợi danh sách log hiển thị với filter
  await expect(page.locator('text=LOGIN').first()).toBeVisible({ timeout: 20000 });
  await expect(page.locator('text=UPDATE')).not.toBeVisible();
});
