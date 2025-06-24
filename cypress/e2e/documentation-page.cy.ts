describe('Documentation Page', () => {
  beforeEach(() => {
    cy.visitDocsPage();
  });

  describe('Page Loading and Structure', () => {
    it('loads the documentation page successfully', () => {
      cy.get('h1').should('contain', 'Documentation');
      cy.get('[data-testid="docs-content"]').should('be.visible');
      cy.url().should('include', '/docs');
    });

    it('displays the navigation sidebar', () => {
      cy.get('[data-testid="docs-sidebar"]').should('be.visible');
      cy.get('[data-testid="docs-nav"]').should('be.visible');
    });

    it('shows the main content area', () => {
      cy.get('[data-testid="docs-main-content"]').should('be.visible');
      cy.get('[data-testid="docs-article"]').should('be.visible');
    });

    it('displays breadcrumb navigation', () => {
      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('[data-testid="breadcrumb-home"]').should('contain', 'Home');
      cy.get('[data-testid="breadcrumb-docs"]').should('contain', 'Documentation');
    });

    it('renders table of contents for long articles', () => {
      cy.get('[data-testid="table-of-contents"]').should('be.visible');
      cy.get('[data-testid="toc-item"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Navigation and Menu', () => {
    it('expands and collapses navigation sections', () => {
      cy.get('[data-testid="nav-section-getting-started"]').within(() => {
        cy.get('[data-testid="section-toggle"]').click();
        cy.get('[data-testid="section-items"]').should('be.visible');
        
        cy.get('[data-testid="section-toggle"]').click();
        cy.get('[data-testid="section-items"]').should('not.be.visible');
      });
    });

    it('navigates between documentation sections', () => {
      cy.get('[data-testid="nav-getting-started"]').click();
      cy.url().should('include', '/docs/getting-started');
      cy.get('h1').should('contain', 'Getting Started');

      cy.get('[data-testid="nav-api-reference"]').click();
      cy.url().should('include', '/docs/api');
      cy.get('h1').should('contain', 'API Reference');
    });

    it('highlights current page in navigation', () => {
      cy.get('[data-testid="nav-getting-started"]').click();
      cy.get('[data-testid="nav-getting-started"]').should('have.class', 'active');
      cy.get('[data-testid="nav-getting-started"]').should('have.attr', 'aria-current', 'page');
    });

    it('shows correct page hierarchy in navigation', () => {
      cy.get('[data-testid="nav-tutorials"]').click();
      cy.get('[data-testid="nav-basic-tutorial"]').click();
      
      cy.get('[data-testid="nav-tutorials"]').should('have.class', 'expanded');
      cy.get('[data-testid="nav-basic-tutorial"]').should('have.class', 'active');
    });

    it('provides navigation keyboard shortcuts', () => {
      cy.pressKeyboardShortcut('n');
      cy.get('[data-testid="next-page-link"]').should('have.focus');
      
      cy.pressKeyboardShortcut('p');
      cy.get('[data-testid="prev-page-link"]').should('have.focus');
    });
  });

  describe('Content Display and Functionality', () => {
    it('renders markdown content correctly', () => {
      cy.get('[data-testid="docs-article"]').within(() => {
        cy.get('h1, h2, h3, h4, h5, h6').should('have.length.greaterThan', 0);
        cy.get('p').should('have.length.greaterThan', 0);
        cy.get('code').should('exist');
      });
    });

    it('displays code blocks with syntax highlighting', () => {
      cy.get('[data-testid="code-block"]').should('be.visible');
      cy.get('[data-testid="code-block"]').should('have.class', 'hljs');
      cy.get('[data-testid="code-block"] .hljs-keyword').should('exist');
    });

    it('provides copy functionality for code blocks', () => {
      cy.get('[data-testid="code-block"]').first().within(() => {
        cy.get('[data-testid="copy-button"]').should('be.visible');
        cy.get('[data-testid="copy-button"]').click();
        cy.get('[data-testid="copy-success"]').should('be.visible');
      });
    });

    it('shows code block language labels', () => {
      cy.get('[data-testid="code-block"]').first().within(() => {
        cy.get('[data-testid="language-label"]').should('be.visible');
        cy.get('[data-testid="language-label"]').should('contain.text');
      });
    });

    it('renders images with proper alt text', () => {
      cy.get('[data-testid="docs-article"] img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
        cy.wrap($img).should('have.attr', 'src');
      });
    });

    it('displays callout boxes and alerts', () => {
      cy.get('[data-testid="callout-info"]').should('be.visible');
      cy.get('[data-testid="callout-warning"]').should('be.visible');
      cy.get('[data-testid="callout-tip"]').should('be.visible');
    });
  });

  describe('Search Functionality', () => {
    it('searches within documentation content', () => {
      cy.searchFor('getting started');
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="search-result-item"]').should('contain', 'Getting Started');
    });

    it('filters search results by documentation type', () => {
      cy.searchFor('api');
      cy.get('[data-testid="search-filters"]').within(() => {
        cy.get('[data-testid="filter-documentation"]').click();
      });
      
      cy.get('[data-testid="search-result-item"]').each(($item) => {
        cy.wrap($item).should('contain', 'Documentation');
      });
    });

    it('highlights search terms in results', () => {
      cy.searchFor('voxel');
      cy.get('[data-testid="search-result-item"]').first().within(() => {
        cy.get('[data-testid="search-highlight"]').should('be.visible');
        cy.get('[data-testid="search-highlight"]').should('contain', 'voxel');
      });
    });

    it('provides search suggestions', () => {
      cy.get('[data-testid="search-input"]').type('get');
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
      cy.get('[data-testid="suggestion-item"]').should('contain', 'Getting Started');
    });

    it('navigates to search results', () => {
      cy.searchFor('installation');
      cy.get('[data-testid="search-result-item"]').first().click();
      cy.url().should('include', '/docs/installation');
    });
  });

  describe('Interactive Features', () => {
    it('shows edit on GitHub links', () => {
      cy.get('[data-testid="edit-on-github"]').should('be.visible');
      cy.get('[data-testid="edit-on-github"]').should('have.attr', 'href').and('include', 'github.com');
    });

    it('displays last updated information', () => {
      cy.get('[data-testid="last-updated"]').should('be.visible');
      cy.get('[data-testid="last-updated"]').should('contain', 'Last updated');
    });

    it('shows reading time estimation', () => {
      cy.get('[data-testid="reading-time"]').should('be.visible');
      cy.get('[data-testid="reading-time"]').should('contain', 'min read');
    });

    it('provides print-friendly formatting', () => {
      cy.window().then((win) => {
        cy.stub(win, 'print').as('windowPrint');
      });
      
      cy.get('[data-testid="print-page"]').click();
      cy.get('@windowPrint').should('have.been.called');
    });

    it('allows bookmarking of sections', () => {
      cy.get('[data-testid="section-heading"]').first().within(() => {
        cy.get('[data-testid="anchor-link"]').should('be.visible');
        cy.get('[data-testid="anchor-link"]').click();
      });
      
      cy.url().should('include', '#');
    });
  });

  describe('Related Content and Navigation', () => {
    it('shows related articles', () => {
      cy.get('[data-testid="related-articles"]').should('be.visible');
      cy.get('[data-testid="related-article"]').should('have.length.greaterThan', 0);
    });

    it('displays next and previous page navigation', () => {
      cy.get('[data-testid="page-navigation"]').should('be.visible');
      cy.get('[data-testid="next-page"]').should('be.visible');
      cy.get('[data-testid="prev-page"]').should('be.visible');
    });

    it('navigates to next page', () => {
      cy.get('[data-testid="next-page"]').click();
      cy.url().should('not.include', '/docs$');
      cy.get('[data-testid="prev-page"]').should('be.visible');
    });

    it('navigates to previous page', () => {
      cy.get('[data-testid="nav-api-reference"]').click();
      cy.get('[data-testid="prev-page"]').click();
      cy.url().should('not.include', '/docs/api');
    });

    it('shows page tags and categories', () => {
      cy.get('[data-testid="page-tags"]').should('be.visible');
      cy.get('[data-testid="page-tag"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Responsive Design', () => {
    it('adapts navigation for mobile devices', () => {
      cy.setMobileViewport();
      
      cy.get('[data-testid="mobile-nav-toggle"]').should('be.visible');
      cy.get('[data-testid="docs-sidebar"]').should('not.be.visible');
      
      cy.get('[data-testid="mobile-nav-toggle"]').click();
      cy.get('[data-testid="docs-sidebar"]').should('be.visible');
    });

    it('collapses sidebar on tablet devices', () => {
      cy.setTabletViewport();
      
      cy.get('[data-testid="sidebar-toggle"]').should('be.visible');
      cy.get('[data-testid="docs-sidebar"]').should('be.visible');
      
      cy.get('[data-testid="sidebar-toggle"]').click();
      cy.get('[data-testid="docs-sidebar"]').should('not.be.visible');
    });

    it('maintains readability on different screen sizes', () => {
      cy.setMobileViewport();
      cy.get('[data-testid="docs-article"]').should('be.visible');
      cy.get('[data-testid="docs-article"]').should('have.css', 'font-size').and('match', /\d+px/);
      
      cy.setDesktopViewport();
      cy.get('[data-testid="docs-article"]').should('be.visible');
    });

    it('handles code block overflow on mobile', () => {
      cy.setMobileViewport();
      cy.get('[data-testid="code-block"]').should('have.css', 'overflow-x', 'auto');
    });
  });

  describe('Theme Integration', () => {
    it('applies theme to documentation content', () => {
      cy.get('body').should('have.class', 'dark-theme');
      
      cy.get('[data-testid="docs-article"]').should('have.css', 'background-color');
      cy.get('[data-testid="code-block"]').should('have.css', 'background-color');
      
      cy.toggleTheme();
      
      cy.get('body').should('have.class', 'light-theme');
      cy.get('[data-testid="docs-article"]').should('have.css', 'background-color');
    });

    it('switches code block syntax highlighting themes', () => {
      cy.get('[data-testid="code-block"]').should('have.class', 'hljs-dark');
      
      cy.toggleTheme();
      
      cy.get('[data-testid="code-block"]').should('have.class', 'hljs-light');
    });

    it('maintains high contrast in accessibility mode', () => {
      cy.toggleHighContrast();
      
      cy.get('[data-testid="docs-article"]').within(() => {
        cy.get('h1, h2, h3, h4, h5, h6').should('have.css', 'border-bottom');
        cy.get('a').should('have.css', 'text-decoration', 'underline solid');
      });
    });
  });

  describe('Performance and Loading', () => {
    it('loads page content efficiently', () => {
      cy.measurePageLoad();
      
      cy.get('[data-testid="docs-article"]').should('be.visible');
      cy.get('[data-testid="loading-indicator"]').should('not.exist');
    });

    it('implements lazy loading for images', () => {
      cy.get('[data-testid="docs-article"] img').should('have.attr', 'loading', 'lazy');
    });

    it('preloads critical resources', () => {
      cy.document().then((doc) => {
        const preloadLinks = doc.querySelectorAll('link[rel="preload"]');
        expect(preloadLinks.length).to.be.greaterThan(0);
      });
    });

    it('caches navigation data', () => {
      cy.get('[data-testid="nav-getting-started"]').click();
      cy.get('[data-testid="nav-api-reference"]').click();
      
      // Navigation should be instant after initial load
      const startTime = Date.now();
      cy.get('[data-testid="nav-getting-started"]').click();
      cy.get('[data-testid="docs-article"]').should('be.visible').then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(100);
      });
    });
  });

  describe('Accessibility Features', () => {
    it('provides proper heading hierarchy', () => {
      cy.get('[data-testid="docs-article"]').within(() => {
        cy.get('h1').should('have.length', 1);
        cy.get('h2').should('exist');
        
        // Check heading order
        cy.get('h1, h2, h3, h4, h5, h6').then(($headings) => {
          const headingLevels = Array.from($headings).map(h => parseInt(h.tagName.charAt(1)));
          // Verify headings follow proper hierarchy
          expect(headingLevels[0]).to.equal(1);
        });
      });
    });

    it('includes skip navigation links', () => {
      cy.get('body').type('{tab}');
      cy.get('[data-testid="skip-to-content"]').should('have.focus');
      
      cy.get('[data-testid="skip-to-content"]').click();
      cy.get('[data-testid="docs-article"]').should('have.focus');
    });

    it('provides alt text for all images', () => {
      cy.get('[data-testid="docs-article"] img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt');
        cy.wrap($img).invoke('attr', 'alt').should('not.be.empty');
      });
    });

    it('maintains focus management in navigation', () => {
      cy.get('[data-testid="nav-getting-started"]').focus().click();
      cy.get('[data-testid="docs-article"]').should('have.attr', 'tabindex', '-1');
    });

    it('supports screen reader navigation', () => {
      cy.checkA11y('[data-testid="docs-content"]');
      
      cy.get('[data-testid="docs-article"]').should('have.attr', 'role', 'main');
      cy.get('[data-testid="docs-nav"]').should('have.attr', 'role', 'navigation');
    });
  });

  describe('Error Handling', () => {
    it('handles missing documentation gracefully', () => {
      cy.visit('/docs/nonexistent-page');
      
      cy.get('[data-testid="not-found"]').should('be.visible');
      cy.get('[data-testid="suggested-pages"]').should('be.visible');
      cy.get('[data-testid="search-suggestion"]').should('be.visible');
    });

    it('provides helpful error messages', () => {
      cy.intercept('GET', '/api/docs/**', { statusCode: 500 });
      cy.visitDocsPage();
      
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="retry-button"]').should('be.visible');
    });

    it('recovers from network errors', () => {
      cy.intercept('GET', '/api/docs/**', { forceNetworkError: true }).as('networkError');
      cy.visitDocsPage();
      
      cy.get('[data-testid="network-error"]').should('be.visible');
      
      // Restore network
      cy.intercept('GET', '/api/docs/**', { fixture: 'docs-response.json' });
      cy.get('[data-testid="retry-button"]').click();
      
      cy.get('[data-testid="docs-article"]').should('be.visible');
    });

    it('handles slow loading gracefully', () => {
      cy.intercept('GET', '/api/docs/**', { delay: 3000, fixture: 'docs-response.json' });
      cy.visitDocsPage();
      
      cy.get('[data-testid="loading-indicator"]').should('be.visible');
      cy.get('[data-testid="loading-message"]').should('contain', 'Loading documentation');
      
      cy.get('[data-testid="docs-article"]', { timeout: 5000 }).should('be.visible');
      cy.get('[data-testid="loading-indicator"]').should('not.exist');
    });
  });

  describe('SEO and Meta Information', () => {
    it('includes proper meta tags', () => {
      cy.get('head meta[name="description"]').should('exist');
      cy.get('head meta[property="og:title"]').should('exist');
      cy.get('head meta[property="og:description"]').should('exist');
      cy.get('head meta[name="twitter:card"]').should('exist');
    });

    it('updates page title dynamically', () => {
      cy.get('[data-testid="nav-getting-started"]').click();
      cy.title().should('contain', 'Getting Started');
      
      cy.get('[data-testid="nav-api-reference"]').click();
      cy.title().should('contain', 'API Reference');
    });

    it('includes structured data for search engines', () => {
      cy.get('script[type="application/ld+json"]').should('exist');
    });
  });
});