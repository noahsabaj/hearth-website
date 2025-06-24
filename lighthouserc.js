module.exports = {
  ci: {
    // Build configuration
    collect: {
      // URLs to audit
      url: [
        'http://localhost:3000',
        'http://localhost:3000/docs',
        'http://localhost:3000/engine',
        'http://localhost:3000/downloads',
        'http://localhost:3000/faq',
        'http://localhost:3000/showcase',
      ],
      
      // Server configuration
      startServerCommand: 'npm start',
      startServerReadyPattern: 'compiled successfully',
      startServerReadyTimeout: 30000,
      
      // Collection settings
      numberOfRuns: 3,
      settings: {
        // Chrome flags for CI
        chromeFlags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--headless',
        ],
        
        // Audit configuration
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
          'pwa',
        ],
        
        // Skip certain audits that may be flaky in CI
        skipAudits: [
          'is-on-https', // Local development uses HTTP
          'uses-http2', // Local development may not use HTTP/2
          'canonical', // May not be relevant for all pages
        ],
        
        // Throttling settings for consistent results
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        
        // Screen emulation
        emulatedFormFactor: 'desktop',
        
        // Locale
        locale: 'en-US',
      },
    },
    
    // Assertions for quality gates
    assert: {
      assertions: {
        // Performance thresholds
        'categories:performance': ['error', { minScore: 0.8 }], // 80%
        'categories:accessibility': ['error', { minScore: 0.95 }], // 95%
        'categories:best-practices': ['error', { minScore: 0.9 }], // 90%
        'categories:seo': ['error', { minScore: 0.9 }], // 90%
        'categories:pwa': ['warn', { minScore: 0.7 }], // 70% (warning only)
        
        // Core Web Vitals
        'audits:first-contentful-paint': ['error', { maxNumericValue: 2000 }], // 2s
        'audits:largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // 2.5s
        'audits:cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // 0.1
        'audits:total-blocking-time': ['error', { maxNumericValue: 300 }], // 300ms
        
        // Accessibility audits
        'audits:color-contrast': 'error',
        'audits:heading-order': 'error',
        'audits:html-has-lang': 'error',
        'audits:image-alt': 'error',
        'audits:label': 'error',
        'audits:link-name': 'error',
        'audits:meta-viewport': 'error',
        
        // Performance audits
        'audits:unused-css-rules': ['warn', { maxNumericValue: 50000 }], // 50KB
        'audits:unused-javascript': ['warn', { maxNumericValue: 100000 }], // 100KB
        'audits:modern-image-formats': 'warn',
        'audits:efficient-animated-content': 'warn',
        'audits:preload-lcp-image': 'warn',
        
        // Best practices
        'audits:uses-https': 'off', // Disabled for local development
        'audits:is-on-https': 'off', // Disabled for local development
        'audits:no-vulnerable-libraries': 'error',
        'audits:csp-xss': 'warn',
        
        // SEO audits
        'audits:document-title': 'error',
        'audits:meta-description': 'error',
        'audits:robots-txt': 'warn',
        'audits:hreflang': 'off', // May not be applicable
        
        // PWA audits (more lenient as it's primarily a documentation site)
        'audits:installable-manifest': 'off',
        'audits:splash-screen': 'off',
        'audits:themed-omnibox': 'off',
        'audits:maskable-icon': 'off',
      },
      
      // Preset configurations
      preset: 'lighthouse:recommended',
      
      // Include passed assertions in output
      includePassedAssertions: true,
    },
    
    // Upload configuration (if using Lighthouse CI server)
    upload: {
      target: 'temporary-public-storage',
      // For private server:
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: 'your-token',
    },
    
    // Server configuration (if running your own LHCI server)
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDatabasePath: './lhci.db',
      },
    },
    
    // Wizard configuration
    wizard: {
      // GitHub integration
      github: {
        // These would be set via environment variables
        // token: process.env.LHCI_GITHUB_TOKEN,
        // appToken: process.env.LHCI_GITHUB_APP_TOKEN,
      },
    },
  },
  
  // Additional configuration for different environments
  environments: {
    development: {
      ci: {
        collect: {
          url: ['http://localhost:3000'],
          numberOfRuns: 1, // Fewer runs for faster development
        },
        assert: {
          assertions: {
            // More lenient thresholds for development
            'categories:performance': ['warn', { minScore: 0.7 }],
            'categories:accessibility': ['error', { minScore: 0.9 }],
          },
        },
      },
    },
    
    staging: {
      ci: {
        collect: {
          url: [
            'https://staging.hearth-engine.com',
            'https://staging.hearth-engine.com/docs',
          ],
          numberOfRuns: 2,
        },
        assert: {
          assertions: {
            // Staging thresholds
            'categories:performance': ['error', { minScore: 0.85 }],
            'categories:accessibility': ['error', { minScore: 0.95 }],
          },
        },
      },
    },
    
    production: {
      ci: {
        collect: {
          url: [
            'https://hearth-engine.com',
            'https://hearth-engine.com/docs',
            'https://hearth-engine.com/engine',
            'https://hearth-engine.com/downloads',
          ],
          numberOfRuns: 5, // More runs for production accuracy
        },
        assert: {
          assertions: {
            // Strictest thresholds for production
            'categories:performance': ['error', { minScore: 0.9 }],
            'categories:accessibility': ['error', { minScore: 0.98 }],
            'categories:best-practices': ['error', { minScore: 0.95 }],
            'categories:seo': ['error', { minScore: 0.95 }],
          },
        },
      },
    },
  },
};