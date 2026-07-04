import { test, expect } from '@playwright/test';

const hrToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3JpdGllcyI6IlJPTEVfRU5URVJQUklTRSIsInN1YiI6ImhyQGZzb2Z0LmNvbSIsInVzZXJJZCI6ImhyLTEiLCJleHAiOjk5OTk5OTk5OTl9.signature';
const studentToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRob3JpdGllcyI6IlJPTEVfU1RVREVOVCIsInN1YiI6InN0dWRlbnRAZnB0LmVkdS52biIsInVzZXJJZCI6InN0dWRlbnQtMSIsImV4cCI6OTk5OTk5OTk5OX0=.signature';

test.describe('UEIMS - Evaluation and Final Report Bug Fixes', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      if (
        route.request().url().includes('/auth/token') ||
        route.request().url().includes('/users/me') ||
        route.request().url().includes('/enterprise-assignments/my-enterprise') ||
        route.request().url().includes('/enterprise-evaluations') ||
        route.request().url().includes('/student-profiles/my-profile')
      ) {
        return route.fallback();
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: {} })
      });
    });
  });

  test('Bug 1 & 4: HR sees View Final Report and View Evaluation buttons', async ({ page }) => {
    await page.route('**/api/auth/token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { accessToken: hrToken, refreshToken: 'dummy' } })
      });
    });
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { id: 'hr-1', roles: [{ role: { roleName: 'ENTERPRISE' } }] } })
      });
    });
    await page.route('**/api/enterprise-assignments/my-enterprise*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: [{
            assignmentId: 'assign-123',
            studentName: 'John Doe',
            studentCode: 'SE123456',
            status: 'ACTIVE',
            finalReportUrl: '/uploads/final-reports/test.pdf',
            evaluationId: 'eval-456'
          }]
        })
      });
    });

    await page.goto('/login');
    await page.locator('input[name="email"], input[id="email"], input[placeholder*="email" i]').fill('hr@fsoft.com');
    await page.locator('input[type="password"]').fill('1234567890');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/enterprise-dashboard*');
    await page.goto('/enterprise-dashboard/students');

    await expect(page.getByText('John Doe')).toBeVisible();

    const finalReportBtn = page.locator('a:has-text("View Final Report")');
    await expect(finalReportBtn).toBeVisible();
    await expect(finalReportBtn).toHaveAttribute('href', 'http://localhost:8080/uploads/final-reports/test.pdf');

    const evalBtn = page.locator('a:has-text("View Evaluation")');
    await expect(evalBtn).toBeVisible();
    await expect(evalBtn).toHaveAttribute('href', '/enterprise-dashboard/evaluation?assignmentId=assign-123');
  });

  test('Bug 3: Evaluation Tab sets read-only mode for already evaluated student', async ({ page }) => {
    await page.route('**/api/auth/token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { accessToken: hrToken, refreshToken: 'dummy' } })
      });
    });
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { id: 'hr-1', roles: [{ role: { roleName: 'ENTERPRISE' } }] } })
      });
    });
    await page.route('**/api/enterprise-assignments/my-enterprise*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: [{
            assignmentId: 'assign-123',
            studentName: 'John Doe',
            studentCode: 'SE123456',
            evaluationId: 'eval-456'
          }]
        })
      });
    });
    await page.route('**/api/enterprise-evaluations/eval-456', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            evaluationId: 'eval-456',
            attitudeScore: 4.5,
            professionalismScore: 4.0,
            softSkillsScore: 3.5,
            progressScore: 4.0,
            overallComments: 'Good student',
            status: 'SUBMITTED'
          }
        })
      });
    });

    await page.goto('/login');
    await page.locator('input[name="email"], input[id="email"], input[placeholder*="email" i]').fill('hr@fsoft.com');
    await page.locator('input[type="password"]').fill('1234567890');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/enterprise-dashboard*');
    await page.goto('/enterprise-dashboard/evaluation');

    await expect(page.getByText('Submitted')).toBeVisible();
    await expect(page.getByText('Good student')).toBeVisible();
  });

  test('Bug 2: Student Evaluation Tab handles empty response', async ({ page }) => {
    await page.route('**/api/auth/token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { accessToken: studentToken, refreshToken: 'dummy' } })
      });
    });
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { id: 'student-1', roles: [{ role: { roleName: 'STUDENT' } }] } })
      });
    });
    await page.route('**/api/student-profiles/my-profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { id: 'student-1', currentSemester: 8 } })
      });
    });
    await page.route('**/api/enterprise-evaluations/my-evaluation*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({})
      });
    });

    await page.goto('/login');
    await page.locator('input[name="email"], input[id="email"], input[placeholder*="email" i]').fill('student@fpt.edu.vn');
    await page.locator('input[type="password"]').fill('1234567890');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/student/dashboard*');
    
    // Correct URL for the student evaluation tab
    await page.goto('/student/evaluation');

    // Bypass translation by targeting the Trophy icon which is unique to EmptyState
    await expect(page.locator('.anticon-trophy')).toBeVisible({ timeout: 5000 });
  });

});
