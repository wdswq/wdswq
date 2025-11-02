import { test, expect } from '@playwright/test';

test.describe('File Preview Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'TestPassword123!');
    await page.click('[data-testid=login-button]');
  });

  test('should open file preview from library', async ({ page }) => {
    await page.goto('/library');
    
    // Click on first file to preview
    await page.click('[data-testid=file-item]:first-child');
    
    // Should open preview modal or page
    await expect(page.locator('[data-testid=file-preview]')).toBeVisible();
    await expect(page.locator('[data-testid=preview-content]')).toBeVisible();
  });

  test('should display PDF preview', async ({ page }) => {
    await page.goto('/library/pdf-file-id');
    
    // Should show PDF viewer
    await expect(page.locator('[data-testid=pdf-viewer]')).toBeVisible();
    await expect(page.locator('iframe[data-testid="pdf-frame"]')).toBeVisible();
  });

  test('should display image preview', async ({ page }) => {
    await page.goto('/library/image-file-id');
    
    // Should show image
    await expect(page.locator('[data-testid=image-preview]')).toBeVisible();
    await expect(page.locator('img[alt="File preview"]')).toBeVisible();
  });

  test('should display video preview', async ({ page }) => {
    await page.goto('/library/video-file-id');
    
    // Should show video player
    await expect(page.locator('[data-testid=video-player]')).toBeVisible();
    await expect(page.locator('video')).toBeVisible();
  });

  test('should display text file preview', async ({ page }) => {
    await page.goto('/library/text-file-id');
    
    // Should show text content
    await expect(page.locator('[data-testid=text-preview]')).toBeVisible();
    await expect(page.locator('pre')).toBeVisible();
  });

  test('should allow zoom controls for PDF', async ({ page }) => {
    await page.goto('/library/pdf-file-id');
    
    // Should show zoom controls
    await expect(page.locator('[data-testid=zoom-in]')).toBeVisible();
    await expect(page.locator('[data-testid=zoom-out]')).toBeVisible();
    await expect(page.locator('[data-testid=zoom-reset]')).toBeVisible();
    
    // Test zoom in
    await page.click('[data-testid=zoom-in]');
    await expect(page.locator('[data-testid=pdf-viewer]')).toHaveClass(/zoomed-in/);
    
    // Test zoom out
    await page.click('[data-testid=zoom-out]');
    await expect(page.locator('[data-testid=pdf-viewer]')).toHaveClass(/zoomed-out/);
    
    // Test zoom reset
    await page.click('[data-testid=zoom-reset]');
    await expect(page.locator('[data-testid=pdf-viewer]')).not.toHaveClass(/zoomed/);
  });

  test('should allow fullscreen preview', async ({ page }) => {
    await page.goto('/library/image-file-id');
    
    // Click fullscreen button
    await page.click('[data-testid=fullscreen-button]');
    
    // Should enter fullscreen mode
    await expect(page.locator('[data-testid=fullscreen-preview]')).toBeVisible();
    
    // Exit fullscreen
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid=fullscreen-preview]')).not.toBeVisible();
  });

  test('should show file metadata in preview', async ({ page }) => {
    await page.goto('/library/any-file-id');
    
    // Should show metadata sidebar
    await expect(page.locator('[data-testid=file-metadata]')).toBeVisible();
    await expect(page.locator('[data-testid=file-name]')).toBeVisible();
    await expect(page.locator('[data-testid=file-size]')).toBeVisible();
    await expect(page.locator('[data-testid=file-type]')).toBeVisible();
    await expect(page.locator('[data-testid=upload-date]')).toBeVisible();
    await expect(page.locator('[data-testid=file-tags]')).toBeVisible();
  });

  test('should allow editing file metadata', async ({ page }) => {
    await page.goto('/library/any-file-id');
    
    // Click edit button
    await page.click('[data-testid=edit-metadata]');
    
    // Should show edit form
    await expect(page.locator('[data-testid=metadata-form]')).toBeVisible();
    
    // Edit file name
    await page.fill('[data-testid=name-input]', 'Updated File Name');
    
    // Add tags
    await page.fill('[data-testid=tags-input]', 'tag1, tag2, tag3');
    
    // Save changes
    await page.click('[data-testid=save-metadata]');
    
    // Should show success message
    await expect(page.locator('text=Metadata updated successfully')).toBeVisible();
    
    // Should reflect changes
    await expect(page.locator('[data-testid=file-name]')).toContainText('Updated File Name');
  });

  test('should allow sharing files', async ({ page }) => {
    await page.goto('/library/any-file-id');
    
    // Click share button
    await page.click('[data-testid=share-button]');
    
    // Should show share modal
    await expect(page.locator('[data-testid=share-modal]')).toBeVisible();
    
    // Generate share link
    await page.click('[data-testid=generate-link]');
    
    // Should show share link
    await expect(page.locator('[data-testid=share-link]')).toBeVisible();
    
    // Copy link
    await page.click('[data-testid=copy-link]');
    
    // Should show copied message
    await expect(page.locator('text=Link copied to clipboard')).toBeVisible();
  });

  test('should handle preview errors gracefully', async ({ page }) => {
    // Mock a file that fails to load
    await page.route('/api/files/error-file-id/preview', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Preview not available' }),
      });
    });
    
    await page.goto('/library/error-file-id');
    
    // Should show error message
    await expect(page.locator('text=Preview not available')).toBeVisible();
    await expect(page.locator('[data-testid=preview-error]')).toBeVisible();
    
    // Should offer download option
    await expect(page.locator('button:has-text("Download")')).toBeVisible();
  });

  test('should support keyboard navigation in preview', async ({ page }) => {
    await page.goto('/library');
    
    // Open first file preview
    await page.click('[data-testid=file-item]:first-child');
    
    // Navigate to next file with keyboard
    await page.keyboard.press('ArrowRight');
    
    // Should load next file
    await expect(page.locator('[data-testid=preview-content]')).toBeVisible();
    
    // Navigate to previous file
    await page.keyboard.press('ArrowLeft');
    
    // Should load previous file
    await expect(page.locator('[data-testid=preview-content]')).toBeVisible();
    
    // Close preview with Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid=file-preview]')).not.toBeVisible();
  });
});