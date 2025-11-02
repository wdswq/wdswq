import { test as base, expect } from '@playwright/test';
import path from 'path';

// Define test fixtures
export const test = base.extend({
  // Authenticated page fixture
  authenticatedPage: async ({ page }, use) => {
    // Login before using the page
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'TestPassword123!');
    await page.click('[data-testid=login-button]');
    
    // Wait for login to complete
    await expect(page.locator('text=Welcome')).toBeVisible();
    
    await use(page);
  },
  
  // API context fixture
  apiContext: async ({ request }, use) => {
    // Set up authenticated API context
    const apiContext = request.newContext({
      extraHTTPHeaders: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json',
      },
    });
    
    await use(apiContext);
    await apiContext.dispose();
  },
});

// Export expect from base test
export { expect };

// Re-export test types
export type TestOptions = {
  authenticatedPage: import('@playwright/test').Page;
  apiContext: import('@playwright/test').APIRequestContext;
};