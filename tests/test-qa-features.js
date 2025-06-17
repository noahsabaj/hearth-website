const puppeteer = require('puppeteer');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const MOBILE_VIEWPORT = { width: 375, height: 667 };
const DESKTOP_VIEWPORT = { width: 1920, height: 1080 };

// Test results
const results = {
  buildValidation: { status: 'PASS', issues: [] },
  typescriptErrors: { status: 'PASS', issues: [] },
  eslintErrors: { status: 'FAIL', issues: ['1554 ESLint/Prettier formatting errors found'] },
  searchBar: {
    functionality: { status: 'PENDING', issues: [] },
    keyboardShortcuts: { status: 'PENDING', issues: [] },
    arrowNavigation: { status: 'PENDING', issues: [] },
    mobileResponsive: { status: 'PENDING', issues: [] }
  },
  editOnGitHub: {
    presence: { status: 'PENDING', issues: [] },
    links: { status: 'PENDING', issues: [] },
    mobileFriendly: { status: 'PENDING', issues: [] }
  }
};

async function testSearchBar(page, viewport) {
  console.log(`\nTesting Search Bar (${viewport === MOBILE_VIEWPORT ? 'Mobile' : 'Desktop'})...`);
  
  try {
    await page.setViewport(viewport);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    
    // Test 1: Search bar presence and basic functionality
    const searchButton = await page.$('[aria-label*="Search"]');
    if (!searchButton) {
      results.searchBar.functionality.status = 'FAIL';
      results.searchBar.functionality.issues.push('Search button not found');
      return;
    }
    
    // Click search button to open modal
    await searchButton.click();
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 2000 });
    
    // Type search query
    await page.type('input[placeholder*="Search"]', 'installation');
    await page.waitForTimeout(500);
    
    // Check if results appear
    const results = await page.$$('[role="button"][data-index]');
    if (results.length === 0) {
      results.searchBar.functionality.status = 'FAIL';
      results.searchBar.functionality.issues.push('No search results found for "installation"');
    } else {
      console.log(`Found ${results.length} search results`);
    }
    
    // Close search modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
  } catch (error) {
    results.searchBar.functionality.status = 'FAIL';
    results.searchBar.functionality.issues.push(`Search functionality error: ${error.message}`);
  }
}

