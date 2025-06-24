describe('Home Page', () => {
  beforeEach(() => {
    cy.visitHomePage();
  });

  describe('Page Loading', () => {
    it('loads the home page successfully', () => {
      cy.get('h1').should('contain', 'Hearth Engine');
      cy.get('[data-testid="hero-section"]').should('be.visible');
    });

    it('displays the navigation bar', () => {
      cy.get('[data-testid="navigation-bar"]').should('be.visible');
      cy.get('[data-testid="nav-logo"]').should('be.visible');
    });

    it('shows all main navigation links', () => {
      cy.get('[data-testid="nav-docs"]').should('be.visible');
      cy.get('[data-testid="nav-engine"]').should('be.visible');
      cy.get('[data-testid="nav-downloads"]').should('be.visible');
      cy.get('[data-testid="nav-faq"]').should('be.visible');
    });
  });

  describe('Hero Section', () => {
    it('displays the main heading and description', () => {
      cy.get('[data-testid="hero-title"]').should('be.visible');
      cy.get('[data-testid="hero-description"]').should('be.visible');
    });

    it('shows call-to-action buttons', () => {
      cy.get('[data-testid="cta-primary"]').should('be.visible');
      cy.get('[data-testid="cta-secondary"]').should('be.visible');
    });

    it('navigates to documentation when primary CTA is clicked', () => {
      cy.get('[data-testid="cta-primary"]').click();
      cy.url().should('include', '/docs');
    });
  });

  describe('Features Section', () => {
    it('displays feature cards', () => {
      cy.get('[data-testid="features-section"]').should('be.visible');
      cy.get('[data-testid="feature-card"]').should('have.length.greaterThan', 0);
    });

    it('shows feature icons and descriptions', () => {
      cy.get('[data-testid="feature-card"]').first().within(() => {
        cy.get('[data-testid="feature-icon"]').should('be.visible');
        cy.get('[data-testid="feature-title"]').should('be.visible');
        cy.get('[data-testid="feature-description"]').should('be.visible');
      });
    });
  });

  describe('Search Functionality', () => {
    it('displays search bar', () => {
      cy.get('[data-testid="search-input"]').should('be.visible');
    });

    it('performs search and shows results', () => {
      cy.searchFor('documentation');
      cy.get('[data-testid="search-results"]').should('be.visible');
    });

    it('shows no results message for invalid search', () => {
      cy.searchFor('nonexistentterm12345');
      cy.get('[data-testid="no-results"]').should('be.visible');
    });

    it('clears search results when input is cleared', () => {
      cy.searchFor('test');
      cy.clearSearch();
      cy.get('[data-testid="search-results"]').should('not.exist');
    });
  });

  describe('Theme Functionality', () => {
    it('toggles between light and dark themes', () => {
      cy.get('body').should('have.class', 'dark-theme');
      cy.toggleTheme();
      cy.get('body').should('have.class', 'light-theme');
    });

    it('toggles high contrast mode', () => {
      cy.toggleHighContrast();
      cy.get('body').should('have.class', 'high-contrast');
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens keyboard shortcuts modal with ? key', () => {
      cy.pressKeyboardShortcut('?');
      cy.get('[data-testid="keyboard-shortcuts-modal"]').should('be.visible');
    });

    it('focuses search with / key', () => {
      cy.pressKeyboardShortcut('/');
      cy.get('[data-testid="search-input"]').should('have.focus');
    });
  });

  describe('Responsive Design', () => {
    it('displays correctly on mobile devices', () => {
      cy.setMobileViewport();
      cy.get('[data-testid="navigation-bar"]').should('be.visible');
      cy.get('[data-testid="hero-section"]').should('be.visible');
    });

    it('displays correctly on tablet devices', () => {
      cy.setTabletViewport();
      cy.get('[data-testid="navigation-bar"]').should('be.visible');
      cy.get('[data-testid="hero-section"]').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('loads within acceptable time limits', () => {
      cy.measurePageLoad();
    });

    it('has no accessibility violations', () => {
      cy.checkA11y();
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', () => {
      cy.intercept('GET', '/api/**', { forceNetworkError: true });
      cy.reload();
      cy.handleError();
    });
  });
});