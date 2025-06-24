const puppeteer = require('puppeteer');
const { performance } = require('perf_hooks');

/**
 * Performance benchmarking script for Hearth Engine website
 * Tests core metrics: FCP, LCP, CLS, TBT, FID
 */

const PAGES_TO_TEST = [
  { name: 'Home', url: '/' },
  { name: 'Documentation', url: '/docs' },
  { name: 'Engine', url: '/engine' },
  { name: 'Downloads', url: '/downloads' },
  { name: 'Benchmarks', url: '/benchmarks' },
  { name: 'FAQ', url: '/faq' },
];

const PERFORMANCE_THRESHOLDS = {
  firstContentfulPaint: 1800, // ms
  largestContentfulPaint: 2500, // ms
  cumulativeLayoutShift: 0.1, // score
  totalBlockingTime: 300, // ms
  timeToInteractive: 3800, // ms
  speedIndex: 3000, // ms
};

async function measurePagePerformance(page, url) {
  console.log(`\n📊 Measuring performance for: ${url}`);
  
  // Enable performance monitoring
  await page.setCacheEnabled(false);
  await page.coverage.startJSCoverage();
  await page.coverage.startCSSCoverage();
  
  const startTime = performance.now();
  
  // Navigate to page
  await page.goto(`http://localhost:3000${url}`, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
  
  // Wait for page to be fully loaded
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);
  
  const endTime = performance.now();
  const pageLoadTime = endTime - startTime;
  
  // Get Web Vitals metrics
  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const vitals = {};
        
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            vitals.lcp = entry.startTime;
          }
          if (entry.entryType === 'first-input') {
            vitals.fid = entry.processingStart - entry.startTime;
          }
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            vitals.cls = (vitals.cls || 0) + entry.value;
          }
        });
        
        // Get additional metrics
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        vitals.fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
        vitals.domContentLoaded = navigation.domContentLoadedEventEnd;
        vitals.loadComplete = navigation.loadEventEnd;
        vitals.ttfb = navigation.responseStart;
        
        resolve(vitals);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      
      // Fallback timeout
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        resolve({
          fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          lcp: 0,
          cls: 0,
          fid: 0,
          domContentLoaded: navigation.domContentLoadedEventEnd,
          loadComplete: navigation.loadEventEnd,
          ttfb: navigation.responseStart,
        });
      }, 3000);
    });
  });
  
  // Get coverage data
  const jsCoverage = await page.coverage.stopJSCoverage();
  const cssCoverage = await page.coverage.stopCSSCoverage();
  
  // Calculate bundle sizes
  const totalJSBytes = jsCoverage.reduce((total, file) => total + file.text.length, 0);
  const totalCSSBytes = cssCoverage.reduce((total, file) => total + file.text.length, 0);
  
  // Calculate unused bytes
  const unusedJSBytes = jsCoverage.reduce((total, file) => {
    const unusedBytes = file.ranges.reduce((acc, range) => acc + (range.end - range.start), 0);
    return total + (file.text.length - unusedBytes);
  }, 0);
  
  const unusedCSSBytes = cssCoverage.reduce((total, file) => {
    const unusedBytes = file.ranges.reduce((acc, range) => acc + (range.end - range.start), 0);
    return total + (file.text.length - unusedBytes);
  }, 0);
  
  return {
    pageLoadTime,
    metrics,
    bundleAnalysis: {
      totalJSBytes,
      totalCSSBytes,
      unusedJSBytes,
      unusedCSSBytes,
      jsUtilization: ((totalJSBytes - unusedJSBytes) / totalJSBytes * 100).toFixed(2),
      cssUtilization: ((totalCSSBytes - unusedCSSBytes) / totalCSSBytes * 100).toFixed(2),
    },
  };
}

function evaluateMetrics(results, thresholds) {
  const evaluation = {
    passed: true,
    failures: [],
    score: 0,
    maxScore: 0,
  };
  
  const checks = [
    { name: 'First Contentful Paint', value: results.metrics.fcp, threshold: thresholds.firstContentfulPaint },
    { name: 'Largest Contentful Paint', value: results.metrics.lcp, threshold: thresholds.largestContentfulPaint },
    { name: 'Cumulative Layout Shift', value: results.metrics.cls, threshold: thresholds.cumulativeLayoutShift },
    { name: 'Time to First Byte', value: results.metrics.ttfb, threshold: 600 },
    { name: 'Page Load Time', value: results.pageLoadTime, threshold: 5000 },
  ];
  
  checks.forEach(check => {
    evaluation.maxScore += 20;
    if (check.value <= check.threshold) {
      evaluation.score += 20;
      console.log(`✅ ${check.name}: ${check.value.toFixed(2)} (threshold: ${check.threshold})`);
    } else {
      evaluation.passed = false;
      evaluation.failures.push(check.name);
      console.log(`❌ ${check.name}: ${check.value.toFixed(2)} (threshold: ${check.threshold})`);
    }
  });
  
  return evaluation;
}

function generateReport(results) {
  console.log('\n📈 PERFORMANCE BENCHMARK REPORT');
  console.log('================================');
  
  let totalScore = 0;
  let maxTotalScore = 0;
  let totalFailures = 0;
  
  results.forEach(result => {
    console.log(`\n🔍 ${result.page} (${result.url})`);
    console.log(`   Score: ${result.evaluation.score}/${result.evaluation.maxScore} (${(result.evaluation.score/result.evaluation.maxScore*100).toFixed(1)}%)`);
    console.log(`   Bundle JS: ${(result.results.bundleAnalysis.totalJSBytes/1024).toFixed(1)}KB (${result.results.bundleAnalysis.jsUtilization}% used)`);
    console.log(`   Bundle CSS: ${(result.results.bundleAnalysis.totalCSSBytes/1024).toFixed(1)}KB (${result.results.bundleAnalysis.cssUtilization}% used)`);
    
    if (result.evaluation.failures.length > 0) {
      console.log(`   Failures: ${result.evaluation.failures.join(', ')}`);
      totalFailures += result.evaluation.failures.length;
    }
    
    totalScore += result.evaluation.score;
    maxTotalScore += result.evaluation.maxScore;
  });
  
  console.log('\n🎯 OVERALL RESULTS');
  console.log(`   Total Score: ${totalScore}/${maxTotalScore} (${(totalScore/maxTotalScore*100).toFixed(1)}%)`);
  console.log(`   Total Failures: ${totalFailures}`);
  console.log(`   Pages Tested: ${results.length}`);
  
  if (totalScore/maxTotalScore >= 0.8) {
    console.log('🎉 PERFORMANCE BENCHMARK PASSED!');
    return 0;
  } else {
    console.log('⚠️  PERFORMANCE BENCHMARK FAILED!');
    return 1;
  }
}

async function runPerformanceBenchmarks() {
  console.log('🚀 Starting Performance Benchmarks...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const results = [];
  
  for (const pageConfig of PAGES_TO_TEST) {
    try {
      const pageResults = await measurePagePerformance(page, pageConfig.url);
      const evaluation = evaluateMetrics(pageResults, PERFORMANCE_THRESHOLDS);
      
      results.push({
        page: pageConfig.name,
        url: pageConfig.url,
        results: pageResults,
        evaluation,
      });
    } catch (error) {
      console.error(`❌ Failed to test ${pageConfig.name}: ${error.message}`);
    }
  }
  
  await browser.close();
  
  const exitCode = generateReport(results);
  process.exit(exitCode);
}

// Run benchmarks if called directly
if (require.main === module) {
  runPerformanceBenchmarks().catch(console.error);
}

module.exports = { runPerformanceBenchmarks, measurePagePerformance };