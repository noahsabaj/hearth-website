import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import App from '../../App';
import { KeyboardShortcutsProvider } from '../../contexts/KeyboardShortcutsContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { render, setupTest, teardownTest, mockLocalStorage } from '../../test-utils';

expect.extend(toHaveNoViolations);

// Mock the theme context
const mockThemeContext = {
  theme: 'dark',
  toggleTheme: jest.fn(),
  setTheme: jest.fn(),
  isHighContrast: false,
  toggleHighContrast: jest.fn(),
  preferences: {
    reduceMotion: false,
    fontSize: 'medium',
    colorScheme: 'auto',
  },
  updatePreferences: jest.fn(),
};

jest.mock('../../contexts/ThemeContext', () => ({
  ...jest.requireActual('../../contexts/ThemeContext'),
  useTheme: () => mockThemeContext,
}));

// Mock localStorage for theme persistence
const mockSetItem = jest.fn();
const mockGetItem = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      ...mockLocalStorage,
      setItem: mockSetItem,
      getItem: mockGetItem,
    },
    writable: true,
  });
});

describe('Theme Switching Integration Tests', () => {
  beforeEach(() => {
    setupTest();
    mockThemeContext.toggleTheme.mockClear();
    mockThemeContext.setTheme.mockClear();
    mockThemeContext.toggleHighContrast.mockClear();
    mockThemeContext.updatePreferences.mockClear();
    mockSetItem.mockClear();
    mockGetItem.mockClear();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Theme Context Integration', () => {
    it('should integrate theme context with all app components', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Verify initial dark theme is applied
      expect(document.body).toHaveClass('dark-theme');

      // Toggle theme
      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });
      await user.click(themeToggle);

      expect(mockThemeContext.toggleTheme).toHaveBeenCalled();

      // Verify theme change affects all components
      const navigation = screen.getByRole('navigation');
      const main = screen.getByRole('main');
      const footer = screen.getByRole('contentinfo');

      expect(navigation).toHaveStyle('background-color: var(--bg-primary)');
      expect(main).toHaveStyle('background-color: var(--bg-primary)');
      expect(footer).toHaveStyle('background-color: var(--bg-secondary)');
    });

    it('should persist theme preferences in localStorage', async () => {
      const user = userEvent.setup();
      render(<App />);

      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });
      await user.click(themeToggle);

      // Should save theme preference
      expect(mockSetItem).toHaveBeenCalledWith('hearth-theme', expect.any(String));
    });

    it('should restore theme from localStorage on app initialization', () => {
      mockGetItem.mockReturnValue(JSON.stringify({ theme: 'light', isHighContrast: false }));

      render(<App />);

      // Should restore saved theme
      expect(mockGetItem).toHaveBeenCalledWith('hearth-theme');
    });

    it('should handle system theme preference detection', () => {
      // Mock system dark mode preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<App />);

      // Should respect system preference when no saved preference exists
      expect(document.body).toHaveClass('dark-theme');
    });
  });

  describe('Theme Switching User Experience', () => {
    it('should provide smooth transitions between themes', async () => {
      const user = userEvent.setup();
      render(<App />);

      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });

      // Check initial state
      expect(document.body).toHaveStyle('transition: background-color 0.3s ease');

      await user.click(themeToggle);

      // Should maintain transitions during theme change
      await waitFor(() => {
        expect(document.body).toHaveClass('theme-transitioning');
      });

      // Transition should complete
      await waitFor(
        () => {
          expect(document.body).not.toHaveClass('theme-transitioning');
        },
        { timeout: 500 },
      );
    });

    it('should update theme selector components across the app', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Find theme selectors in different locations
      const headerThemeToggle = screen.getByTestId('header-theme-toggle');
      const footerThemeToggle = screen.queryByTestId('footer-theme-toggle');

      await user.click(headerThemeToggle);

      // All theme toggles should reflect the same state
      expect(headerThemeToggle).toHaveAttribute('aria-pressed', 'false');
      if (footerThemeToggle) {
        expect(footerThemeToggle).toHaveAttribute('aria-pressed', 'false');
      }
    });

    it('should handle theme switching during navigation', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to different page
      const docsLink = screen.getByRole('link', { name: /documentation/i });
      await user.click(docsLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/docs');
      });

      // Toggle theme on new page
      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });
      await user.click(themeToggle);

      expect(mockThemeContext.toggleTheme).toHaveBeenCalled();

      // Navigate back and verify theme persists
      const homeLink = screen.getByRole('link', { name: /home/i });
      await user.click(homeLink);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/');
      });

      // Theme should persist across navigation
      expect(document.body).toHaveClass('light-theme');
    });

    it('should maintain theme state during page refresh', () => {
      mockGetItem.mockReturnValue(JSON.stringify({ theme: 'light', isHighContrast: true }));

      render(<App />);

      // Should restore both theme and accessibility preferences
      expect(document.body).toHaveClass('light-theme');
      expect(document.body).toHaveClass('high-contrast');
    });
  });

  describe('High Contrast Mode Integration', () => {
    it('should toggle high contrast mode independently of theme', async () => {
      const user = userEvent.setup();
      render(<App />);

      const highContrastToggle = screen.getByRole('button', { name: /high contrast/i });
      await user.click(highContrastToggle);

      expect(mockThemeContext.toggleHighContrast).toHaveBeenCalled();
      expect(document.body).toHaveClass('high-contrast');

      // Theme should remain unchanged
      expect(document.body).toHaveClass('dark-theme');
    });

    it('should apply high contrast styles to all interactive elements', async () => {
      const user = userEvent.setup();
      render(<App />);

      const highContrastToggle = screen.getByRole('button', { name: /high contrast/i });
      await user.click(highContrastToggle);

      // Check various interactive elements
      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');

      buttons.forEach(button => {
        expect(button).toHaveStyle('border: 2px solid');
      });

      links.forEach(link => {
        expect(link).toHaveStyle('text-decoration: underline');
      });
    });

    it('should work with both light and dark themes', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Enable high contrast in dark theme
      const highContrastToggle = screen.getByRole('button', { name: /high contrast/i });
      await user.click(highContrastToggle);

      expect(document.body).toHaveClass('dark-theme');
      expect(document.body).toHaveClass('high-contrast');

      // Switch to light theme while maintaining high contrast
      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });
      await user.click(themeToggle);

      expect(document.body).toHaveClass('light-theme');
      expect(document.body).toHaveClass('high-contrast');
    });

    it('should respect user motion preferences', async () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<App />);

      // Should disable animations when reduced motion is preferred
      expect(document.body).toHaveClass('reduce-motion');

      const styles = window.getComputedStyle(document.body);
      expect(styles.getPropertyValue('--animation-duration')).toBe('0s');
    });
  });

  describe('Theme Accessibility', () => {
    it('should maintain proper color contrast ratios', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Test both themes for accessibility
      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });

      // Test dark theme
      const { container: darkContainer } = render(<App />);
      let results = await axe(darkContainer);
      expect(results).toHaveNoViolations();

      // Switch to light theme
      await user.click(themeToggle);

      const { container: lightContainer } = render(<App />);
      results = await axe(lightContainer);
      expect(results).toHaveNoViolations();
    });

    it('should announce theme changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<App />);

      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });
      await user.click(themeToggle);

      // Should announce theme change
      await waitFor(() => {
        const liveRegion = screen.getByRole('status', { hidden: true });
        expect(liveRegion).toHaveTextContent(/theme changed to light/i);
      });
    });

    it('should provide proper ARIA labels for theme controls', () => {
      render(<App />);

      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });
      const highContrastToggle = screen.getByRole('button', { name: /high contrast/i });

      expect(themeToggle).toHaveAttribute('aria-label');
      expect(themeToggle).toHaveAttribute('aria-pressed');
      expect(highContrastToggle).toHaveAttribute('aria-label');
      expect(highContrastToggle).toHaveAttribute('aria-pressed');
    });

    it('should support keyboard navigation for theme controls', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Tab to theme toggle
      await user.tab();
      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });

      if (themeToggle === document.activeElement) {
        // Activate with Enter
        await user.keyboard('{Enter}');
        expect(mockThemeContext.toggleTheme).toHaveBeenCalled();

        // Activate with Space
        await user.keyboard(' ');
        expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe('Theme Performance', () => {
    it('should not cause layout thrashing during theme changes', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Mock performance measurement
      const measureSpy = jest.fn();
      Object.defineProperty(window.performance, 'measure', { value: measureSpy });

      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });
      await user.click(themeToggle);

      // Theme change should not trigger excessive layout calculations
      expect(measureSpy).not.toHaveBeenCalledWith(expect.stringContaining('layout'));
    });

    it('should minimize repaints during theme transitions', async () => {
      const user = userEvent.setup();
      render(<App />);

      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });

      // Measure initial paint time
      const startTime = performance.now();
      await user.click(themeToggle);

      await waitFor(() => {
        expect(document.body).not.toHaveClass('theme-transitioning');
      });

      const endTime = performance.now();
      const transitionTime = endTime - startTime;

      // Theme transition should be reasonably fast
      expect(transitionTime).toBeLessThan(500); // 500ms max
    });

    it('should handle rapid theme changes gracefully', async () => {
      const user = userEvent.setup();
      render(<App />);

      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });

      // Rapidly toggle theme multiple times
      for (let i = 0; i < 5; i++) {
        await user.click(themeToggle);
      }

      // Should handle rapid changes without errors
      expect(mockThemeContext.toggleTheme).toHaveBeenCalledTimes(5);
    });
  });

  describe('Theme Customization', () => {
    it('should support font size preferences', async () => {
      const user = userEvent.setup();
      render(<App />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      // Should show font size options
      const fontSizeSelect = screen.getByLabelText(/font size/i);
      await user.selectOptions(fontSizeSelect, 'large');

      expect(mockThemeContext.updatePreferences).toHaveBeenCalledWith({
        fontSize: 'large',
      });

      // Font size should be applied to root element
      expect(document.documentElement).toHaveStyle('font-size: 1.2rem');
    });

    it('should allow custom color scheme selection', async () => {
      const user = userEvent.setup();
      render(<App />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      const colorSchemeSelect = screen.getByLabelText(/color scheme/i);
      await user.selectOptions(colorSchemeSelect, 'auto');

      expect(mockThemeContext.updatePreferences).toHaveBeenCalledWith({
        colorScheme: 'auto',
      });
    });

    it('should preserve custom preferences across sessions', async () => {
      const customPreferences = {
        reduceMotion: true,
        fontSize: 'large',
        colorScheme: 'light',
      };

      mockGetItem.mockReturnValue(
        JSON.stringify({
          theme: 'dark',
          isHighContrast: false,
          preferences: customPreferences,
        }),
      );

      render(<App />);

      // Should restore custom preferences
      expect(document.documentElement).toHaveClass('reduce-motion');
      expect(document.documentElement).toHaveStyle('font-size: 1.2rem');
    });
  });

  describe('Theme System Integration', () => {
    it('should work with CSS custom properties', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Check CSS custom properties are set correctly
      const styles = window.getComputedStyle(document.body);
      expect(styles.getPropertyValue('--color-primary')).toBeTruthy();
      expect(styles.getPropertyValue('--color-background')).toBeTruthy();

      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });
      await user.click(themeToggle);

      // CSS properties should update
      const newStyles = window.getComputedStyle(document.body);
      expect(newStyles.getPropertyValue('--color-background')).not.toBe(
        styles.getPropertyValue('--color-background')
      );
    });

    it('should integrate with Material-UI theme provider', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Material-UI components should use theme colors
      const button = screen.getByRole('button', { name: /toggle.*theme/i });
      const computedStyle = window.getComputedStyle(button);

      expect(computedStyle.backgroundColor).toBeTruthy();
      expect(computedStyle.color).toBeTruthy();

      await user.click(button);

      // Colors should change with theme
      const newComputedStyle = window.getComputedStyle(button);
      expect(newComputedStyle.backgroundColor).not.toBe(computedStyle.backgroundColor);
    });

    it('should handle theme loading states gracefully', () => {
      // Mock slow theme loading
      mockGetItem.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve(JSON.stringify({ theme: 'light' })), 100);
        });
      });

      render(<App />);

      // Should show loading state or default theme
      expect(document.body).toHaveClass('theme-loading');
    });

    it('should work correctly with server-side rendering', () => {
      // Mock SSR environment
      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true,
      });

      render(<App />);

      // Should not crash without localStorage
      expect(document.body).toHaveClass('dark-theme'); // Default theme
    });
  });

  describe('Theme Error Handling', () => {
    it('should handle localStorage errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock localStorage error
      mockSetItem.mockImplementation(() => {
        throw new Error('localStorage quota exceeded');
      });

      render(<App />);

      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });

      // Should not crash on storage error
      await user.click(themeToggle);
      expect(mockThemeContext.toggleTheme).toHaveBeenCalled();
    });

    it('should recover from invalid stored theme data', () => {
      mockGetItem.mockReturnValue('invalid json data');

      render(<App />);

      // Should fall back to default theme
      expect(document.body).toHaveClass('dark-theme');
    });

    it('should handle missing CSS custom properties gracefully', async () => {
      const user = userEvent.setup();

      // Remove CSS custom properties
      document.documentElement.style.removeProperty('--color-primary');

      render(<App />);

      const themeToggle = screen.getByRole('button', { name: /toggle.*theme/i });

      // Should not crash with missing CSS properties
      await user.click(themeToggle);
      expect(mockThemeContext.toggleTheme).toHaveBeenCalled();
    });
  });
});
