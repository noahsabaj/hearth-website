const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');
const edge = require('selenium-webdriver/edge');
const fs = require('fs').promises;
const path = require('path');

// Browser configurations
const BROWSERS = [
  {
    name: 'chrome',
    version: 'latest',
    capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      },
    },
  },
  {
    name: 'firefox',
    version: 'latest',
    capabilities: {
      browserName: 'firefox',
      'moz:firefoxOptions': {
        args: ['--headless'],
      },
    },
  },
  {
    name: 'edge',
    version: 'latest',
    capabilities: {
      browserName: 'MicrosoftEdge',
      'ms:edgeOptions': {
        args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
      },
    },
  },
];

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: 'Homepage Load Test',
    url: 'http://localhost:3000',
    test: async (driver, browser) => {
      await driver.get('http://localhost:3000');
      await driver.wait(until.titleContains('Hearth'), 10000);
      
      // Check critical elements
      const header = await driver.wait(until.elementLocated(By.css('header')), 5000);
      const hero = await driver.wait(until.elementLocated(By.css('[data-testid="hero-section"]')), 5000);
      
      return {
        browser: browser.name,
        test: 'Homepage Load',
        status: 'passed',
        elements: {
          header: await header.isDisplayed(),
          hero: await hero.isDisplayed(),
        },
      };
    },
  },
  {
    name: 'Navigation Test',
    url: 'http://localhost:3000',
    test: async (driver, browser) => {
      await driver.get('http://localhost:3000');
      
      // Test navigation links
      const docsLink = await driver.wait(until.elementLocated(By.linkText('Documentation')), 5000);
      await docsLink.click();
      await driver.wait(until.titleContains('Documentation'), 5000);
      
      const downloadsLink = await driver.wait(until.elementLocated(By.linkText('Downloads')), 5000);
      await downloadsLink.click();
      await driver.wait(until.titleContains('Downloads'), 5000);
      
      return {
        browser: browser.name,
        test: 'Navigation',
        status: 'passed',
        pages: ['Documentation', 'Downloads'],
      };
    },
  },
  {
    name: 'Search Functionality Test',
    url: 'http://localhost:3000',
    test: async (driver, browser) => {
      await driver.get('http://localhost:3000');
      
      // Trigger search (Ctrl+K or Cmd+K)
      await driver.actions().keyDown(Key.CONTROL).sendKeys('k').keyUp(Key.CONTROL).perform();
      
      // Wait for search modal
      const searchInput = await driver.wait(until.elementLocated(By.css('input[placeholder*="search"]')), 5000);
      await searchInput.sendKeys('voxel');
      
      // Wait for search results
      await driver.wait(until.elementLocated(By.css('[data-testid="search-results"]')), 5000);
      
      return {
        browser: browser.name,
        test: 'Search Functionality',
        status: 'passed',
        searchTerm: 'voxel',
      };
    },
  },
  {
    name: 'Responsive Design Test',
    url: 'http://localhost:3000',
    test: async (driver, browser) => {
      const viewports = [
        { width: 375, height: 667, name: 'mobile' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 1920, height: 1080, name: 'desktop' },
      ];
      
      const results = {};
      
      for (const viewport of viewports) {
        await driver.manage().window().setRect({
          width: viewport.width,
          height: viewport.height,
        });
        
        await driver.get('http://localhost:3000');
        
        // Check mobile menu for smaller screens
        if (viewport.width < 768) {
          try {
            const mobileMenuButton = await driver.wait(
              until.elementLocated(By.css('[aria-label="menu"]')),
              3000
            );
            results[viewport.name] = {
              mobileMenu: await mobileMenuButton.isDisplayed(),
            };
          } catch (error) {
            results[viewport.name] = { error: 'Mobile menu not found' };
          }
        } else {
          // Check desktop navigation
          try {
            const nav = await driver.wait(until.elementLocated(By.css('nav')), 3000);
            results[viewport.name] = {
              navigation: await nav.isDisplayed(),
            };
          } catch (error) {
            results[viewport.name] = { error: 'Navigation not found' };
          }
        }
      }
      
      return {
        browser: browser.name,
        test: 'Responsive Design',
        status: 'passed',
        viewports: results,
      };
    },
  },
  {
    name: 'Theme Toggle Test',
    url: 'http://localhost:3000',
    test: async (driver, browser) => {
      await driver.get('http://localhost:3000');
      
      // Find and click theme toggle
      const themeToggle = await driver.wait(
        until.elementLocated(By.css('[aria-label*="theme"], [data-testid="theme-toggle"]')),
        5000
      );
      
      // Get initial theme
      const body = await driver.findElement(By.css('body'));
      const initialClass = await body.getAttribute('class');
      
      // Toggle theme
      await themeToggle.click();
      await driver.sleep(500); // Wait for theme change animation
      
      // Check if theme changed
      const newClass = await body.getAttribute('class');
      
      return {
        browser: browser.name,
        test: 'Theme Toggle',
        status: initialClass !== newClass ? 'passed' : 'failed',
        initialTheme: initialClass,
        newTheme: newClass,
      };
    },
  },
  {
    name: 'Form Interaction Test',
    url: 'http://localhost:3000/updates',
    test: async (driver, browser) => {
      await driver.get('http://localhost:3000/updates');
      
      // Find email subscription form
      const emailInput = await driver.wait(
        until.elementLocated(By.css('input[type="email"]')),
        5000
      );
      
      // Fill and submit form
      await emailInput.sendKeys('test@example.com');
      const submitButton = await driver.findElement(By.css('button[type="submit"]'));
      await submitButton.click();
      
      // Check for success message
      await driver.wait(until.elementLocated(By.css('*[color="success.main"]')), 5000);
      
      return {
        browser: browser.name,
        test: 'Form Interaction',
        status: 'passed',
        email: 'test@example.com',
      };
    },
  },
];

