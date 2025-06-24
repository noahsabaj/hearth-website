// ***********************************************
// Custom commands for common testing patterns
// ***********************************************

import { mount } from 'cypress/react18';

// Extend Cypress namespace
declare global {
  namespace Cypress {
    interface Chainable {
      // Navigation commands
      visitHomePage(): Chainable<void>;
      navigateToPage(page: string): Chainable<void>;
      
      // Search commands
      searchFor(query: string): Chainable<void>;
      clearSearch(): Chainable<void>;
      
      // Theme commands
      toggleTheme(): Chainable<void>;
      toggleHighContrast(): Chainable<void>;
      setTheme(theme: 'light' | 'dark'): Chainable<void>;
      
      // Keyboard shortcuts
      pressKeyboardShortcut(shortcut: string): Chainable<void>;
      openKeyboardShortcuts(): Chainable<void>;
      
      // Responsive testing
      setMobileViewport(): Chainable<void>;
      setTabletViewport(): Chainable<void>;
      setDesktopViewport(): Chainable<void>;
      
      // Performance testing
      measurePageLoad(): Chainable<void>;
      checkLoadTime(maxTime: number): Chainable<void>;
      
      // Accessibility testing
      checkA11y(context?: string): Chainable<void>;
      checkKeyboardNavigation(): Chainable<void>;
      
      // Error handling
      handleError(): Chainable<void>;
      
      // Component mounting
      mountComponent(component: React.ReactNode, options?: any): Chainable<void>;
    }
  }
}

// Navigation commands
Cypress.Commands.add('visitHomePage', () => {
  cy.visit('/');
  cy.get('[data-testid="hero-section"]').should('be.visible');
});

Cypress.Commands.add('navigateToPage', (page: string) => {
  cy.get(`[data-testid="nav-${page}"]`).click();
  cy.url().should('include', `/${page}`);
});

// Search commands
Cypress.Commands.add('searchFor', (query: string) => {
  cy.get('[data-testid="search-input"]').clear().type(query);
  cy.get('[data-testid="search-button"]').click();
});

Cypress.Commands.add('clearSearch', () => {
  cy.get('[data-testid="search-input"]').clear();
  cy.get('[data-testid="search-clear"]').click();
});

// Theme commands
Cypress.Commands.add('toggleTheme', () => {
  cy.get('[data-testid="theme-toggle"]').click();
});

Cypress.Commands.add('toggleHighContrast', () => {
  cy.get('[data-testid="high-contrast-toggle"]').click();
});

Cypress.Commands.add('setTheme', (theme: 'light' | 'dark') => {
  cy.get('body').then(($body) => {
    const currentTheme = $body.hasClass('dark-theme') ? 'dark' : 'light';
    if (currentTheme !== theme) {
      cy.toggleTheme();
    }
  });
});

// Keyboard shortcuts
Cypress.Commands.add('pressKeyboardShortcut', (shortcut: string) => {
  switch (shortcut) {
    case '?':
      cy.get('body').type('?');
      break;
    case '/':
      cy.get('body').type('/');
      break;
    case 'Escape':
      cy.get('body').type('{esc}');
      break;
    default:
      cy.get('body').type(shortcut);
  }
});

Cypress.Commands.add('openKeyboardShortcuts', () => {
  cy.pressKeyboardShortcut('?');
  cy.get('[data-testid="keyboard-shortcuts-modal"]').should('be.visible');
});

// Responsive testing
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667); // iPhone SE
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024); // iPad
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1920, 1080); // Desktop
});

// Performance testing
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then((win) => {
    const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
    expect(loadTime).to.be.lessThan(3000); // 3 seconds max
  });
});

Cypress.Commands.add('checkLoadTime', (maxTime: number) => {
  cy.window().then((win) => {
    const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
    expect(loadTime).to.be.lessThan(maxTime);
  });
});

// Accessibility testing
Cypress.Commands.add('checkA11y', (context?: string) => {
  const options = {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa']
    }
  };
  
  if (context) {
    cy.get(context).checkA11y(options);
  } else {
    cy.checkA11y(options);
  }
});

Cypress.Commands.add('checkKeyboardNavigation', () => {
  // Test tab navigation
  cy.get('body').tab();
  cy.focused().should('be.visible');
  
  // Test escape key
  cy.focused().type('{esc}');
  
  // Test enter key
  cy.focused().type('{enter}');
});

// Error handling
Cypress.Commands.add('handleError', () => {
  cy.on('uncaught:exception', (err) => {
    // Return false to prevent Cypress from failing the test
    console.log('Handled error:', err.message);
    return false;
  });
});

// Component mounting for component tests
Cypress.Commands.add('mountComponent', (component: React.ReactNode, options = {}) => {
  const defaultOptions = {
    ...options,
  };
  
  return mount(component, defaultOptions);
});