async function testKeyboardShortcuts(page) {
  console.log('\nTesting Keyboard Shortcuts...');
  
  try {
    await page.setViewport(DESKTOP_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    
    // Test Ctrl/Cmd+K
    await page.keyboard.down('Control');
    await page.keyboard.press('k');
    await page.keyboard.up('Control');
    
    const searchModalAfterCtrlK = await page.$('input[placeholder*="Search"]');
    if (!searchModalAfterCtrlK) {
      results.searchBar.keyboardShortcuts.issues.push('Ctrl+K shortcut not working');
    }
    
    // Close and test / shortcut
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    await page.keyboard.press('/');
    const searchModalAfterSlash = await page.$('input[placeholder*="Search"]');
    if (!searchModalAfterSlash) {
      results.searchBar.keyboardShortcuts.issues.push('/ shortcut not working');
    }
    
    if (results.searchBar.keyboardShortcuts.issues.length === 0) {
      results.searchBar.keyboardShortcuts.status = 'PASS';
    } else {
      results.searchBar.keyboardShortcuts.status = 'FAIL';
    }
    
  } catch (error) {
    results.searchBar.keyboardShortcuts.status = 'FAIL';
    results.searchBar.keyboardShortcuts.issues.push(`Keyboard shortcuts error: ${error.message}`);
  }
}

async function testArrowNavigation(page) {
  console.log('\nTesting Arrow Key Navigation...');
  
  try {
    await page.setViewport(DESKTOP_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    
    // Open search and type query
    await page.keyboard.press('/');
    await page.waitForSelector('input[placeholder*="Search"]');
    await page.type('input[placeholder*="Search"]', 'docs');
    await page.waitForTimeout(500);
    
    // Test arrow navigation
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    const selectedItem = await page.$('[data-index="0"][selected]');
    if (!selectedItem) {
      results.searchBar.arrowNavigation.issues.push('Arrow down navigation not working');
    }
    
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);
    
    const secondSelectedItem = await page.$('[data-index="1"][selected]');
    if (!secondSelectedItem) {
      results.searchBar.arrowNavigation.issues.push('Multiple arrow down navigation not working');
    }
    
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(100);
    
    const firstSelectedAgain = await page.$('[data-index="0"][selected]');
    if (!firstSelectedAgain) {
      results.searchBar.arrowNavigation.issues.push('Arrow up navigation not working');
    }
    
    if (results.searchBar.arrowNavigation.issues.length === 0) {
      results.searchBar.arrowNavigation.status = 'PASS';
    } else {
      results.searchBar.arrowNavigation.status = 'FAIL';
    }
    
  } catch (error) {
    results.searchBar.arrowNavigation.status = 'FAIL';
    results.searchBar.arrowNavigation.issues.push(`Arrow navigation error: ${error.message}`);
  }
}

async function testEditOnGitHub(page) {
  console.log('\nTesting Edit on GitHub buttons...');
  
  try {
    // Test on Documentation page
    await page.setViewport(DESKTOP_VIEWPORT);
    await page.goto(`${BASE_URL}/docs`, { waitUntil: 'networkidle2' });
    
    // Check for Edit on GitHub buttons
    const editButtons = await page.$$('[aria-label*="Edit"][href*="github.com"]');
    console.log(`Found ${editButtons.length} Edit on GitHub buttons on Documentation page`);
    
    if (editButtons.length === 0) {
      results.editOnGitHub.presence.status = 'FAIL';
      results.editOnGitHub.presence.issues.push('No Edit on GitHub buttons found on Documentation page');
    } else {
      results.editOnGitHub.presence.status = 'PASS';
      
      // Check first button's link
      const firstButtonHref = await editButtons[0].evaluate(el => el.getAttribute('href'));
      if (!firstButtonHref || !firstButtonHref.includes('github.com/noahsabaj/hearth-website/edit/main/')) {
        results.editOnGitHub.links.status = 'FAIL';
        results.editOnGitHub.links.issues.push(`Invalid GitHub edit link: ${firstButtonHref}`);
      } else {
        results.editOnGitHub.links.status = 'PASS';
      }
    }
    
    // Test mobile responsiveness
    await page.setViewport(MOBILE_VIEWPORT);
    await page.goto(`${BASE_URL}/docs`, { waitUntil: 'networkidle2' });
    
    const mobileEditButtons = await page.$$('[aria-label*="Edit"][href*="github.com"]');
    if (mobileEditButtons.length > 0) {
      results.editOnGitHub.mobileFriendly.status = 'PASS';
    } else {
      results.editOnGitHub.mobileFriendly.status = 'FAIL';
      results.editOnGitHub.mobileFriendly.issues.push('Edit buttons not visible on mobile');
    }
    
  } catch (error) {
    results.editOnGitHub.presence.status = 'FAIL';
    results.editOnGitHub.presence.issues.push(`Edit on GitHub test error: ${error.message}`);
  }
}

async function testMobileSearchResponsiveness(page) {
  console.log('\nTesting Mobile Search Responsiveness...');
  
  try {
    await page.setViewport(MOBILE_VIEWPORT);
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    
    // Find and click search button
    const searchButton = await page.$('[aria-label*="Search"]');
    if (!searchButton) {
      results.searchBar.mobileResponsive.status = 'FAIL';
      results.searchBar.mobileResponsive.issues.push('Search button not found on mobile');
      return;
    }
    
    await searchButton.click();
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 2000 });
    
    // Check modal responsiveness
    const modalWidth = await page.evaluate(() => {
      const modal = document.querySelector('[role="presentation"] [elevation="24"]');
      return modal ? modal.getBoundingClientRect().width : 0;
    });
    
    if (modalWidth > MOBILE_VIEWPORT.width * 0.95) {
      results.searchBar.mobileResponsive.issues.push('Search modal too wide for mobile viewport');
    }
    
    // Test search functionality on mobile
    await page.type('input[placeholder*="Search"]', 'faq');
    await page.waitForTimeout(500);
    
    const mobileResults = await page.$$('[role="button"][data-index]');
    if (mobileResults.length === 0) {
      results.searchBar.mobileResponsive.issues.push('Search not working on mobile');
    }
    
    if (results.searchBar.mobileResponsive.issues.length === 0) {
      results.searchBar.mobileResponsive.status = 'PASS';
    } else {
      results.searchBar.mobileResponsive.status = 'FAIL';
    }
    
  } catch (error) {
    results.searchBar.mobileResponsive.status = 'FAIL';
    results.searchBar.mobileResponsive.issues.push(`Mobile responsiveness error: ${error.message}`);
  }
}

