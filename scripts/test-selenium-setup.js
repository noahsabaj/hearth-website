const { Builder } = require('selenium-webdriver');

async function testSeleniumSetup() {
  console.log('🔍 Testing Selenium setup...');
  
  const gridUrl = process.env.SELENIUM_HUB_URL || 'http://localhost:4444/wd/hub';
  console.log(`Connecting to Selenium Grid at: ${gridUrl}`);
  
  try {
    // Test Chrome browser
    console.log('Testing Chrome browser...');
    const chromeDriver = await new Builder()
      .forBrowser('chrome')
      .withCapabilities({
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
        },
      })
      .usingServer(gridUrl)
      .build();
    
    await chromeDriver.get('https://www.google.com');
    const title = await chromeDriver.getTitle();
    console.log(`✅ Chrome test successful - Page title: ${title}`);
    await chromeDriver.quit();
    
  } catch (error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('Connection refused')) {
      console.log('⚠️  Selenium Grid not running. This is expected if testing without Docker.');
      console.log('   To start Selenium Grid: npm run selenium:start');
      return false;
    } else {
      console.error('❌ Chrome test failed:', error.message);
      return false;
    }
  }
  
  console.log('🎉 Selenium setup test completed successfully!');
  return true;
}

// Health check for Selenium Grid
async function checkSeleniumHealth() {
  const http = require('http');
  const url = require('url');
  
  const gridUrl = process.env.SELENIUM_HUB_URL || 'http://localhost:4444/wd/hub';
  const statusUrl = gridUrl.replace('/wd/hub', '/status');
  
  return new Promise((resolve) => {
    const parsedUrl = url.parse(statusUrl);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: '/status',
      method: 'GET',
      timeout: 5000,
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Selenium Grid is healthy');
        resolve(true);
      } else {
        console.log(`⚠️  Selenium Grid returned status: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('timeout', () => {
      console.log('⚠️  Selenium Grid health check timed out');
      resolve(false);
    });
    
    req.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️  Selenium Grid is not running');
      } else {
        console.log(`⚠️  Selenium Grid health check failed: ${error.message}`);
      }
      resolve(false);
    });
    
    req.end();
  });
}

async function main() {
  console.log('🧪 Selenium Setup Verification\n');
  
  // Check if Selenium Grid is running
  const isHealthy = await checkSeleniumHealth();
  
  if (isHealthy) {
    // Run full test if grid is available
    await testSeleniumSetup();
  } else {
    console.log('\n📋 Setup Instructions:');
    console.log('1. Start Selenium Grid: npm run selenium:start');
    console.log('2. Wait for containers to start: npm run selenium:logs');
    console.log('3. Run cross-browser tests: npm run test:cross-browser');
    console.log('\n🔧 Alternative: Run tests without Docker using local browser drivers');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testSeleniumSetup,
  checkSeleniumHealth,
};