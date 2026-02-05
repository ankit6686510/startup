import { test, expect } from '@playwright/test';

test('homepage has title and critical sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Hero section search bar
    await expect(page.getByPlaceholder(/search/i).first()).toBeVisible();

    // Featured Startups section
    await expect(page.getByText('Market Movers')).toBeVisible();

    // Stats section (check for a metric)
    await expect(page.getByText('Total Funding').first()).toBeVisible();
});
