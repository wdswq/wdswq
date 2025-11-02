import { test, expect } from '@playwright/test';

test.describe('Processing Completion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'TestPassword123!');
    await page.click('[data-testid=login-button]');
  });

  test('should show processing status after upload', async ({ page }) => {
    // Upload a file first
    await page.goto('/upload');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(['test-document.pdf']);
    await page.click('[data-testid=upload-button]');
    
    // Should redirect to processing page
    await expect(page).toHaveURL(/.*\/processing/);
    
    // Should show processing status
    await expect(page.locator('text=Processing your file')).toBeVisible();
    await expect(page.locator('[data-testid=processing-status]')).toBeVisible();
  });

  test('should show real-time processing updates', async ({ page }) => {
    await page.goto('/processing/test-file-id');
    
    // Should show different processing stages
    await expect(page.locator('text=Extracting content')).toBeVisible();
    
    // Wait for next stage
    await expect(page.locator('text=Analyzing content')).toBeVisible({ timeout: 10000 });
    
    // Wait for completion
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 30000 });
  });

  test('should handle processing errors gracefully', async ({ page }) => {
    await page.goto('/processing/error-file-id');
    
    // Should show error message
    await expect(page.locator('text=Processing failed')).toBeVisible();
    await expect(page.locator('[data-testid=error-message]')).toBeVisible();
    
    // Should offer retry option
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });

  test('should allow retry after processing failure', async ({ page }) => {
    await page.goto('/processing/error-file-id');
    
    // Click retry button
    await page.click('button:has-text("Retry")');
    
    // Should restart processing
    await expect(page.locator('text=Restarting processing')).toBeVisible();
    await expect(page.locator('[data-testid=processing-status]')).toBeVisible();
  });

  test('should show processing progress for different file types', async ({ page }) => {
    // Test PDF processing
    await page.goto('/processing/pdf-file-id');
    await expect(page.locator('text=Extracting text from PDF')).toBeVisible();
    
    // Test image processing
    await page.goto('/processing/image-file-id');
    await expect(page.locator('text=Analyzing image content')).toBeVisible();
    
    // Test video processing
    await page.goto('/processing/video-file-id');
    await expect(page.locator('text=Processing video')).toBeVisible();
  });

  test('should send notification when processing completes', async ({ page }) => {
    await page.goto('/processing/test-file-id');
    
    // Wait for processing to complete
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 30000 });
    
    // Should show notification
    await expect(page.locator('[data-testid=notification]')).toBeVisible();
    await expect(page.locator('text=Your file is ready')).toBeVisible();
  });

  test('should provide option to view processed file', async ({ page }) => {
    await page.goto('/processing/test-file-id');
    
    // Wait for completion
    await expect(page.locator('text=Processing complete')).toBeVisible({ timeout: 30000 });
    
    // Should show view button
    await expect(page.locator('button:has-text("View File")')).toBeVisible();
    
    // Click view button
    await page.click('button:has-text("View File")');
    
    // Should redirect to file view page
    await expect(page).toHaveURL(/.*\/library\/.*/);
  });
});