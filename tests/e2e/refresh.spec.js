import { test, expect } from '@playwright/test';

test.describe('Refresh Pattern', () => {
  test('should not have console errors on Nodes Search when refreshing', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    // Navigate to Nodes Search (will redirect to login if not authenticated, 
    // but we can still check for setup errors)
    await page.goto('/nodes/search');
    
    // Check if there are reload buttons
    const reloadBtn = page.locator('button .mdi-reload').first();
    if (await reloadBtn.isVisible()) {
      await reloadBtn.click();
    }

    expect(errors.filter(e => e.includes('useCrudReload') || e.includes('reload'))).toHaveLength(0);
  });

  test('should not have console errors on Nodes CRUD when refreshing', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    await page.goto('/nodes/test-node');
    
    const reloadBtn = page.locator('button .mdi-reload').first();
    if (await reloadBtn.isVisible()) {
      await reloadBtn.click();
    }

    expect(errors.filter(e => e.includes('useCrudReload') || e.includes('reload'))).toHaveLength(0);
  });
});
