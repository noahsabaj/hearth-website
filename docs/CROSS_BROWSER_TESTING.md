# Cross-Browser Testing Guide

This document outlines the cross-browser testing setup for Hearth Website, ensuring compatibility across all major browsers and devices.

## Overview

Our cross-browser testing strategy includes:
- **Selenium Grid** for distributed browser testing
- **WebDriver** automation for Chrome, Firefox, and Edge
- **Responsive testing** across multiple viewports
- **Feature compatibility** validation
- **Visual regression** detection
- **Performance benchmarking** per browser

## Quick Start

### 1. Start Selenium Grid

```bash
# Start Selenium Grid with Docker
npm run selenium:start

# Check grid status
npm run selenium:logs
```

### 2. Run Cross-Browser Tests

```bash
# Run all cross-browser tests
npm run test:cross-browser

# Check browser compatibility matrix
npm run test:compatibility

# Run specific browser tests
BROWSER=chrome npm run test:cross-browser
```

### 3. Stop Selenium Grid

```bash
npm run selenium:stop
```

## Test Scenarios

### Core Functionality Tests
- **Homepage Load** - Critical elements and performance
- **Navigation** - Menu functionality and routing
- **Search** - Search modal and results
- **Theme Toggle** - Dark/light mode switching
- **Form Interaction** - Email subscription and validation
- **Responsive Design** - Mobile, tablet, desktop layouts

### Browser Support Matrix

| Browser | Version | WebGPU | OffscreenCanvas | WebAssembly | Status |
|---------|---------|---------|------------------|-------------|---------|
| Chrome  | Latest  | ✅      | ✅              | ✅          | Full Support |
| Firefox | Latest  | ⚠️      | ✅              | ✅          | Good Support |
| Edge    | Latest  | ✅      | ✅              | ✅          | Full Support |
| Safari  | 14+     | ⚠️      | ⚠️              | ✅          | Limited Support |

### Mobile Browser Support

| Browser | Platform | Support Level | Notes |
|---------|----------|---------------|-------|
| Chrome Mobile | Android/iOS | Full | Complete feature parity |
| Safari Mobile | iOS | Good | Some WebGPU limitations |
| Firefox Mobile | Android | Good | Solid compatibility |
| Samsung Internet | Android | Good | Based on Chromium |

## Configuration

### Environment Variables

```bash
# Selenium Grid URL (default: http://localhost:4444/wd/hub)
SELENIUM_HUB_URL=http://localhost:4444/wd/hub

# Browser selection for single-browser tests
BROWSER=chrome

# Test timeout (default: 10000ms)
TEST_TIMEOUT=15000

# Application URL for testing
APP_URL=http://localhost:3000
```

### Browser Capabilities

The test runner supports different browser configurations:

```javascript
// Chrome with WebGPU
{
  browserName: 'chrome',
  'goog:chromeOptions': {
    args: ['--enable-unsafe-webgpu', '--no-sandbox']
  }
}

// Firefox with enhanced features
{
  browserName: 'firefox',
  'moz:firefoxOptions': {
    prefs: {
      'dom.webgpu.enabled': true
    }
  }
}
```

## Test Results

### Report Structure

```
test-results/
├── cross-browser-report-{timestamp}.json
├── cross-browser-screenshots/
│   ├── Homepage-Load-chrome-{timestamp}.png
│   ├── Navigation-firefox-{timestamp}.png
│   └── Search-Functionality-edge-{timestamp}.png
└── compatibility-matrix.txt
```

### Sample Report

```json
{
  "timestamp": "2025-01-20T10:30:00.000Z",
  "duration": "45.23s",
  "browsers": 3,
  "scenarios": 6,
  "totalTests": 18,
  "passed": 17,
  "failed": 1,
  "results": [
    {
      "browser": "chrome",
      "test": "Homepage Load",
      "status": "passed",
      "elements": {
        "header": true,
        "hero": true
      }
    }
  ]
}
```

## CI/CD Integration

### GitHub Actions Workflow

The cross-browser tests run automatically on:
- **Push** to main/develop branches
- **Pull requests** to main/develop
- **Daily schedule** at 6 AM UTC

### Workflow Features
- Parallel browser testing
- Selenium Grid in containers
- Artifact collection (screenshots, reports)
- PR comments with results
- Performance regression detection

## Troubleshooting

### Common Issues

#### Selenium Grid Not Starting
```bash
# Check Docker status
docker ps

# View container logs
npm run selenium:logs

# Restart grid
npm run selenium:stop && npm run selenium:start
```

#### Test Timeouts
```bash
# Increase timeout in environment
export TEST_TIMEOUT=30000
npm run test:cross-browser
```

#### Browser Not Available
```bash
# Check available browsers in grid
curl http://localhost:4444/grid/api/proxy

# Add more browser nodes
docker-compose -f docker-compose.selenium.yml up --scale chrome=4
```

### Debug Mode

Enable debug logging:

```bash
# Enable verbose Selenium logging
DEBUG=selenium-webdriver npm run test:cross-browser

# Keep browser open for debugging
HEADLESS=false npm run test:cross-browser
```

## Performance Considerations

### Optimization Tips

1. **Parallel Execution** - Run browsers in parallel when possible
2. **Shared Sessions** - Reuse browser instances for multiple tests
3. **Smart Waiting** - Use explicit waits instead of sleep
4. **Screenshot Strategy** - Only capture on failures or key points

### Resource Usage

- **Memory**: ~2GB per browser instance
- **CPU**: Scales with parallel execution
- **Storage**: Screenshots and reports (~100MB per run)

## Best Practices

### Test Design
- Keep tests focused and atomic
- Use page objects for maintainability
- Implement proper error handling
- Include accessibility checks

### Maintenance
- Update browser versions regularly
- Monitor test execution times
- Clean up old test artifacts
- Review compatibility matrix monthly

## Future Enhancements

### Planned Features
- BrowserStack integration for more browsers
- Visual regression testing expansion
- Performance monitoring integration
- Mobile device testing farm
- Automated browser update notifications

### Advanced Scenarios
- File upload/download testing
- Geolocation testing
- Camera/microphone permission testing
- WebRTC functionality validation
- Progressive Web App features testing