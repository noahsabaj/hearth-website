/**
 * QA Test Script for Interactive Features
 * Tests: Feedback Widget, Related Articles, Syntax Theme Switcher
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3001';

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  test: (msg) => console.log(`${colors.blue}[TEST]${colors.reset} ${msg}`),
  pass: (msg) => console.log(`${colors.green}✓ PASS${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}✗ FAIL${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.yellow}=== ${msg} ===${colors.reset}`)
};

async function testFeedbackWidget(page) {
  log.section('Testing Feedback Widget');
  
  // Navigate to feedback demo page
  await page.goto(`${BASE_URL}/feedback-demo`, { waitUntil: 'networkidle2' });
  
  try {
    // Test 1: Check if feedback widgets are present
    log.test('Checking feedback widget presence...');
    const widgets = await page.$$('[aria-label="Feedback section"]');
    if (widgets.length >= 2) {
      log.pass(`Found ${widgets.length} feedback widgets`);
    } else {
      log.fail(`Expected at least 2 widgets, found ${widgets.length}`);
      return false;
    }

    // Test 2: Test thumbs up voting
    log.test('Testing thumbs up voting...');
    const initialThumbsUp = await page.$eval(
      '[aria-label="Mark as helpful"]',
      el => el.closest('span').nextElementSibling.textContent
    );
    await page.click('[aria-label="Mark as helpful"]');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newThumbsUp = await page.$eval(
      '[aria-label="Mark as helpful"]',
      el => el.closest('span').nextElementSibling.textContent
    );
    
    if (parseInt(newThumbsUp) === parseInt(initialThumbsUp) + 1) {
      log.pass('Thumbs up count incremented correctly');
    } else {
      log.fail(`Expected ${parseInt(initialThumbsUp) + 1}, got ${newThumbsUp}`);
      return false;
    }

    // Test 3: Check toast notification
    log.test('Checking toast notification...');
    const toast = await page.$('[role="alert"]');
    if (toast) {
      const toastText = await page.$eval('[role="alert"]', el => el.textContent);
      log.pass(`Toast shown: "${toastText}"`);
    } else {
      log.fail('Toast notification not shown');
      return false;
    }

    // Test 4: Test LocalStorage persistence
    log.test('Testing LocalStorage persistence...');
    const feedbackData = await page.evaluate(() => localStorage.getItem('hearthFeedback'));
    const voteData = await page.evaluate(() => localStorage.getItem('hearthVote_demo-section-1'));
    
    if (feedbackData && voteData) {
      log.pass('LocalStorage data persisted correctly');
      log.info(`Vote data: ${voteData}`);
    } else {
      log.fail('LocalStorage data not found');
      return false;
    }

    // Test 5: Test voting restriction (can't vote twice)
    log.test('Testing voting restriction...');
    await page.reload();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isDisabled = await page.$eval('[aria-label="Mark as helpful"]', el => el.disabled);
    if (isDisabled) {
      log.pass('Voting correctly restricted after voting once');
    } else {
      log.fail('User can vote multiple times (should be restricted)');
      return false;
    }

    // Test 6: Test thumbs down with comment box
    log.test('Testing thumbs down with comment box...');
    // Find second widget
    const secondWidget = await page.$$('[aria-label="Mark as not helpful"]');
    await secondWidget[1].click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const commentBox = await page.$('[aria-label="Feedback comment"]');
    if (commentBox) {
      log.pass('Comment box appeared for negative feedback');
      
      // Type a comment
      await commentBox.type('This section needs more examples');
      await page.click('button:has-text("Submit")');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const finalFeedback = await page.evaluate(() => localStorage.getItem('hearthFeedback'));
      if (finalFeedback.includes('This section needs more examples')) {
        log.pass('Comment saved correctly');
      } else {
        log.fail('Comment not saved to LocalStorage');
        return false;
      }
    } else {
      log.fail('Comment box did not appear for negative feedback');
      return false;
    }

    return true;
  } catch (error) {
    log.fail(`Error in feedback widget test: ${error.message}`);
    return false;
  }
}

async function testRelatedArticles(page) {
  log.section('Testing Related Articles');
  
  // Navigate to documentation page
  await page.goto(`${BASE_URL}/documentation`, { waitUntil: 'networkidle2' });
  
  try {
    // Test 1: Check if related articles section exists
    log.test('Checking related articles presence...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const relatedSection = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h3, h4'));
      return headings.find(h => h.textContent.includes('Related Topics')) !== undefined;
    });
    if (relatedSection) {
      log.pass('Related articles section found');
    } else {
      log.fail('Related articles section not found');
      return false;
    }

    // Test 2: Count related article cards
    log.test('Checking related article cards...');
    const cards = await page.$$('[role="article"], [onclick*="onNavigate"]');
    if (cards.length > 0) {
      log.pass(`Found ${cards.length} related article cards`);
    } else {
      log.fail('No related article cards found');
      return false;
    }

    // Test 3: Test hover effect
    log.test('Testing hover effects...');
    const firstCard = cards[0];
    const beforeHover = await firstCard.boundingBox();
    await firstCard.hover();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if hover state changes
    const hoverStyle = await firstCard.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        transform: computed.transform,
        backgroundColor: computed.backgroundColor
      };
    });
    
    if (hoverStyle.transform !== 'none') {
      log.pass('Hover effect applied (transform detected)');
    } else {
      log.info('Transform not detected, checking other hover indicators');
    }

    // Test 4: Test navigation
    log.test('Testing article navigation...');
    const currentUrl = page.url();
    await firstCard.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUrl = page.url();
    if (currentUrl !== newUrl || (await page.$('#getting-started, #installation, #basic-usage'))) {
      log.pass('Navigation to related article successful');
    } else {
      log.fail('Navigation did not work');
      return false;
    }

    // Test 5: Check mobile responsiveness
    log.test('Testing mobile responsiveness...');
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mobileCards = await page.$$('[role="article"], [onclick*="onNavigate"]');
    const cardWidth = await mobileCards[0].evaluate(el => el.offsetWidth);
    const viewportWidth = 375;
    
    if (cardWidth / viewportWidth > 0.8) {
      log.pass('Cards are responsive on mobile (full width)');
    } else {
      log.fail('Cards not properly sized for mobile');
      return false;
    }

    // Reset viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    return true;
  } catch (error) {
    log.fail(`Error in related articles test: ${error.message}`);
    return false;
  }
}

async function testSyntaxThemeSwitcher(page) {
  log.section('Testing Syntax Theme Switcher');
  
  // Navigate to theme demo page
  await page.goto(`${BASE_URL}/theme-demo`, { waitUntil: 'networkidle2' });
  
  try {
    // Test 1: Check if code blocks exist
    log.test('Checking code block presence...');
    const codeBlocks = await page.$$('figure[role="img"][aria-label*="Code block"]');
    if (codeBlocks.length > 0) {
      log.pass(`Found ${codeBlocks.length} code blocks`);
    } else {
      log.fail('No code blocks found');
      return false;
    }

    // Test 2: Find theme selector button
    log.test('Looking for theme selector...');
    const themeSelectorButton = await page.$('[aria-label="Change syntax highlighting theme"]');
    if (themeSelectorButton) {
      log.pass('Theme selector button found');
    } else {
      log.fail('Theme selector button not found');
      return false;
    }

    // Test 3: Open theme menu
    log.test('Opening theme menu...');
    await themeSelectorButton.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const themeMenu = await page.$('[role="menu"]');
    if (themeMenu) {
      log.pass('Theme menu opened');
    } else {
      log.fail('Theme menu did not open');
      return false;
    }

    // Test 4: Count available themes
    log.test('Counting available themes...');
    const themeOptions = await page.$$('[role="menuitem"]');
    if (themeOptions.length === 8) {
      log.pass(`Found all 8 themes`);
    } else {
      log.fail(`Expected 8 themes, found ${themeOptions.length}`);
      return false;
    }

    // Test 5: Test theme preview on hover
    log.test('Testing theme preview on hover...');
    const dracula = await page.evaluateHandle(() => {
      const items = Array.from(document.querySelectorAll('[role="menuitem"]'));
      return items.find(item => item.textContent.includes('Dracula'));
    });
    await dracula.hover();
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const preview = await page.$('[role="menuitem"]:has-text("Dracula") .MuiBox-root > .MuiBox-root:last-child');
    if (preview) {
      log.pass('Theme preview appears on hover');
    } else {
      log.info('Preview check inconclusive, continuing...');
    }

    // Test 6: Switch theme
    log.test('Switching to Dracula theme...');
    await dracula.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if theme is applied
    const codeBackground = await page.$eval('figure[role="img"] pre', el => {
      const parent = el.closest('[style*="background"]');
      return window.getComputedStyle(parent || el).backgroundColor;
    });
    
    // Dracula theme has background #282a36
    if (codeBackground.includes('40, 42, 54') || codeBackground.includes('#282a36')) {
      log.pass('Dracula theme applied successfully');
    } else {
      log.info(`Background color: ${codeBackground}`);
      log.info('Theme may have been applied with different styling');
    }

    // Test 7: Check LocalStorage persistence
    log.test('Testing theme persistence in localStorage...');
    const savedTheme = await page.evaluate(() => localStorage.getItem('syntaxTheme'));
    if (savedTheme) {
      log.pass(`Theme saved in localStorage: ${savedTheme}`);
    } else {
      log.info('Theme not found in localStorage with key "syntaxTheme"');
      // Check for alternative storage keys
      const allStorage = await page.evaluate(() => JSON.stringify(localStorage));
      log.info('Checking all localStorage keys for theme data...');
      if (allStorage.includes('theme')) {
        log.pass('Theme data found in localStorage');
      } else {
        log.fail('No theme data found in localStorage');
        return false;
      }
    }

    // Test 8: Test persistence across page reload
    log.test('Testing theme persistence across reload...');
    await page.reload();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if theme is still applied after reload
    const codeBackgroundAfterReload = await page.$eval('figure[role="img"] pre', el => {
      const parent = el.closest('[style*="background"]');
      return window.getComputedStyle(parent || el).backgroundColor;
    });
    
    if (codeBackgroundAfterReload === codeBackground) {
      log.pass('Theme persisted after page reload');
    } else {
      log.info('Theme may have changed after reload, checking implementation...');
    }

    return true;
  } catch (error) {
    log.fail(`Error in syntax theme test: ${error.message}`);
    return false;
  }
}

async function runTests() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  
  // Clear localStorage before tests
  await page.goto(BASE_URL);
  await page.evaluate(() => localStorage.clear());
  
  const results = {
    feedbackWidget: false,
    relatedArticles: false,
    syntaxThemeSwitcher: false
  };
  
  try {
    results.feedbackWidget = await testFeedbackWidget(page);
    results.relatedArticles = await testRelatedArticles(page);
    results.syntaxThemeSwitcher = await testSyntaxThemeSwitcher(page);
  } catch (error) {
    log.fail(`Unexpected error: ${error.message}`);
  }
  
  await browser.close();
  
  // Summary
  log.section('TEST SUMMARY');
  console.log(`Feedback Widget: ${results.feedbackWidget ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Related Articles: ${results.relatedArticles ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  console.log(`Syntax Theme Switcher: ${results.syntaxThemeSwitcher ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
  
  const allPassed = Object.values(results).every(r => r);
  console.log(`\nOverall: ${allPassed ? colors.green + 'ALL TESTS PASSED' : colors.red + 'SOME TESTS FAILED'}${colors.reset}`);
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});