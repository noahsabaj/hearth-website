#!/usr/bin/env node

/**
 * Performance Testing Script for Hearth Engine Website
 * 
 * This script uses Lighthouse to test Core Web Vitals and performance metrics.
 * It can be run locally or in CI/CD environments.
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Performance budgets and thresholds
const PERFORMANCE_BUDGETS = {
  // Core Web Vitals
  'largest-contentful-paint': 2500, // LCP < 2.5s
  'first-input-delay': 100,         // FID < 100ms
  'cumulative-layout-shift': 0.1,   // CLS < 0.1
  
  // Additional metrics
  'first-contentful-paint': 1800,   // FCP < 1.8s
  'speed-index': 3400,              // SI < 3.4s
  'time-to-interactive': 3800,      // TTI < 3.8s
  'total-blocking-time': 200,       // TBT < 200ms
  
  // Bundle size limits
  'resource-summary:script:size': 512000,     // JS < 512KB
  'resource-summary:stylesheet:size': 102400, // CSS < 100KB
  'resource-summary:image:size': 1048576,     // Images < 1MB
  'resource-summary:total:size': 2097152,     // Total < 2MB
};

// URLs to test
const TEST_URLS = [
  'http://localhost:3000/',              // Home
  'http://localhost:3000/docs',          // Documentation
  'http://localhost:3000/engine',        // Engine
  'http://localhost:3000/downloads',     // Downloads
  'http://localhost:3000/showcase',      // Showcase
  'http://localhost:3000/faq',          // FAQ
];

// Lighthouse configuration
const LIGHTHOUSE_CONFIG = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-input-delay',
      'cumulative-layout-shift',
      'total-blocking-time',
      'speed-index',
      'time-to-interactive',
      'resource-summary',
      'unused-javascript',
      'unused-css-rules',
      'dom-size',
      'critical-request-chains',
      'main-thread-tasks',
      'bootup-time',
      'uses-webp-images',
      'uses-optimized-images',
      'modern-image-formats',
      'uses-text-compression',
      'render-blocking-resources',
    ],
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
    emulatedFormFactor: 'desktop',
  },
};

/**
 * Launch Chrome and run Lighthouse audit
 */
async function runLighthouse(url, options = {}) {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'],
  });
  
  const config = { ...LIGHTHOUSE_CONFIG, ...options };
  
  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      ...config.settings,
    }, config);
    
    await chrome.kill();
    return result;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

/**
 * Check if a metric passes the performance budget
 */
function checkBudget(auditId, value, budget) {
  const threshold = PERFORMANCE_BUDGETS[auditId];
  if (!threshold) return { passed: true, message: 'No budget defined' };
  
  const passed = value <= threshold;
  const message = passed 
    ? `✅ ${auditId}: ${value} (threshold: ${threshold})`
    : `❌ ${auditId}: ${value} exceeds threshold of ${threshold}`;
  
  return { passed, message, value, threshold };
}

/**
 * Analyze Lighthouse results against performance budgets
 */
function analyzeResults(lhr) {
  const results = {
    passed: 0,
    failed: 0,
    checks: [],
    score: lhr.categories.performance.score * 100,
  };
  
  // Check Core Web Vitals
  const audits = lhr.audits;
  
  // LCP
  if (audits['largest-contentful-paint']) {
    const check = checkBudget(
      'largest-contentful-paint',
      audits['largest-contentful-paint'].numericValue,
      PERFORMANCE_BUDGETS['largest-contentful-paint']
    );
    results.checks.push(check);
    check.passed ? results.passed++ : results.failed++;
  }
  
  // FCP
  if (audits['first-contentful-paint']) {
    const check = checkBudget(
      'first-contentful-paint',
      audits['first-contentful-paint'].numericValue,
      PERFORMANCE_BUDGETS['first-contentful-paint']
    );
    results.checks.push(check);
    check.passed ? results.passed++ : results.failed++;
  }
  
  // CLS
  if (audits['cumulative-layout-shift']) {
    const check = checkBudget(
      'cumulative-layout-shift',
      audits['cumulative-layout-shift'].numericValue,
      PERFORMANCE_BUDGETS['cumulative-layout-shift']
    );
    results.checks.push(check);
    check.passed ? results.passed++ : results.failed++;
  }
  
  // TBT (proxy for FID)
  if (audits['total-blocking-time']) {
    const check = checkBudget(
      'total-blocking-time',
      audits['total-blocking-time'].numericValue,
      PERFORMANCE_BUDGETS['total-blocking-time']
    );
    results.checks.push(check);
    check.passed ? results.passed++ : results.failed++;
  }
  
  // Resource sizes
  if (audits['resource-summary']) {
    const resourceSummary = audits['resource-summary'].details;
    if (resourceSummary && resourceSummary.items) {
      resourceSummary.items.forEach(item => {
        const auditId = `resource-summary:${item.resourceType}:size`;
        if (PERFORMANCE_BUDGETS[auditId]) {
          const check = checkBudget(auditId, item.size, PERFORMANCE_BUDGETS[auditId]);
          results.checks.push(check);
          check.passed ? results.passed++ : results.failed++;
        }
      });
    }
  }
  
  return results;
}

