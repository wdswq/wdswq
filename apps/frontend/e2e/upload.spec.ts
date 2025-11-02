import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'TestPassword123!');
    await page.click('[data-testid=login-button]');
  });

  test('should navigate to upload page', async ({ page }) => {
    await page.click('text=Upload Content');
    await expect(page).toHaveURL('/upload');
    await expect(page.locator('h1')).toContainText('Upload');
  });

  test('should display upload area', async ({ page }) => {
    await page.goto('/upload');
    
    // Check upload area is visible
    await expect(page.locator('[data-testid=upload-area]')).toBeVisible();
    await expect(page.locator('text=Drop files here')).toBeVisible();
    await expect(page.locator('text=or click to browse')).toBeVisible();
  });

  test('should handle file drag and drop', async ({ page }) => {
    await page.goto('/upload');
    
    // Get upload area
    const uploadArea = page.locator('[data-testid=upload-area]');
    
    // Create a test file
    const testFilePath = path.join(__dirname, 'fixtures', 'test-document.pdf');
    
    // Drag and drop file
    await uploadArea.dispatchEvent('dragover');
    await expect(uploadArea).toHaveClass(/border-primary/);
    
    await uploadArea.dispatchEvent('drop', {
      dataTransfer: {
        files: [testFilePath],
      },
    });
    
    // Should show processing state
    await expect(page.locator('[data-testid=upload-progress]')).toBeVisible();
  });

  test('should handle file selection via click', async ({ page }) => {
    await page.goto('/upload');
    
    // Click to browse files
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'test-document.pdf'));
    
    // Should show file preview and upload progress
    await expect(page.locator('[data-testid=file-preview]')).toBeVisible();
    await expect(page.locator('[data-testid=upload-button]')).toBeVisible();
  });

  test('should show upload progress', async ({ page }) => {
    await page.goto('/upload');
    
    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'test-document.pdf'));
    
    // Click upload button
    await page.click('[data-testid=upload-button]');
    
    // Should show progress indicator
    await expect(page.locator('[data-testid=progress-bar]')).toBeVisible();
    
    // Wait for upload to complete
    await expect(page.locator('text=Upload completed')).toBeVisible({ timeout: 30000 });
  });

  test('should handle multiple file uploads', async ({ page }) => {
    await page.goto('/upload');
    
    // Upload multiple files
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      path.join(__dirname, 'fixtures', 'test-document.pdf'),
      path.join(__dirname, 'fixtures', 'test-image.jpg'),
      path.join(__dirname, 'fixtures', 'test-video.mp4'),
    ]);
    
    // Should show multiple file previews
    await expect(page.locator('[data-testid=file-preview]')).toHaveCount(3);
    
    // Upload all files
    await page.click('[data-testid=upload-all-button]');
    
    // Should show progress for all files
    await expect(page.locator('[data-testid=progress-bar]')).toHaveCount(3);
  });

  test('should validate file types', async ({ page }) => {
    await page.goto('/upload');
    
    // Try to upload an unsupported file type
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'test-executable.exe'));
    
    // Should show validation error
    await expect(page.locator('text=File type not supported')).toBeVisible();
  });

  test('should validate file size', async ({ page }) => {
    await page.goto('/upload');
    
    // Try to upload a file that's too large
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'large-file.pdf'));
    
    // Should show size validation error
    await expect(page.locator('text=File size exceeds limit')).toBeVisible();
  });
});