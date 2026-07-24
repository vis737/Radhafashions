const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => {
    console.log('BROWSER_ERROR_MSG:', error.message);
    console.log('BROWSER_ERROR_STACK:', error.stack);
  });
  
  console.log('Navigating to http://localhost:3000');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Evaluate in browser context to find the account button and click it
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const accountBtn = buttons.find(b => b.innerHTML.includes('<svg') && b.innerHTML.includes('User'));
      if (accountBtn) {
        accountBtn.click();
      }
    });

    console.log('Clicked Account button. Waiting 2 seconds...');
    await new Promise(r => setTimeout(r, 2000));

    // Fill email and password
    console.log('Filling form...');
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'password123');

    console.log('Clicking Sign In...');
    await page.evaluate(() => {
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });

    console.log('Waiting 3 seconds after login...');
    await new Promise(r => setTimeout(r, 3000));

  } catch (err) {
    console.log('Test error:', err.message);
  }

  await browser.close();
})();