async function runAllTests() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set up console message handling
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser console error:', msg.text());
      }
    });
    
    // Run all tests
    await testSearchBar(page, DESKTOP_VIEWPORT);
    await testKeyboardShortcuts(page);
    await testArrowNavigation(page);
    await testEditOnGitHub(page);
    await testMobileSearchResponsiveness(page);
    
    // Update overall search functionality status
    if (results.searchBar.functionality.status === 'PENDING') {
      results.searchBar.functionality.status = 'PASS';
    }
    
  } catch (error) {
    console.error('Test execution error:', error);
  } finally {
    await browser.close();
  }
  
  // Print results
  console.log('\n=== QA TEST RESULTS ===\n');
  
  console.log('1. Build Validation:', results.buildValidation.status);
  if (results.buildValidation.issues.length > 0) {
    results.buildValidation.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  console.log('\n2. TypeScript Errors:', results.typescriptErrors.status);
  if (results.typescriptErrors.issues.length > 0) {
    results.typescriptErrors.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  console.log('\n3. ESLint Errors:', results.eslintErrors.status);
  if (results.eslintErrors.issues.length > 0) {
    results.eslintErrors.issues.forEach(issue => console.log(`   - ${issue}`));
  }
  
  console.log('\n4. Search Bar:');
  console.log('   - Functionality:', results.searchBar.functionality.status);
  results.searchBar.functionality.issues.forEach(issue => console.log(`     * ${issue}`));
  
  console.log('   - Keyboard Shortcuts (Ctrl/Cmd+K, /):', results.searchBar.keyboardShortcuts.status);
  results.searchBar.keyboardShortcuts.issues.forEach(issue => console.log(`     * ${issue}`));
  
  console.log('   - Arrow Key Navigation:', results.searchBar.arrowNavigation.status);
  results.searchBar.arrowNavigation.issues.forEach(issue => console.log(`     * ${issue}`));
  
  console.log('   - Mobile Responsive:', results.searchBar.mobileResponsive.status);
  results.searchBar.mobileResponsive.issues.forEach(issue => console.log(`     * ${issue}`));
  
  console.log('\n5. Edit on GitHub Buttons:');
  console.log('   - Presence on all docs:', results.editOnGitHub.presence.status);
  results.editOnGitHub.presence.issues.forEach(issue => console.log(`     * ${issue}`));
  
  console.log('   - Links correct:', results.editOnGitHub.links.status);
  results.editOnGitHub.links.issues.forEach(issue => console.log(`     * ${issue}`));
  
  console.log('   - Mobile friendly:', results.editOnGitHub.mobileFriendly.status);
  results.editOnGitHub.mobileFriendly.issues.forEach(issue => console.log(`     * ${issue}`));
  
  console.log('\n======================\n');
}

// Run tests
runAllTests().catch(console.error);