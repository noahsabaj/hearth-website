// Simple test to check if basic components can be imported
const React = require('react');
const { render } = require('@testing-library/react');

// Test basic rendering without our custom test utils
try {
  const result = render(React.createElement('div', {}, 'Hello World'));
  console.log('Basic render works');
} catch (error) {
  console.error('Basic render failed:', error.message);
}