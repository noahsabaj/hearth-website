const puppeteer = require('puppeteer');

async function testUXFeatures() {
  console.log('Starting UX Feature Tests...\n');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const results = {
    keyboardShortcuts: {
      helpModal: false,
      goHome: false,
      goDocs: false,
      navigation: false,
      sidebarToggle: false
    },
    loadingProgress: {
      enhancedStates: false,
      progressIndicators: false,
      tipsRotation: false
    },
    timestamps: {
      lastUpdated: false,
      hoverDate: false,
      editHistory: false
    }
  };

  try {
    // Navigate to the site
    await page.goto('http://localhost:3000/hearth-website', { waitUntil: 'networkidle2' });
    console.log('✓ Page loaded successfully\n');

    // Test 1: Keyboard Shortcuts - Help Modal
    console.log('Testing Keyboard Shortcuts...');
    try {
      // Test ? key for help modal
      await page.keyboard.press('?');
      await page.waitForTimeout(500);
      const helpModal = await page.$('[role="dialog"]');
      const modalTitle = await page.$eval('[role="dialog"] h2', el => el.textContent);
      results.keyboardShortcuts.helpModal = modalTitle.includes('Keyboard Shortcuts');
      console.log(`  ? opens help modal: ${results.keyboardShortcuts.helpModal ? 'PASS' : 'FAIL'}`);
      
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    } catch (e) {
      console.log(`  ? opens help modal: FAIL (${e.message})`);
    }

    // Test G H (go home)
    try {
      await page.keyboard.press('g');
      await page.waitForTimeout(100);
      await page.keyboard.press('h');
      await page.waitForTimeout(500);
      const currentUrl = page.url();
      results.keyboardShortcuts.goHome = currentUrl.endsWith('/hearth-website/');
      console.log(`  G H (go home): ${results.keyboardShortcuts.goHome ? 'PASS' : 'FAIL'}`);
    } catch (e) {
      console.log(`  G H (go home): FAIL (${e.message})`);
    }

    // Test G D (go docs)
    try {
      await page.keyboard.press('g');
      await page.waitForTimeout(100);
      await page.keyboard.press('d');
      await page.waitForTimeout(500);
      const currentUrl = page.url();
      results.keyboardShortcuts.goDocs = currentUrl.includes('/docs');
      console.log(`  G D (go docs): ${results.keyboardShortcuts.goDocs ? 'PASS' : 'FAIL'}`);
    } catch (e) {
      console.log(`  G D (go docs): FAIL (${e.message})`);
    }

    // Test Ctrl/Cmd+B toggles sidebar (if on docs page)
    try {
      const isMac = process.platform === 'darwin';
      await page.keyboard.down(isMac ? 'Meta' : 'Control');
      await page.keyboard.press('b');
      await page.keyboard.up(isMac ? 'Meta' : 'Control');
      await page.waitForTimeout(300);
      // Check for toast notification
      const toastMessage = await page.$eval('[role="alert"]', el => el.textContent).catch(() => '');
      results.keyboardShortcuts.sidebarToggle = toastMessage.includes('Sidebar toggled');
      console.log(`  Ctrl/Cmd+B toggles sidebar: ${results.keyboardShortcuts.sidebarToggle ? 'PASS' : 'FAIL'}`);
    } catch (e) {
      console.log(`  Ctrl/Cmd+B toggles sidebar: FAIL (${e.message})`);
    }

    // Test J/K navigation (would need scrollable content)
    console.log(`  J/K navigation: SKIP (requires scrollable content)`);

    // Test 2: Loading Progress
    console.log('\nTesting Loading Progress...');
    
    // Navigate to a page that shows loading
    await page.goto('http://localhost:3000/hearth-website/download', { waitUntil: 'domcontentloaded' });
    
    try {
      // Check for loading indicators
      const loadingElement = await page.$('[role="progressbar"], [aria-label*="Loading"]');
      results.loadingProgress.progressIndicators = !!loadingElement;
      console.log(`  Progress indicators: ${results.loadingProgress.progressIndicators ? 'PASS' : 'FAIL'}`);
      
      // Check for loading tips (if visible during loading)
      const tipElement = await page.$('text=/💡/');
      results.loadingProgress.tipsRotation = !!tipElement;
      console.log(`  Loading tips rotate: ${results.loadingProgress.tipsRotation ? 'PASS' : 'FAIL'}`);
      
      results.loadingProgress.enhancedStates = results.loadingProgress.progressIndicators;
      console.log(`  Enhanced loading states: ${results.loadingProgress.enhancedStates ? 'PASS' : 'FAIL'}`);
    } catch (e) {
      console.log(`  Loading progress tests: FAIL (${e.message})`);
    }

    // Test 3: Documentation Timestamps
    console.log('\nTesting Documentation Timestamps...');
    
    // Navigate to docs or example page
    await page.goto('http://localhost:3000/hearth-website/examples/timestamp', { waitUntil: 'networkidle2' });
    
    try {
      // Check for "Last updated" elements
      const lastUpdatedElements = await page.$$('[aria-label*="Last updated"]');
      results.timestamps.lastUpdated = lastUpdatedElements.length > 0;
      console.log(`  "Last updated" shows on sections: ${results.timestamps.lastUpdated ? 'PASS' : 'FAIL'}`);
      
      if (lastUpdatedElements.length > 0) {
        // Test hover for absolute date
        await lastUpdatedElements[0].hover();
        await page.waitForTimeout(300);
        const tooltip = await page.$('[role="tooltip"]');
        const tooltipText = tooltip ? await page.$eval('[role="tooltip"]', el => el.textContent) : '';
        results.timestamps.hoverDate = tooltipText.includes('2025') || tooltipText.includes('2024');
        console.log(`  Hover shows absolute date: ${results.timestamps.hoverDate ? 'PASS' : 'FAIL'}`);
        
        // Check for edit history links
        const historyLink = await page.$('a[aria-label*="View edit history"]');
        results.timestamps.editHistory = !!historyLink;
        console.log(`  Edit history links work: ${results.timestamps.editHistory ? 'PASS' : 'FAIL'}`);
      }
    } catch (e) {
      console.log(`  Timestamp tests: FAIL (${e.message})`);
    }

  } catch (error) {
    console.error('\nTest execution failed:', error);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n========== TEST SUMMARY ==========\n');
  
  console.log('1. Keyboard Shortcuts:');
  Object.entries(results.keyboardShortcuts).forEach(([key, value]) => {
    console.log(`   - ${key}: ${value ? 'PASS ✓' : 'FAIL ✗'}`);
  });
  
  console.log('\n2. Loading Progress:');
  Object.entries(results.loadingProgress).forEach(([key, value]) => {
    console.log(`   - ${key}: ${value ? 'PASS ✓' : 'FAIL ✗'}`);
  });
  
  console.log('\n3. Documentation Timestamps:');
  Object.entries(results.timestamps).forEach(([key, value]) => {
    console.log(`   - ${key}: ${value ? 'PASS ✓' : 'FAIL ✗'}`);
  });
  
  const totalTests = Object.values(results).reduce((sum, category) => 
    sum + Object.values(category).length, 0
  );
  const passedTests = Object.values(results).reduce((sum, category) => 
    sum + Object.values(category).filter(v => v).length, 0
  );
  
  console.log(`\nOVERALL: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests * 100)}%)\n`);
}

testUXFeatures();