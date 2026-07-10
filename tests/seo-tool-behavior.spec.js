import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('SEO Tool User Behavior Tests', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage before each test
    await page.goto(BASE_URL);
    // Wait for Next.js hydration to complete so click handlers are attached
    await page.waitForTimeout(1500);
  });

  test('should load the homepage and check main content elements', async ({ page }) => {
    // Check if the main heading is visible
    await expect(page.locator('h1')).toContainText('Dominate Google & AI Search Engines with');

    // Check if the "Launch SEO Auditor" button is visible and redirects to /audit/
    const auditorLink = page.getByRole('link', { name: 'Launch SEO Auditor' });
    await expect(auditorLink).toBeVisible();
    await auditorLink.click();
    await expect(page).toHaveURL(/.*\/audit/);
  });

  test('should allow users to switch tabs on the interactive dashboard mockup', async ({ page }) => {
    // 1. Verify default tab is 'Overview' and displays correct content
    await expect(page.getByText('Average SEO Score')).toBeVisible();
    await expect(page.getByText('Grade')).toBeVisible();

    // 2. Simulate user clicking the 'Meta Inspector' tab
    const metaInspectorTab = page.getByRole('tab', { name: 'Meta Inspector', exact: true });
    await metaInspectorTab.click();

    // Verify Meta Inspector content is now shown
    await expect(page.getByText('Title tag length (58 chars)')).toBeVisible();

    // 3. Simulate user clicking the 'Performance' tab
    const performanceTab = page.getByRole('tab', { name: 'Performance', exact: true });
    await performanceTab.click();

    // Verify Performance content is shown
    await expect(page.getByText('Speed Index', { exact: true })).toBeVisible();
    await expect(page.getByText('First Contentful Paint', { exact: true })).toBeVisible();
  });

  test('should allow users to input a domain and submit an audit', async ({ page }) => {
    // Find the input field inside the bottom audit form
    const auditInput = page.getByPlaceholder('e.g., mysite.com');
    await expect(auditInput).toBeVisible();

    // Simulate user typing a website URL
    await auditInput.fill('example.com');

    // Simulate user clicking the submit button
    const analyzeButton = page.getByRole('button', { name: 'Analyze Now' });
    await analyzeButton.click();

    // Verify user is redirected to the /audit route with the correct query parameters
    await page.waitForURL(/.*\/audit\/\?url=.*/);

    // Assert that the URL contains the encoded target URL
    const currentUrl = page.url();
    expect(currentUrl).toContain('https%3A%2F%2Fexample.com');
  });

  test('should toggle FAQ accordions on click', async ({ page }) => {
    // Locate the first FAQ question button
    const firstFaqButton = page.getByRole('button', { name: /What is AEO and GEO optimization/ });
    await expect(firstFaqButton).toBeVisible();

    // Sibling CSS selector to get the immediately following answer drawer div
    const faqContainer = page.locator('button:has-text("What is AEO and GEO optimization?") + div');

    // Initially, it should have the collapsed class (max-h-0)
    await expect(faqContainer).toHaveClass(/max-h-0/);

    // Click to expand the FAQ
    await firstFaqButton.click();

    // Assert the answer container expands and has the max-h-48 class
    await expect(faqContainer).toHaveClass(/max-h-48/);
  });

  test('should load dynamic city landing pages with coordinates and estimators', async ({ page }) => {
    // Navigate to a specific city SEO services page
    await page.goto(`${BASE_URL}/seo-services/los-angeles/`);

    // 1. Verify the location heading is present and customized
    await expect(page.locator('h1')).toContainText('SEO Services in Los Angeles');

    // 2. Verify Google SERP preview simulator is visible
    await expect(page.locator('text=/Local Map Pack Proximity/i')).toBeVisible();

    // 3. Verify Local SEO opportunity calculator is visible
    await expect(page.locator('text=/SEO Revenue Potential/i')).toBeVisible();

    // 4. Verify coordinates and address details are loaded in HTML (schema markup check)
    const schemaScript = await page.locator('script[type="application/ld+json"]').first();
    const schemaContent = await schemaScript.innerHTML();
    expect(schemaContent).toContain('"addressLocality":"Los Angeles"');
  });
});


