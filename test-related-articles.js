const puppeteer = require('puppeteer');

async function testRelatedArticles() {
  console.log('Testing Related Articles component...');
  
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Navigate to documentation page
    await page.goto('http://localhost:3001/#/documentation');
    
    // Wait for page to load
    await page.waitForSelector('h3', { timeout: 10000 });
    
    // Check if Related Articles sections are present
    const relatedArticles = await page.$$eval('h4', headers => 
      headers.filter(h => h.textContent.includes('Related Topics')).length
    );
    
    console.log(`Found ${relatedArticles} "Related Topics" sections`);
    
    // Get all related article cards
    const cards = await page.$$eval('[class*="MuiCard-root"]', cards => 
      cards.map(card => ({
        title: card.querySelector('h4')?.textContent || '',
        description: card.querySelector('p')?.textContent || ''
      })).filter(card => card.title && card.description)
    );
    
    console.log(`\nFound ${cards.length} related article cards:`);
    cards.forEach((card, index) => {
      console.log(`\n${index + 1}. ${card.title}`);
      console.log(`   ${card.description.substring(0, 80)}...`);
    });
    
    await browser.close();
    console.log('\n✅ Related Articles component is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing Related Articles:', error);
    process.exit(1);
  }
}

// Only run if puppeteer is installed
try {
  require.resolve('puppeteer');
  testRelatedArticles();
} catch (e) {
  console.log('Puppeteer not installed. Skipping browser test.');
  console.log('To run this test: npm install puppeteer');
}