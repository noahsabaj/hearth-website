/**
 * Test with console output to debug issues
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3001';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testWithConsole() {
  console.log('Starting test with console debugging...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[PAGE ERROR] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    console.log(`[PAGE CRASH] ${error.message}`);
  });
  
  await page.setViewport({ width: 1280, height: 720 });
  
  console.log('=== CHECKING FEEDBACK DEMO PAGE ===');
  await page.goto(`${BASE_URL}/#/feedback-demo`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  
  // Get page content
  const pageContent = await page.evaluate(() => {
    const mainContent = document.querySelector('#root') || document.body;
    return {
      hasContent: mainContent.children.length > 0,
      innerText: mainContent.innerText.substring(0, 200),
      hasError: document.body.innerText.includes('Error') || document.body.innerText.includes('error')
    };
  });
  
  console.log(`Page has content: ${pageContent.hasContent}`);
  console.log(`Page text preview: "${pageContent.innerText}..."`);
  console.log(`Page has error: ${pageContent.hasError}`);
  
  // Check specific elements
  const elements = await page.evaluate(() => {
    return {
      feedbackWidgets: document.querySelectorAll('[aria-label="Feedback section"]').length,
      papers: document.querySelectorAll('.MuiPaper-root').length,
      buttons: document.querySelectorAll('button').length,
      h5Headers: Array.from(document.querySelectorAll('h5')).map(h => h.textContent)
    };
  });
  
  console.log(`\nElement counts:`);
  console.log(`- Feedback widgets: ${elements.feedbackWidgets}`);
  console.log(`- Paper components: ${elements.papers}`);
  console.log(`- Buttons: ${elements.buttons}`);
  console.log(`- H5 headers: ${elements.h5Headers.join(', ')}`);
  
  console.log('\n=== CHECKING DOCUMENTATION PAGE ===');
  await page.goto(`${BASE_URL}/#/docs`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  
  const docsContent = await page.evaluate(() => {
    const results = {};
    
    // Check page structure
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.body;
    results.hasMainContent = mainContent !== document.body;
    
    // Look for sections
    const sections = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => ({
      level: h.tagName,
      text: h.textContent
    }));
    results.sections = sections.slice(0, 10);
    
    // Check for code blocks
    results.codeBlocks = document.querySelectorAll('pre, code').length;
    
    return results;
  });
  
  console.log(`Has main content: ${docsContent.hasMainContent}`);
  console.log(`Code blocks: ${docsContent.codeBlocks}`);
  console.log(`\nSections found:`);
  docsContent.sections.forEach(s => console.log(`  ${s.level}: ${s.text}`));
  
  console.log('\n=== CHECKING CODE BLOCK DEMO ===');
  await page.goto(`${BASE_URL}/#/codeblock-demo`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  
  const codeBlockContent = await page.evaluate(() => {
    const results = {};
    
    // Look for code blocks specifically
    results.figures = document.querySelectorAll('figure').length;
    results.pres = document.querySelectorAll('pre').length;
    results.codeElements = document.querySelectorAll('code').length;
    
    // Check for theme-related elements
    const buttons = Array.from(document.querySelectorAll('button'));
    results.totalButtons = buttons.length;
    results.buttonLabels = buttons.map(b => b.getAttribute('aria-label')).filter(Boolean);
    
    // Check for syntax highlighting
    const syntaxElements = document.querySelectorAll('.keyword, .function, .string, .comment');
    results.hasSyntaxHighlighting = syntaxElements.length > 0;
    
    return results;
  });
  
  console.log(`Figures: ${codeBlockContent.figures}`);
  console.log(`Pre elements: ${codeBlockContent.pres}`);
  console.log(`Code elements: ${codeBlockContent.codeElements}`);
  console.log(`Total buttons: ${codeBlockContent.totalButtons}`);
  console.log(`Button labels: ${codeBlockContent.buttonLabels.join(', ')}`);
  console.log(`Has syntax highlighting: ${codeBlockContent.hasSyntaxHighlighting}`);
  
  await browser.close();
}

// Run tests
testWithConsole().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});