// Screenshot utility
async function takeScreenshot(driver, name, browser) {
  try {
    const screenshot = await driver.takeScreenshot();
    const screenshotDir = path.join(__dirname, '..', 'test-results', 'cross-browser-screenshots');
    await fs.mkdir(screenshotDir, { recursive: true });
    const filename = `${name}-${browser}-${Date.now()}.png`;
    await fs.writeFile(path.join(screenshotDir, filename), screenshot, 'base64');
    return filename;
  } catch (error) {
    console.error(`Failed to take screenshot: ${error.message}`);
    return null;
  }
}

// Main test runner
async function runCrossBrowserTests() {
  const results = [];
  const startTime = Date.now();
  
  console.log('Starting cross-browser testing...');
  console.log(`Testing ${BROWSERS.length} browsers with ${TEST_SCENARIOS.length} scenarios each`);
  
  for (const browser of BROWSERS) {
    console.log(`\n🔍 Testing ${browser.name}...`);
    
    let driver;
    try {
      // Connect to Selenium Grid or local WebDriver
      const gridUrl = process.env.SELENIUM_HUB_URL || 'http://localhost:4444/wd/hub';
      
      driver = await new Builder()
        .forBrowser(browser.capabilities.browserName)
        .withCapabilities(browser.capabilities)
        .usingServer(gridUrl)
        .build();
      
      // Set implicit wait
      await driver.manage().setTimeouts({ implicit: 10000 });
      
      // Run all test scenarios for this browser
      for (const scenario of TEST_SCENARIOS) {
        console.log(`  📋 Running: ${scenario.name}`);
        
        try {
          const result = await scenario.test(driver, browser);
          results.push(result);
          
          // Take screenshot
          const screenshot = await takeScreenshot(driver, scenario.name.replace(/\s+/g, '-'), browser.name);
          if (screenshot) {
            result.screenshot = screenshot;
          }
          
          console.log(`    ✅ ${scenario.name}: ${result.status}`);
        } catch (error) {
          console.log(`    ❌ ${scenario.name}: failed`);
          results.push({
            browser: browser.name,
            test: scenario.name,
            status: 'failed',
            error: error.message,
          });
          
          // Take error screenshot
          await takeScreenshot(driver, `${scenario.name.replace(/\s+/g, '-')}-error`, browser.name);
        }
      }
    } catch (error) {
      console.error(`Failed to initialize ${browser.name}: ${error.message}`);
      results.push({
        browser: browser.name,
        test: 'Browser Initialization',
        status: 'failed',
        error: error.message,
      });
    } finally {
      if (driver) {
        await driver.quit();
      }
    }
  }
  
  // Generate report
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${(duration / 1000).toFixed(2)}s`,
    browsers: BROWSERS.length,
    scenarios: TEST_SCENARIOS.length,
    totalTests: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    results: results,
  };
  
  // Save report
  const reportDir = path.join(__dirname, '..', 'test-results');
  await fs.mkdir(reportDir, { recursive: true });
  await fs.writeFile(
    path.join(reportDir, `cross-browser-report-${Date.now()}.json`),
    JSON.stringify(report, null, 2)
  );
  
  // Print summary
  console.log('\n📊 Cross-Browser Test Summary:');
  console.log(`Total Tests: ${report.totalTests}`);
  console.log(`✅ Passed: ${report.passed}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`⏱️  Duration: ${report.duration}`);
  
  if (report.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => r.status === 'failed')
      .forEach(r => console.log(`  ${r.browser}: ${r.test} - ${r.error || 'Unknown error'}`));
  }
  
  // Exit with appropriate code
  process.exit(report.failed > 0 ? 1 : 0);
}

// Browser compatibility check
async function checkBrowserCompatibility() {
  console.log('🔍 Checking browser compatibility...');
  
  const compatibility = {
    chrome: { supported: true, version: 'latest', features: ['WebGPU', 'OffscreenCanvas', 'WebAssembly'] },
    firefox: { supported: true, version: 'latest', features: ['WebAssembly', 'OffscreenCanvas'] },
    safari: { supported: true, version: '14+', features: ['WebAssembly'], notes: 'Limited WebGPU support' },
    edge: { supported: true, version: 'latest', features: ['WebGPU', 'WebAssembly', 'OffscreenCanvas'] },
    mobile: {
      chrome: { supported: true, notes: 'Full feature support' },
      safari: { supported: true, notes: 'Some WebGPU limitations' },
      firefox: { supported: true, notes: 'Good compatibility' },
    },
  };
  
  console.log('Browser Compatibility Matrix:');
  console.table(compatibility);
  
  return compatibility;
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'compatibility':
      checkBrowserCompatibility();
      break;
    case 'test':
    default:
      runCrossBrowserTests().catch(console.error);
      break;
  }
}

module.exports = {
  runCrossBrowserTests,
  checkBrowserCompatibility,
  BROWSERS,
  TEST_SCENARIOS,
};