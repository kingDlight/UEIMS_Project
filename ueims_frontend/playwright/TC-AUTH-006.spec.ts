import { test, expect } from '@playwright/test';

// TC-AUTH-006: Khóa tài khoản 30 phút sau 5 lần sai (BR-01)
test('TC-AUTH-006: Account lockout after 5 failed attempts', async ({ page }) => {
  await page.goto('/login');

  const email = 'sv_test@fpt.edu.vn';
  const wrongPassword = 'wrong_password';

  // Thực hiện đăng nhập sai liên tiếp 5 lần
  for (let i = 0; i < 5; i++) {
    await page.fill('.auth-input', email);
    await page.fill('.auth-input-password input', wrongPassword);
    await page.click('button[type="submit"]');
    // Form lỗi hiển thị cho sai mật khẩu
    await expect(page.locator('.ant-form-item-explain-error').first()).toBeVisible({ timeout: 10000 });
  }

  // 3. Lần thử thứ 6
  await page.fill('.auth-input', email);
  await page.fill('.auth-input-password input', 'Valid@2026'); 
  await page.click('button[type="submit"]');

  // 4. Kiểm tra khóa (message.error của antd sẽ hiển thị)
  await expect(page.locator('.ant-message-notice-content').filter({ hasText: /Account locked|khóa/i }).first()).toBeVisible({ timeout: 10000 });
});
