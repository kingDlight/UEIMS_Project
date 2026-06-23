/**
 * Auth helper for Enterprise Playwright tests.
 *
 * Usage:
 *   import { loginAsEnterprise } from '../fixtures/auth';
 *   await loginAsEnterprise(page, email, password);
 */
import { Page } from '@playwright/test';

export const ENTERPRISE_USER = {
  email: process.env.E2E_ENTERPRISE_EMAIL ?? 'hr@fsoft.com',
  password: process.env.E2E_ENTERPRISE_PASSWORD ?? '',
};

export async function loginAsEnterprise(page: Page, email = ENTERPRISE_USER.email, password = ENTERPRISE_USER.password) {
  await page.goto('/login');
  await page.locator('input[type="email"], input[name="email"], input#email').first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByRole('button', { name: /sign in|login|đăng nhập/i }).first().click();
  await page.waitForURL(/\/enterprise-dashboard/, { timeout: 30000 });
}