/**
 * Generate performance report
 */
function generateReport(urlResults) {
  const reportDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(reportDir, `performance-report-${timestamp}.json`);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalUrls: urlResults.length,
      averageScore: urlResults.reduce((sum, result) => sum + result.analysis.score, 0) / urlResults.length,
      totalPassed: urlResults.reduce((sum, result) => sum + result.analysis.passed, 0),
      totalFailed: urlResults.reduce((sum, result) => sum + result.analysis.failed, 0),
    },
    results: urlResults,
    budgets: PERFORMANCE_BUDGETS,
  };
  
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  return { report, reportFile };
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Starting Hearth Engine Performance Tests');
  console.log('==========================================\n');
  
  const urlResults = [];
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const url of TEST_URLS) {
    console.log(`📊 Testing: ${url}`);
    
    try {
      const result = await runLighthouse(url);
      const analysis = analyzeResults(result.lhr);
      
      console.log(`   Performance Score: ${analysis.score.toFixed(1)}/100`);
      console.log(`   Checks Passed: ${analysis.passed}`);
      console.log(`   Checks Failed: ${analysis.failed}`);
      
      // Show failed checks
      if (analysis.failed > 0) {
        console.log('   Failed Checks:');
        analysis.checks
          .filter(check => !check.passed)
          .forEach(check => console.log(`     ${check.message}`));
      }
      
      urlResults.push({
        url,
        analysis,
        timestamp: new Date().toISOString(),
      });
      
      totalPassed += analysis.passed;
      totalFailed += analysis.failed;
      
      console.log('');
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
      urlResults.push({
        url,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  // Generate report
  const { report, reportFile } = generateReport(urlResults);
  
  console.log('📋 Performance Test Summary');
  console.log('============================');
  console.log(`Average Performance Score: ${report.summary.averageScore.toFixed(1)}/100`);
  console.log(`Total Checks Passed: ${totalPassed}`);
  console.log(`Total Checks Failed: ${totalFailed}`);
  console.log(`Report saved to: ${reportFile}\n`);
  
  // Exit with error code if any tests failed
  if (totalFailed > 0) {
    console.log('❌ Some performance tests failed. Check the report for details.');
    process.exit(1);
  } else {
    console.log('✅ All performance tests passed!');
    process.exit(0);
  }
}

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Hearth Engine Performance Testing Script

Usage: node performance-test.js [options]

Options:
  --help, -h     Show this help message
  --url <url>    Test specific URL instead of all predefined URLs
  --mobile       Test with mobile configuration
  --no-budget    Skip performance budget checks

Examples:
  node performance-test.js
  node performance-test.js --url http://localhost:3000/docs
  node performance-test.js --mobile
  `);
  process.exit(0);
}

// Override URLs if specific URL provided
if (args.includes('--url')) {
  const urlIndex = args.indexOf('--url');
  if (urlIndex >= 0 && args[urlIndex + 1]) {
    TEST_URLS.length = 0;
    TEST_URLS.push(args[urlIndex + 1]);
  }
}

// Mobile configuration
if (args.includes('--mobile')) {
  LIGHTHOUSE_CONFIG.settings.emulatedFormFactor = 'mobile';
  LIGHTHOUSE_CONFIG.settings.throttling = {
    rttMs: 150,
    throughputKbps: 1638.4,
    cpuSlowdownMultiplier: 4,
    requestLatencyMs: 0,
    downloadThroughputKbps: 0,
    uploadThroughputKbps: 0,
  };
}

// Run the performance tests
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Performance test failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runLighthouse,
  analyzeResults,
  generateReport,
  PERFORMANCE_BUDGETS,
};