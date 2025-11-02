import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login option for unauthenticated users', async ({ page }) => {
    // Check if login/register options are available
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });

  test('should allow user registration', async ({ page }) => {
    await page.click('text=Sign Up');
    
    // Fill registration form
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'TestPassword123!');
    await page.fill('[data-testid=confirm-password-input]', 'TestPassword123!');
    
    // Submit form
    await page.click('[data-testid=register-button]');
    
    // Should redirect to dashboard or home
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should allow user login', async ({ page }) => {
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'TestPassword123!');
    
    // Submit form
    await page.click('[data-testid=login-button]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    await page.click('text=Login');
    
    // Fill invalid credentials
    await page.fill('[data-testid=email-input]', 'invalid@example.com');
    await page.fill('[data-testid=password-input]', 'wrongpassword');
    
    // Submit form
    await page.click('[data-testid=login-button]');
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should allow user logout', async ({ page }) => {
    // First login
    await page.click('text=Login');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'TestPassword123!');
    await page.click('[data-testid=login-button]');
    
    // Then logout
    await page.click('[data-testid=user-menu]');
    await page.click('text=Logout');
    
    // Should redirect to home and show login options
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Login')).toBeVisible();
  });
});