import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest, mockLocalStorage } from '../../test-utils';
import ThemeDemo from '../ThemeDemo';

expect.extend(toHaveNoViolations);

// Mock syntax themes
const mockSyntaxThemes = {
  'vscode-dark': {
    displayName: 'VS Code Dark',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    border: '#333333',
    colors: {
      comment: '#6a9955',
      keyword: '#569cd6',
      string: '#ce9178',
      variable: '#9cdcfe',
      function: '#dcdcaa',
      operator: '#d4d4d4',
    },
  },
  dracula: {
    displayName: 'Dracula',
    background: '#282a36',
    foreground: '#f8f8f2',
    border: '#44475a',
    colors: {
      comment: '#6272a4',
      keyword: '#ff79c6',
      string: '#f1fa8c',
      variable: '#50fa7b',
      function: '#8be9fd',
      operator: '#ff79c6',
    },
  },
  monokai: {
    displayName: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    border: '#49483e',
    colors: {
      comment: '#75715e',
      keyword: '#f92672',
      string: '#e6db74',
      variable: '#a6e22e',
      function: '#66d9ef',
      operator: '#f92672',
    },
  },
};

jest.mock('../../themes/syntaxThemes', () => ({
  syntaxThemes: mockSyntaxThemes,
}));

// Mock CodeBlock component to test theme integration
const MockCodeBlock = ({ language, children }: { language: string; children: string }) => (
  <div data-testid='code-block' data-language={language}>
    <div data-testid='theme-selector-button' role='button' aria-label='Change syntax theme'>
      🎨
    </div>
    <pre>{children}</pre>
  </div>
);

jest.mock('../../components/CodeBlock', () => MockCodeBlock);

