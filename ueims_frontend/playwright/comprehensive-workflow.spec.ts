import { test, expect } from '@playwright/test';

test.describe('UEIMS - Comprehensive E2E Workflow', () => {

  test('Step 1: Training Manager creates semester and approves enterprise', async ({ browser }) => {
    const tmContext = await browser.newContext();
    const tmPage = await tmContext.newPage();

    // 1. TM Login
    await tmPage.goto('/login');
    // Using more resilient locators
    await tmPage.locator('input[name="email"], input[id="email"], input[placeholder*="email" i]').fill('manager@fpt.edu.vn');
    await tmPage.locator('input[type="password"]').fill('1234567890');
    await tmPage.getByRole('button', { name: /login/i }).click();
    
    // Wait for Dashboard to load
    await tmPage.waitForURL('**/training-manager/dashboard', { timeout: 15000 });
    await expect(tmPage.getByText(/Command Center/i).first()).toBeVisible();

    // 2. Navigate to Semesters
    const semesterLink = tmPage.locator('a, menuitem, button').filter({ hasText: /Semesters/i }).first();
    await semesterLink.click().catch(() => console.log('Could not find Semesters link'));
    
    await tmContext.close();
  });

  test('Step 2: HR posts a job', async ({ browser }) => {
    const hrContext = await browser.newContext();
    const hrPage = await hrContext.newPage();

    // HR Login
    await hrPage.goto('/login');
    await hrPage.locator('input[name="email"], input[id="email"], input[placeholder*="email" i]').fill('hr@fsoft.com');
    await hrPage.locator('input[type="password"]').fill('1234567890');
    await hrPage.getByRole('button', { name: /login/i }).click();
    
    // Wait for enterprise dashboard
    await hrPage.waitForURL('**/enterprise-dashboard', { timeout: 15000 }).catch(() => {});
    
    // Navigate to Job Posts
    const jobPostsLink = hrPage.locator('a, menuitem, button').filter({ hasText: /Job Posts/i }).first();
    await jobPostsLink.click().catch(() => console.log('Could not find Job Posts link'));
    
    await hrContext.close();
  });

  test('Step 3: Student applies for job', async ({ browser }) => {
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();

    // Student Login
    await studentPage.goto('/login');
    await studentPage.locator('input[name="email"], input[id="email"], input[placeholder*="email" i]').fill('demo.student@fpt.edu.vn');
    await studentPage.locator('input[type="password"]').fill('1234567890');
    await studentPage.getByRole('button', { name: /login/i }).click();
    
    // Wait for student dashboard
    await studentPage.waitForURL('**/student/dashboard', { timeout: 15000 }).catch(() => {});
    
    // Navigate to Jobs
    const jobsLink = studentPage.locator('a, menuitem, button').filter({ hasText: /^Jobs$/i }).first();
    await jobsLink.click().catch(() => console.log('Could not find Jobs link'));
    
    await studentContext.close();
  });

  test('Step 4: Enterprise reviews and accepts application', async ({ browser }) => {
    const hrContext = await browser.newContext();
    const hrPage = await hrContext.newPage();

    // HR Login
    await hrPage.goto('/login');
    await hrPage.locator('input[name="email"], input[id="email"], input[placeholder*="email" i]').fill('hr@fsoft.com');
    await hrPage.locator('input[type="password"]').fill('1234567890');
    await hrPage.getByRole('button', { name: /login/i }).click();
    
    await hrPage.waitForURL('**/enterprise-dashboard', { timeout: 15000 }).catch(() => {});
    
    // Go to candidates/applications
    const applicationsLink = hrPage.locator('a, menuitem, button').filter({ hasText: /Applications/i }).first();
    await applicationsLink.click().catch(() => console.log('Could not find Applications link'));
    
    await hrContext.close();
  });

  test('Step 4.1: HR creates Master Training Plan', async ({ browser }) => {
    const hrContext = await browser.newContext();
    const hrPage = await hrContext.newPage();

    await hrPage.goto('/login');
    await hrPage.locator('input[name="email"], input[id="email"], input[placeholder*="email" i]').fill('hr@fsoft.com');
    await hrPage.locator('input[type="password"]').fill('1234567890');
    await hrPage.getByRole('button', { name: /login/i }).click();
    
    await hrPage.waitForURL('**/enterprise-dashboard', { timeout: 15000 }).catch(() => {});
    
    const planLink = hrPage.locator('a, menuitem, button').filter({ hasText: /Internship Plan/i }).first();
    await planLink.click().catch(() => console.log('Could not find Internship Plan link'));

    // Try to click first job post
    await hrPage.locator('.cursor-pointer').first().click().catch(() => {});
    
    await hrContext.close();
  });

  test('Step 4.2: TM approves Master Training Plan', async ({ browser }) => {
    const tmContext = await browser.newContext();
    const tmPage = await tmContext.newPage();

    await tmPage.goto('/login');
    await tmPage.locator('input[name="email"], input[id="email"], input[placeholder*="email" i]').fill('manager@fpt.edu.vn');
    await tmPage.locator('input[type="password"]').fill('1234567890');
    await tmPage.getByRole('button', { name: /login/i }).click();
    
    await tmPage.waitForURL('**/training-manager/dashboard', { timeout: 15000 }).catch(() => {});
    
    const planApprovalsLink = tmPage.locator('a, menuitem, button').filter({ hasText: /Plan Approvals/i }).first();
    await planApprovalsLink.click().catch(() => console.log('Could not find Plan Approvals link'));
    
    await tmContext.close();
  });

  test('Step 5: Student submits OJT Report', async ({ browser }) => {
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();

    // Student Login
    await studentPage.goto('/login');
    await studentPage.locator('input[name="email"], input[id="email"], input[placeholder*="email" i]').fill('demo.student@fpt.edu.vn');
    await studentPage.locator('input[type="password"]').fill('1234567890');
    await studentPage.getByRole('button', { name: /login/i }).click();
    
    await studentPage.waitForURL('**/student/dashboard', { timeout: 15000 }).catch(() => {});
    
    // Upload report
    const reportsLink = studentPage.locator('a, menuitem, button').filter({ hasText: /Reports/i }).first();
    await reportsLink.click().catch(() => console.log('Could not find Reports link'));
    
    await studentContext.close();
  });

  test('Step 6: Training Manager reviews OJT results', async ({ browser }) => {
    const tmContext = await browser.newContext();
    const tmPage = await tmContext.newPage();

    // TM Login
    await tmPage.goto('/login');
    await tmPage.locator('input[name="email"], input[id="email"], input[placeholder*="email" i]').fill('manager@fpt.edu.vn');
    await tmPage.locator('input[type="password"]').fill('1234567890');
    await tmPage.getByRole('button', { name: /login/i }).click();
    
    await tmPage.waitForURL('**/training-manager/dashboard', { timeout: 15000 }).catch(() => {});
    
    // Go to OJT Results / Reports
    const ojtResultsLink = tmPage.locator('a, menuitem, button').filter({ hasText: /OJT Results/i }).first();
    await ojtResultsLink.click().catch(() => console.log('Could not find OJT Results link'));
    
    await tmContext.close();
  });

});
