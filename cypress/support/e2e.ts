// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import Cypress plugins
import '@cypress/code-coverage/support';
import 'cypress-axe';
import 'cypress-real-events';

// Global before hook
before(() => {
  // Seed the database or setup global state
  cy.task('log', 'Starting E2E test suite');
});

// Global beforeEach hook
beforeEach(() => {
  // Inject axe-core for accessibility testing
  cy.injectAxe();
  
  // Set up viewport for consistent testing
  cy.viewport(1280, 720);
  
  // Disable animations for faster, more reliable tests
  cy.window().then((win) => {
    win.document.querySelector('*')?.style.setProperty('animation-duration', '0s', 'important');
    win.document.querySelector('*')?.style.setProperty('animation-delay', '0s', 'important');
    win.document.querySelector('*')?.style.setProperty('transition-duration', '0s', 'important');
    win.document.querySelector('*')?.style.setProperty('transition-delay', '0s', 'important');
  });
});

// Global afterEach hook
afterEach(() => {
  // Take screenshot on failure
  if (Cypress.currentTest.state === 'failed') {
    cy.screenshot(`${Cypress.currentTest.parent?.title} -- ${Cypress.currentTest.title} (failed)`);
  }
});

// Global after hook
after(() => {
  cy.task('log', 'Finished E2E test suite');
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // Ignore React DevTools errors in test environment
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  // Ignore network errors that don't affect functionality
  if (err.message.includes('Network Error')) {
    return false;
  }
  
  // Let other errors fail the test
  return true;
});

// Custom commands for common actions
declare global {
  namespace Cypress {
    interface Chainable {
      // Navigation commands
      visitHomePage(): Chainable<void>;
      visitDocsPage(): Chainable<void>;
      visitDownloadsPage(): Chainable<void>;
      
      // Search commands
      searchFor(query: string): Chainable<void>;
      clearSearch(): Chainable<void>;
      
      // Accessibility commands
      checkA11y(context?: string, options?: any): Chainable<void>;
      
      // Theme commands
      toggleTheme(): Chainable<void>;
      toggleHighContrast(): Chainable<void>;
      
      // Keyboard commands
      pressKeyboardShortcut(key: string): Chainable<void>;
      
      // Wait commands
      waitForPageLoad(): Chainable<void>;
      waitForSearchResults(): Chainable<void>;
    }
  }
}

// Implementation note: The actual command implementations would be in commands.ts