const puppeteer = require('puppeteer');

async function simpleTest() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Enable detailed console logging
    page.on('console', msg => {
      console.log('Browser console:', msg.type(), msg.text());
    });
    
    page.on('error', err => {
      console.error('Page error:', err);
    });
    
    page.on('pageerror', err => {
      console.error('Page error:', err);
    });
    
    console.log('Loading homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check if main content loaded
    const mainContent = await page.$('#root');
    console.log('Main content found:', !!mainContent);
    
    // Take a screenshot
    await page.screenshot({ path: 'homepage-screenshot.png' });
    console.log('Screenshot saved as homepage-screenshot.png');
    
    // Try to find search button
    const searchSelectors = [
      '[aria-label*="Search"]',
      'button[aria-label*="Search"]',
      '[data-testid="search-button"]',
      'svg[data-testid="SearchIcon"]'
    ];
    
    let searchFound = false;
    for (const selector of searchSelectors) {
      const element = await page.$(selector);
      if (element) {
        console.log(`Found search element with selector: ${selector}`);
        searchFound = true;
        break;
      }
    }
    
    if (!searchFound) {
      console.log('Search button not found, looking for any buttons...');
      const buttons = await page.$$('button');
      console.log(`Found ${buttons.length} buttons on the page`);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
  }
}

simpleTest().catch(console.error);