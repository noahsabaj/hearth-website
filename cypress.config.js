const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // Base URL for the application
    baseUrl: 'http://localhost:3000',
    
    // Spec patterns
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Support file
    supportFile: 'cypress/support/e2e.ts',
    
    // Fixtures folder
    fixturesFolder: 'cypress/fixtures',
    
    // Screenshots and videos
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // Video settings
    video: true,
    videoCompression: 32,
    
    // Screenshot settings
    screenshotOnRunFailure: true,
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Wait settings
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Retry settings
    retries: {
      runMode: 2,    // Retry failed tests in CI
      openMode: 0,   // Don't retry in interactive mode
    },
    
    // Browser settings
    chromeWebSecurity: false,
    
    // Test isolation
    testIsolation: true,
    
    // Experimental features
    experimentalStudio: true,
    experimentalRunAllSpecs: true,
    
    setupNodeEvents(on, config) {
      // Task plugins
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        
        // Custom task for generating test data
        generateTestData() {
          return {
            timestamp: new Date().toISOString(),
            randomId: Math.random().toString(36).substr(2, 9),
          };
        },
        
        // Custom task for clearing test data
        clearTestData() {
          // Implementation for clearing test data
          return null;
        },
      });
      
      // Before browser launch
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
          // Add Chrome flags for better testing
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-web-security');
          
          // Enable accessibility features
          launchOptions.args.push('--force-enable-acc');
        }
        
        if (browser.name === 'firefox') {
          // Firefox specific settings
          launchOptions.preferences['accessibility.force_disabled'] = 0;
        }
        
        return launchOptions;
      });
      
      // After screenshot
      on('after:screenshot', (details) => {
        console.log('Screenshot taken:', details.path);
      });
      
      // Environment variables based on config
      if (config.env.coverage) {
        require('@cypress/code-coverage/task')(on, config);
      }
      
      // Percy for visual testing
      if (config.env.percy) {
        require('@percy/cypress/task')(on, config);
      }
      
      return config;
    },
    
    // Environment variables
    env: {
      // API endpoints
      apiUrl: 'http://localhost:3001/api',
      
      // Test user credentials
      testUser: {
        email: 'test@example.com',
        password: 'testpassword123',
      },
      
      // Feature flags for testing
      features: {
        newUI: false,
        betaFeatures: true,
      },
      
      // Coverage collection
      coverage: true,
      
      // Visual testing
      percy: false,
      
      // Performance testing
      lighthouse: false,
    },
    
    // Exclude specific spec files
    excludeSpecPattern: [
      '**/*.hot-update.js',
      '**/node_modules/**',
      '**/dist/**',
    ],
  },
  
  component: {
    // Component testing configuration
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    
    // Spec patterns for component tests
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    
    // Support file for component tests
    supportFile: 'cypress/support/component.ts',
    
    // Viewport for component tests
    viewportWidth: 800,
    viewportHeight: 600,
    
    // Index HTML for component mounting
    indexHtmlFile: 'cypress/support/component-index.html',
    
    setupNodeEvents(on, config) {
      // Component-specific setup
      if (config.env.coverage) {
        require('@cypress/code-coverage/task')(on, config);
      }
      
      return config;
    },
  },
  
  // Global configuration
  watchForFileChanges: true,
  numTestsKeptInMemory: 50,
  
  // Downloads
  downloadsFolder: 'cypress/downloads',
  trashAssetsBeforeRuns: true,
  
  // Reporter options for CI
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress/reporter-config.json',
  },
  
  // Logging
  logLevel: 'warn',
  
  // User agent
  userAgent: 'Cypress E2E Tests - Hearth Engine',
  
  // Hosts
  hosts: {
    '*.hearth-engine.local': '127.0.0.1',
  },
  
  // Block specific hosts (for testing offline scenarios)
  blockHosts: [
    // Block third-party analytics in tests
    '*.google-analytics.com',
    '*.googletagmanager.com',
    '*.facebook.com',
    '*.twitter.com',
  ],
  
  // Modifiers for keyboard shortcuts
  modifierKey: 'ctrl',
  
  // Animation and transition settings
  animationDistanceThreshold: 5,
  waitForAnimations: true,
  
  // Scrolling behavior
  scrollBehavior: 'center',
  
  // Intercept settings
  experimentalInterceptChrome: true,
};