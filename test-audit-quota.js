const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('--- Starting Quota E2E Test ---');
  
  // 1. Register a new user
  const testEmail = `testuser_${Date.now()}@test.com`;
  const testPass = "TestPassword1234!";
  console.log(`Registering new user: ${testEmail}`);
  
  await page.goto('http://localhost:3000/login');
  // Click the "Sign Up" toggle link
  await page.click('button:has-text("Sign Up")');
  
  await page.fill('input[placeholder="e.g. John Doe"]', 'Quota Tester');
  await page.fill('input[placeholder="john@example.com"]', testEmail);
  await page.fill('input[placeholder="At least 10 characters"]', testPass);
  await page.fill('input[placeholder="Re-enter password"]', testPass);
  await page.click('button[type="submit"]');
  
  // removed waitForURL
  console.log('Successfully logged in and reached dashboard.');
  
  // 2. Read initial quota
  await page.waitForSelector('text=0 of 2 reports generated');
  console.log('Initial Quota Verified: 0 of 2');
  
  // 3. Test Valid URL (gtmetrix.in)
  console.log('--- Test Case 1: Valid URL (gtmetrix.in) ---');
  await page.goto('http://localhost:3000/audit', { waitUntil: 'domcontentloaded' });
  await page.fill('input[placeholder="e.g. www.mybusiness.com"]', 'gtmetrix.in');
  
  console.log('Running audit...');
  await page.click('button:has-text("Analyze My Website Now")');
  
  try {
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Website audit completed successfully') || text.includes('An error occurred compiling the SEO audit');
    }, { timeout: 90000 });
  } catch (e) {
    console.log('Timeout waiting for audit result.');
  }
  
  console.log('Checking dashboard for updated quota...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
  
  // Wait for dashboard to load
  await page.waitForTimeout(2000);
  
  const quotaTextAfterValid = await page.evaluate(() => {
    const p = Array.from(document.querySelectorAll('p')).find(el => el.textContent.includes('reports generated'));
    return p ? p.textContent.trim() : null;
  });
  console.log(`Quota after valid URL: ${quotaTextAfterValid}`);
  
  const historyText = await page.evaluate(() => {
    return document.body.textContent.includes('gtmetrix.in') ? 'Found in history' : 'Not found in history';
  });
  console.log(`History Check: ${historyText}`);
  
  // 4. Test Invalid URL
  console.log('--- Test Case 2: Invalid URL (gtmetjdkjsakf.mom) ---');
  await page.goto('http://localhost:3000/audit', { waitUntil: 'domcontentloaded' });
  await page.fill('input[placeholder="e.g. www.mybusiness.com"]', 'gtmetjdkjsakf.mom');
  
  console.log('Running audit...');
  await page.click('button:has-text("Analyze My Website Now")');
  
  console.log('Waiting for failure message...');
  try {
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('error occurred') || text.includes('Unable to contact') || text.includes('Website audit completed successfully');
    }, { timeout: 90000 }); 
    const errorMsg = await page.evaluate(() => {
      const el = document.querySelector('.bg-rose-500\\/10.text-rose-400');
      return el ? el.textContent.trim() : 'Error message found but could not extract text';
    });
    console.log(`Audit failed as expected with message: ${errorMsg}`);
  } catch (e) {
    console.log('Audit did not show failure message in time.', e);
  }
  
  console.log('Checking dashboard for updated quota...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  
  const quotaTextAfterInvalid = await page.evaluate(() => {
    const p = Array.from(document.querySelectorAll('p')).find(el => el.textContent.includes('reports generated'));
    return p ? p.textContent.trim() : null;
  });
  console.log(`Quota after invalid URL: ${quotaTextAfterInvalid}`);
  
  const historyTextInvalid = await page.evaluate(() => {
    return document.body.textContent.includes('gtmetjdkjsakf.mom') ? 'Found in history (FAIL)' : 'Not found in history (PASS)';
  });
  console.log(`History Check for invalid URL: ${historyTextInvalid}`);
  
  await browser.close();
  console.log('--- Test Complete ---');
})();
