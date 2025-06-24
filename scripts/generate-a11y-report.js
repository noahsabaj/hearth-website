/**
 * Generate comprehensive accessibility report from various tools
 */

const fs = require('fs');
const path = require('path');

function generateAccessibilityReport() {
  console.log('📊 Generating Accessibility Report...');
  
  let axeResults = {};
  let pa11yResults = {};
  
  // Read results files
  try {
    if (fs.existsSync('axe-results.json')) {
      axeResults = JSON.parse(fs.readFileSync('axe-results.json', 'utf8'));
    }
    if (fs.existsSync('pa11y-results.json')) {
      pa11yResults = JSON.parse(fs.readFileSync('pa11y-results.json', 'utf8'));
    }
  } catch (error) {
    console.warn('Could not read some results files:', error.message);
  }
  
  const violations = axeResults.violations || [];
  const passes = axeResults.passes || [];
  const pa11yIssues = pa11yResults.issues || [];
  
  // Calculate scores
  const totalTests = violations.length + passes.length;
  const passRate = totalTests > 0 ? (passes.length / totalTests * 100).toFixed(1) : 0;
  const violationScore = violations.length === 0 ? 100 : Math.max(0, 100 - violations.length * 10);
  
  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Audit Report - Hearth Engine</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #ff4500, #ff6b35);
            color: white;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            text-align: center;
        }
        .score-card {
            background: white;
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .metric {
            text-align: center;
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 6px;
        }
        .metric-value {
            font-size: 2rem;
            font-weight: bold;
            color: #ff4500;
        }
        .metric-label {
            color: #666;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
        .violation {
            background: #fff5f5;
            border-left: 4px solid #e53e3e;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 0 4px 4px 0;
        }
        .violation h4 {
            margin: 0 0 0.5rem 0;
            color: #e53e3e;
        }
        .pass {
            background: #f0fff4;
            border-left: 4px solid #38a169;
            padding: 0.5rem;
            margin-bottom: 0.5rem;
            border-radius: 0 4px 4px 0;
        }
        .impact-critical { border-left-color: #e53e3e; }
        .impact-serious { border-left-color: #dd6b20; }
        .impact-moderate { border-left-color: #d69e2e; }
        .impact-minor { border-left-color: #3182ce; }
        .summary {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
        }
        .timestamp {
            color: #666;
            font-size: 0.9rem;
            text-align: center;
            margin-top: 2rem;
        }
        .no-issues {
            text-align: center;
            color: #38a169;
            font-size: 1.2rem;
            padding: 2rem;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Accessibility Audit Report</h1>
        <p>Comprehensive WCAG 2.1 AA Compliance Analysis</p>
    </div>
    
    <div class="score-grid">
        <div class="metric">
            <div class="metric-value">${passRate}%</div>
            <div class="metric-label">Pass Rate</div>
        </div>
        <div class="metric">
            <div class="metric-value">${violations.length}</div>
            <div class="metric-label">Violations</div>
        </div>
        <div class="metric">
            <div class="metric-value">${passes.length}</div>
            <div class="metric-label">Passed Tests</div>
        </div>
        <div class="metric">
            <div class="metric-value">${pa11yIssues.length}</div>
            <div class="metric-label">Pa11y Issues</div>
        </div>
    </div>
    
    <div class="summary score-card">
        <h2>📋 Executive Summary</h2>
        ${violations.length === 0 && pa11yIssues.length === 0 
          ? '<div class="no-issues">🎉 Congratulations! No accessibility violations found.</div>'
          : `<p>Found ${violations.length} axe-core violations and ${pa11yIssues.length} Pa11y issues that need attention.</p>`
        }
        <p><strong>Overall Score:</strong> ${violationScore}/100</p>
        <p><strong>Test Coverage:</strong> ${totalTests} automated accessibility tests</p>
    </div>
    
    ${violations.length > 0 ? `
    <div class="score-card">
        <h2>❌ Violations Found (axe-core)</h2>
        ${violations.map(violation => `
            <div class="violation impact-${violation.impact}">
                <h4>${violation.id}: ${violation.help}</h4>
                <p><strong>Impact:</strong> ${violation.impact}</p>
                <p><strong>Description:</strong> ${violation.description}</p>
                <p><strong>Help URL:</strong> <a href="${violation.helpUrl}" target="_blank">${violation.helpUrl}</a></p>
                <p><strong>Affected Elements:</strong> ${violation.nodes.length}</p>
                ${violation.nodes.slice(0, 3).map(node => `
                    <div style="margin-left: 1rem; margin-top: 0.5rem;">
                        <code>${node.target.join(', ')}</code>
                        ${node.failureSummary ? `<br><small>${node.failureSummary}</small>` : ''}
                    </div>
                `).join('')}
                ${violation.nodes.length > 3 ? `<div style="margin-left: 1rem;"><small>... and ${violation.nodes.length - 3} more</small></div>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${pa11yIssues.length > 0 ? `
    <div class="score-card">
        <h2>⚠️ Pa11y Issues</h2>
        ${pa11yIssues.slice(0, 10).map(issue => `
            <div class="violation">
                <h4>${issue.code}</h4>
                <p><strong>Message:</strong> ${issue.message}</p>
                <p><strong>Selector:</strong> <code>${issue.selector}</code></p>
                <p><strong>Type:</strong> ${issue.type}</p>
            </div>
        `).join('')}
        ${pa11yIssues.length > 10 ? `<p><em>Showing first 10 of ${pa11yIssues.length} issues</em></p>` : ''}
    </div>
    ` : ''}
    
    ${passes.length > 0 ? `
    <div class="score-card">
        <h2>✅ Passed Tests (${passes.length})</h2>
        <div style="max-height: 300px; overflow-y: auto;">
            ${passes.map(pass => `
                <div class="pass">
                    <strong>${pass.id}:</strong> ${pass.help}
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}
    
    <div class="score-card">
        <h2>🔧 Recommendations</h2>
        <ul>
            <li>Run accessibility tests on every PR using automated CI/CD</li>
            <li>Perform manual testing with screen readers (NVDA, JAWS, VoiceOver)</li>
            <li>Test keyboard navigation on all interactive elements</li>
            <li>Validate color contrast ratios meet WCAG AA standards</li>
            <li>Ensure all images have descriptive alt text</li>
            <li>Test with users who have disabilities</li>
        </ul>
    </div>
    
    <div class="timestamp">
        Report generated on ${new Date().toLocaleString()}
    </div>
</body>
</html>
  `;
  
  // Write report to file
  fs.writeFileSync('accessibility-report.html', htmlReport);
  
  console.log('✅ Accessibility report generated: accessibility-report.html');
  console.log(`📊 Summary: ${violations.length} violations, ${passes.length} passes, ${pa11yIssues.length} Pa11y issues`);
  
  // Exit with error code if violations found
  if (violations.length > 0 || pa11yIssues.length > 0) {
    console.log('❌ Accessibility violations found!');
    return 1;
  } else {
    console.log('✅ No accessibility violations found!');
    return 0;
  }
}

// Run if called directly
if (require.main === module) {
  const exitCode = generateAccessibilityReport();
  process.exit(exitCode);
}

module.exports = { generateAccessibilityReport };