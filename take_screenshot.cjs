const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => {
    console.log('BROWSER_ERROR_MSG:', error.message);
    console.log('BROWSER_ERROR_STACK:', error.stack);
  });
  
  console.log('Navigating to http://localhost:3000');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('Page loaded successfully. Now looking for the Account button...');
    
    // Wait a bit for React to mount
    await new Promise(r => setTimeout(r, 2000));
    
    // Evaluate in browser context to find the account button and click it
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const accountBtn = buttons.find(b => b.innerHTML.includes('<svg') && b.innerHTML.includes('User'));
      if (accountBtn) {
        accountBtn.click();
      } else {
        const userIconBtn = document.querySelector('button svg.lucide-user')?.closest('button');
        if (userIconBtn) userIconBtn.click();
      }
    });

    console.log('Clicked Account button. Waiting 3 seconds for render...');
    await new Promise(r => setTimeout(r, 3000));

    await page.screenshot({ path: path.join(__dirname, 'account_panel_screenshot.png') });
    console.log('Saved screenshot to account_panel_screenshot.png');

  } catch (err) {
    console.log('Navigation or click error:', err.message);
  }

  await browser.close();
})();