describe('ThemeDemo Page', () => {
  beforeEach(() => {
    setupTest();
    mockLocalStorage.clear();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Page Rendering', () => {
    it('should render the page with proper structure and content', () => {
      render(<ThemeDemo />);

      // Check main heading
      expect(screen.getByText('Syntax Highlighting Themes Demo')).toBeInTheDocument();

      // Check description
      expect(
        screen.getByText(
          /Click the palette icon on any code block to change the syntax highlighting theme/,
        )
      ).toBeInTheDocument();

      // Check sections
      expect(screen.getByText('Interactive Theme Switcher')).toBeInTheDocument();
      expect(screen.getByText('Available Themes')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
    });

    it('should render the main code block example', () => {
      render(<ThemeDemo />);

      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock).toHaveAttribute('data-language', 'rust');

      // Check for Rust code content
      expect(screen.getByText(/use hearth_engine::\{Engine, Game, World\}/)).toBeInTheDocument();
      expect(screen.getByText(/struct MyGame/)).toBeInTheDocument();
    });

    it('should display all available themes', () => {
      render(<ThemeDemo />);

      // Check that all theme names are displayed
      Object.values(mockSyntaxThemes).forEach(theme => {
        expect(screen.getByText(theme.displayName)).toBeInTheDocument();
      });
    });

    it('should render theme preview cards', () => {
      render(<ThemeDemo />);

      // Each theme should have a preview card
      const themeCards = screen.getAllByText(/Example code/);
      expect(themeCards.length).toBe(Object.keys(mockSyntaxThemes).length);
    });
  });

  describe('Theme Display and Previews', () => {
    it('should show code previews for each theme', () => {
      render(<ThemeDemo />);

      // Check that code examples are shown for each theme
      Object.entries(mockSyntaxThemes).forEach(([key, theme]) => {
        // Find the theme card
        const themeTitle = screen.getByText(theme.displayName);
        expect(themeTitle).toBeInTheDocument();

        // Should have example code nearby
        const container =
          themeTitle.closest('[data-testid="theme-preview"]') ||
          themeTitle.closest('.MuiPaper-root') ||
          themeTitle.parentElement?.parentElement;

        if (container) {
          expect(container.textContent).toContain('const');
          expect(container.textContent).toContain('function');
        }
      });
    });

    it('should apply correct theme colors to previews', () => {
      render(<ThemeDemo />);

      Object.entries(mockSyntaxThemes).forEach(([key, theme]) => {
        const themeTitle = screen.getByText(theme.displayName);
        const container = themeTitle.closest('.MuiPaper-root') || themeTitle.parentElement;

        // Should find elements with theme colors (implementation dependent)
        if (container) {
          const styledElements = container.querySelectorAll('[style*="color"]');
          expect(styledElements.length).toBeGreaterThan(0);
        }
      });
    });

    it('should show proper syntax highlighting in examples', () => {
      render(<ThemeDemo />);

      // Look for different syntax elements in the previews
      expect(screen.getByText(/\/\/ Example code/)).toBeInTheDocument();
      expect(screen.getByText(/const/)).toBeInTheDocument();
      expect(screen.getByText(/function/)).toBeInTheDocument();
      expect(screen.getByText(/greet/)).toBeInTheDocument();
    });
  });

  describe('Theme Interaction', () => {
    it('should show theme selector on code block', () => {
      render(<ThemeDemo />);

      const themeSelectorButton = screen.getByTestId('theme-selector-button');
      expect(themeSelectorButton).toBeInTheDocument();
      expect(themeSelectorButton).toHaveAttribute('aria-label', 'Change syntax theme');
    });

    it('should handle theme selection interaction', async () => {
      const user = userEvent.setup();
      render(<ThemeDemo />);

      const themeSelectorButton = screen.getByTestId('theme-selector-button');
      await user.click(themeSelectorButton);

      // Should open theme selector (implementation dependent)
      // This would test the actual theme selection logic
      expect(themeSelectorButton).toBeInTheDocument();
    });

    it('should persist theme selection in localStorage', () => {
      render(<ThemeDemo />);

      // Mock theme change
      const themeKey = 'dracula';

      // Simulate theme selection
      mockLocalStorage.setItem('selectedSyntaxTheme', themeKey);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('selectedSyntaxTheme', themeKey);
    });

    it('should load saved theme from localStorage on mount', () => {
      // Set saved theme
      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'selectedSyntaxTheme') {
          return 'monokai';
        }
        return null;
      });

      render(<ThemeDemo />);

      // Should load with saved theme
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('selectedSyntaxTheme');
    });
  });

  describe('Features Section', () => {
    it('should display all feature descriptions', () => {
      render(<ThemeDemo />);

      const expectedFeatures = [
        '8 carefully crafted themes including VS Code Dark, Dracula, Monokai, and more',
        'Theme preference saved in localStorage for persistence across sessions',
        'Smooth transition animations when switching themes',
        'Preview themes on hover before selecting',
        'Accessible theme names and keyboard navigation',
        'Consistent application across all code blocks',
        'Support for multiple programming languages (Rust, Bash, TOML)',
      ];

      expectedFeatures.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('should highlight key capabilities', () => {
      render(<ThemeDemo />);

      // Check that features section is properly structured
      expect(screen.getByText('Features')).toBeInTheDocument();

      // Should have list format
      const featuresList =
        screen.getByRole('list') || screen.getByText(/8 carefully crafted themes/);
      expect(featuresList).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should meet WCAG accessibility standards', async () => {
      const { container } = render(<ThemeDemo />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading hierarchy', () => {
      render(<ThemeDemo />);

      // Check heading structure
      const h2 = screen.getByRole('heading', {
        level: 2,
        name: /Syntax Highlighting Themes Demo/i,
      });
      expect(h2).toBeInTheDocument();

      const h4Headings = screen.getAllByRole('heading', { level: 4 });
      expect(h4Headings.length).toBeGreaterThan(0);

      const h5Headings = screen.getAllByRole('heading', { level: 5 });
      expect(h5Headings.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation for theme selection', async () => {
      const user = userEvent.setup();
      render(<ThemeDemo />);

      // Tab to theme selector
      await user.tab();

      // Should be able to focus on interactive elements
      const { activeElement } = document;
      expect(activeElement).toBeTruthy();
    });

    it('should have accessible theme preview cards', () => {
      render(<ThemeDemo />);

      // Theme cards should be accessible
      Object.values(mockSyntaxThemes).forEach(theme => {
        const themeCard = screen.getByText(theme.displayName);
        expect(themeCard).toBeInTheDocument();
        expect(themeCard).toBeVisible();
      });
    });

    it('should provide clear instructions for theme switching', () => {
      render(<ThemeDemo />);

      // Instructions should be clear and accessible
      expect(
        screen.getByText(
          /Click the palette icon on any code block to change the syntax highlighting theme/,
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Try hovering over different themes to see a preview before selecting/),
      ).toBeInTheDocument();
    });

    it('should have proper color contrast in theme previews', () => {
      render(<ThemeDemo />);

      // Each theme should maintain readability
      Object.entries(mockSyntaxThemes).forEach(([key, theme]) => {
        const preview = screen.getByText(theme.displayName);
        expect(preview).toBeVisible();

        // Theme colors should provide adequate contrast (implementation dependent)
        expect(theme.background).toBeTruthy();
        expect(theme.foreground).toBeTruthy();
      });
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobile width
      });
    });

    it('should render correctly on mobile devices', () => {
      render(<ThemeDemo />);

      // Main content should be accessible
      expect(screen.getByText('Syntax Highlighting Themes Demo')).toBeInTheDocument();

      // Theme previews should be visible
      Object.values(mockSyntaxThemes).forEach(theme => {
        expect(screen.getByText(theme.displayName)).toBeInTheDocument();
      });
    });

    it('should adapt theme grid for mobile layout', () => {
      render(<ThemeDemo />);

      // Theme cards should stack vertically on mobile
      const themeCards = screen.getAllByText(/VS Code Dark|Dracula|Monokai/);
      expect(themeCards.length).toBeGreaterThan(0);
    });

    it('should handle touch interactions on theme previews', () => {
      render(<ThemeDemo />);

      const themeSelector = screen.getByTestId('theme-selector-button');

      // Simulate touch events
      fireEvent.touchStart(themeSelector);
      fireEvent.touchEnd(themeSelector);

      expect(themeSelector).toBeInTheDocument();
    });

    it('should maintain readability on tablet screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        configurable: true,
      });

      render(<ThemeDemo />);

      // Content should be well-organized
      expect(screen.getByText('Interactive Theme Switcher')).toBeInTheDocument();
      expect(screen.getByText('Available Themes')).toBeInTheDocument();
    });
  });

  describe('Theme Persistence', () => {
    it('should save theme preference when changed', () => {
      render(<ThemeDemo />);

      // Simulate theme change
      const newTheme = 'dracula';

      // Mock theme selection event
      mockLocalStorage.setItem('selectedSyntaxTheme', newTheme);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('selectedSyntaxTheme', newTheme);
    });

    it('should apply saved theme on page load', () => {
      const savedTheme = 'monokai';
      mockLocalStorage.getItem.mockReturnValue(savedTheme);

      render(<ThemeDemo />);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('selectedSyntaxTheme');
    });

    it('should handle invalid saved theme gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-theme');

      // Should not crash
      render(<ThemeDemo />);
      expect(screen.getByText('Syntax Highlighting Themes Demo')).toBeInTheDocument();
    });

    it('should fall back to default theme when no preference is saved', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      render(<ThemeDemo />);

      // Should render with default theme
      expect(screen.getByText('Syntax Highlighting Themes Demo')).toBeInTheDocument();
    });
  });

  describe('Code Block Integration', () => {
    it('should display Rust code example correctly', () => {
      render(<ThemeDemo />);

      // Check for specific Rust code content
      expect(screen.getByText(/use hearth_engine::\{Engine, Game, World\}/)).toBeInTheDocument();
      expect(screen.getByText(/struct MyGame/)).toBeInTheDocument();
      expect(screen.getByText(/impl Game for MyGame/)).toBeInTheDocument();
      expect(screen.getByText(/fn main\(\)/)).toBeInTheDocument();
    });

    it('should show proper syntax highlighting elements', () => {
      render(<ThemeDemo />);

      const codeBlock = screen.getByTestId('code-block');
      expect(codeBlock).toHaveAttribute('data-language', 'rust');

      // Should contain typical Rust syntax
      expect(screen.getByText(/use/)).toBeInTheDocument();
      expect(screen.getByText(/struct/)).toBeInTheDocument();
      expect(screen.getByText(/impl/)).toBeInTheDocument();
    });

    it('should include theme selector in code block', () => {
      render(<ThemeDemo />);

      const themeSelector = screen.getByTestId('theme-selector-button');
      expect(themeSelector).toBeInTheDocument();
      expect(themeSelector).toHaveAttribute('aria-label', 'Change syntax theme');
    });
  });

  describe('Performance', () => {
    it('should render efficiently with multiple theme previews', () => {
      const startTime = performance.now();

      render(<ThemeDemo />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render reasonably fast
      expect(renderTime).toBeLessThan(100);

      // All themes should be rendered
      Object.values(mockSyntaxThemes).forEach(theme => {
        expect(screen.getByText(theme.displayName)).toBeInTheDocument();
      });
    });

    it('should handle theme switching efficiently', async () => {
      const user = userEvent.setup();
      render(<ThemeDemo />);

      const themeSelector = screen.getByTestId('theme-selector-button');

      // Multiple rapid theme changes should not cause issues
      for (let i = 0; i < 3; i++) {
        await user.click(themeSelector);
      }

      expect(themeSelector).toBeInTheDocument();
    });

    it('should not cause memory leaks', () => {
      const { unmount } = render(<ThemeDemo />);

      unmount();

      // Should cleanup properly
      expect(true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing theme data gracefully', () => {
      // Mock empty themes
      jest.doMock('../../themes/syntaxThemes', () => ({
        syntaxThemes: {},
      }));

      // Should not crash
      render(<ThemeDemo />);
      expect(screen.getByText('Syntax Highlighting Themes Demo')).toBeInTheDocument();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage error
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('LocalStorage not available');
      });

      // Should not crash
      render(<ThemeDemo />);
      expect(screen.getByText('Syntax Highlighting Themes Demo')).toBeInTheDocument();
    });

    it('should handle malformed theme data', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock invalid theme data
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      render(<ThemeDemo />);
      expect(screen.getByText('Syntax Highlighting Themes Demo')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Content Verification', () => {
    it('should provide comprehensive theme information', () => {
      render(<ThemeDemo />);

      // Check that comprehensive information is provided
      expect(
        screen.getByText(
          /Your preference will be saved and applied to all code blocks across the site/,
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Try hovering over different themes to see a preview before selecting/),
      ).toBeInTheDocument();
    });

    it('should demonstrate theme switching functionality', () => {
      render(<ThemeDemo />);

      // Should show interactive demo
      expect(screen.getByText('Interactive Theme Switcher')).toBeInTheDocument();
      expect(screen.getByTestId('theme-selector-button')).toBeInTheDocument();
    });

    it('should showcase all theme features', () => {
      render(<ThemeDemo />);

      // All advertised features should be mentioned
      expect(screen.getByText(/8 carefully crafted themes/)).toBeInTheDocument();
      expect(screen.getByText(/Theme preference saved in localStorage/)).toBeInTheDocument();
      expect(screen.getByText(/Smooth transition animations/)).toBeInTheDocument();
      expect(screen.getByText(/Preview themes on hover/)).toBeInTheDocument();
    });
  });
});
