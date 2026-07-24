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
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('Page loaded successfully. Now looking for the Account button...');
    
    // Evaluate in browser context to find the account button and click it
    await page.evaluate(() => {
      // Find the button that sets activeView to 'account'. Usually has the User icon.
      const buttons = Array.from(document.querySelectorAll('button'));
      const accountBtn = buttons.find(b => b.innerHTML.includes('<svg') && b.innerHTML.includes('User') || b.textContent.includes('Account'));
      if (accountBtn) {
        accountBtn.click();
      } else {
        // Just try clicking the first button with a User icon SVG path
        const userIconBtn = document.querySelector('button svg.lucide-user')?.closest('button');
        if (userIconBtn) userIconBtn.click();
      }
    });

    console.log('Clicked Account button. Waiting 3 seconds for errors...');
    await new Promise(r => setTimeout(r, 3000));

  } catch (err) {
    console.log('Navigation or click error:', err.message);
  }

  await browser.close();
})();
