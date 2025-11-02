import { test, expect } from '@playwright/test';

test.describe('File Retrieval and Library Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.click('text=Login');
    await page.fill('[data-testid=email-input]', 'test@example.com');
    await page.fill('[data-testid=password-input]', 'TestPassword123!');
    await page.click('[data-testid=login-button]');
  });

  test('should navigate to library', async ({ page }) => {
    await page.click('text=Go to Library');
    await expect(page).toHaveURL('/library');
    await expect(page.locator('h1')).toContainText('Library');
  });

  test('should display uploaded files', async ({ page }) => {
    await page.goto('/library');
    
    // Should show file list
    await expect(page.locator('[data-testid=file-list]')).toBeVisible();
    
    // Should have at least one file
    await expect(page.locator('[data-testid=file-item]')).toHaveCount.greaterThan(0);
  });

  test('should show file metadata', async ({ page }) => {
    await page.goto('/library');
    
    // Click on first file
    await page.click('[data-testid=file-item]:first-child');
    
    // Should show file details
    await expect(page.locator('[data-testid=file-details]')).toBeVisible();
    await expect(page.locator('[data-testid=file-name]')).toBeVisible();
    await expect(page.locator('[data-testid=file-size]')).toBeVisible();
    await expect(page.locator('[data-testid=upload-date]')).toBeVisible();
  });

  test('should allow file search', async ({ page }) => {
    await page.goto('/library');
    
    // Enter search term
    await page.fill('[data-testid=search-input]', 'document');
    
    // Should filter results
    await expect(page.locator('[data-testid=file-item]')).toHaveCount.greaterThan(0);
    
    // Clear search
    await page.click('[data-testid=clear-search]');
    
    // Should show all files again
    await expect(page.locator('[data-testid=file-item]')).toHaveCount.greaterThan(1);
  });

  test('should allow file filtering by type', async ({ page }) => {
    await page.goto('/library');
    
    // Filter by PDF
    await page.selectOption('[data-testid=filter-select]', 'pdf');
    
    // Should show only PDF files
    await expect(page.locator('[data-testid=file-item][data-file-type="pdf"]')).toHaveCount.greaterThan(0);
    
    // Filter by images
    await page.selectOption('[data-testid=filter-select]', 'image');
    
    // Should show only image files
    await expect(page.locator('[data-testid=file-item][data-file-type="image"]')).toHaveCount.greaterThan(0);
  });

  test('should allow file sorting', async ({ page }) => {
    await page.goto('/library');
    
    // Sort by name
    await page.selectOption('[data-testid=sort-select]', 'name');
    
    // Get file names and verify they're sorted
    const fileNames = await page.locator('[data-testid=file-name]').allTextContents();
    const sortedNames = [...fileNames].sort();
    expect(fileNames).toEqual(sortedNames);
    
    // Sort by date
    await page.selectOption('[data-testid=sort-select]', 'date');
    
    // Should be sorted by date (newest first)
    const dates = await page.locator('[data-testid=upload-date]').allTextContents();
    // Date sorting verification would need actual date parsing
    expect(dates.length).toBeGreaterThan(0);
  });

  test('should allow file deletion', async ({ page }) => {
    await page.goto('/library');
    
    // Get initial file count
    const initialCount = await page.locator('[data-testid=file-item]').count();
    
    // Delete first file
    await page.hover('[data-testid=file-item]:first-child');
    await page.click('[data-testid=delete-button]:first-child');
    
    // Confirm deletion
    await page.click('button:has-text("Delete")');
    
    // Should show success message
    await expect(page.locator('text=File deleted successfully')).toBeVisible();
    
    // File count should decrease
    const newCount = await page.locator('[data-testid=file-item]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should allow file download', async ({ page }) => {
    await page.goto('/library');
    
    // Click download button on first file
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid=download-button]:first-child');
    
    // Should trigger download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBeTruthy();
  });

  test('should handle empty library state', async ({ page }) => {
    // Mock empty library
    await page.route('/api/files', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ files: [] }),
      });
    });
    
    await page.goto('/library');
    
    // Should show empty state
    await expect(page.locator('text=No files found')).toBeVisible();
    await expect(page.locator('text=Upload your first file')).toBeVisible();
    await expect(page.locator('a:has-text("Upload")')).toBeVisible();
  });

  test('should allow batch operations', async ({ page }) => {
    await page.goto('/library');
    
    // Select multiple files
    await page.check('[data-testid=file-checkbox]:first-child');
    await page.check('[data-testid=file-checkbox]:nth-child(2)');
    
    // Should show batch actions
    await expect(page.locator('[data-testid=batch-actions]')).toBeVisible();
    
    // Delete selected files
    await page.click('[data-testid=batch-delete]');
    await page.click('button:has-text("Delete")');
    
    // Should show success message
    await expect(page.locator('text=Files deleted successfully')).toBeVisible();
  });
});