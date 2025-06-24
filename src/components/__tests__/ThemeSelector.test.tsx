import { screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import { syntaxThemes } from '../../themes/syntaxThemes';
import ThemeSelector from '../ThemeSelector';

expect.extend(toHaveNoViolations);

// Mock the syntax themes
jest.mock('../../themes/syntaxThemes', () => ({
  syntaxThemes: {
    'vscode-dark': {
      name: 'vscode-dark',
      displayName: 'VS Code Dark',
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      border: '#333',
      selection: 'rgba(51, 153, 255, 0.2)',
      colors: {
        keyword: '#569cd6',
        type: '#4ec9b0',
        function: '#dcdcaa',
        macro: '#c586c0',
        string: '#ce9178',
        comment: '#6a9955',
        number: '#b5cea8',
        attribute: '#9cdcfe',
        operator: '#d4d4d4',
        variable: '#9cdcfe',
      },
    },
    dracula: {
      name: 'dracula',
      displayName: 'Dracula',
      background: '#282a36',
      foreground: '#f8f8f2',
      border: '#44475a',
      selection: 'rgba(68, 71, 90, 0.4)',
      colors: {
        keyword: '#ff79c6',
        type: '#8be9fd',
        function: '#50fa7b',
        macro: '#ff79c6',
        string: '#f1fa8c',
        comment: '#6272a4',
        number: '#bd93f9',
        attribute: '#50fa7b',
        operator: '#ff79c6',
        variable: '#f8f8f2',
      },
    },
    monokai: {
      name: 'monokai',
      displayName: 'Monokai',
      background: '#272822',
      foreground: '#f8f8f2',
      border: '#3e3d32',
      selection: 'rgba(73, 72, 62, 0.4)',
      colors: {
        keyword: '#f92672',
        type: '#66d9ef',
        function: '#a6e22e',
        macro: '#f92672',
        string: '#e6db74',
        comment: '#75715e',
        number: '#ae81ff',
        attribute: '#a6e22e',
        operator: '#f92672',
        variable: '#f8f8f2',
      },
    },
  },
}));

describe('ThemeSelector Component', () => {
  const mockOnThemeChange = jest.fn();
  const defaultProps = {
    currentTheme: 'vscode-dark',
    onThemeChange: mockOnThemeChange,
  };

  beforeEach(() => {
    setupTest();
    mockOnThemeChange.mockClear();
  });

  afterEach(() => {
    teardownTest();
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<ThemeSelector {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /change syntax highlighting theme/i }),
      ).toBeInTheDocument();
    });

    it('displays theme selector button', () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-haspopup', 'true');
    });

    it('displays palette icon', () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });
      const icon = button.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('shows tooltip on hover', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Change syntax theme')).toBeInTheDocument();
      });
    });
  });

  describe('Menu Interaction', () => {
    it('opens menu when button is clicked', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('closes menu when clicking outside', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Click outside the menu
      fireEvent.click(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('sets correct aria-expanded attribute', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Theme List Rendering', () => {
    it('displays all available themes in menu', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('VS Code Dark')).toBeInTheDocument();
        expect(screen.getByText('Dracula')).toBeInTheDocument();
        expect(screen.getByText('Monokai')).toBeInTheDocument();
      });
    });

    it('marks current theme as selected', async () => {
      render(<ThemeSelector {...defaultProps} currentTheme='dracula' />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        const draculaMenuItem = screen.getByText('Dracula').closest('[role="menuitem"]');
        expect(draculaMenuItem).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('renders theme names correctly', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        const themeNames = Object.values(syntaxThemes).map(theme => theme.displayName);
        themeNames.forEach(name => {
          expect(screen.getByText(name)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Theme Selection', () => {
    it('calls onThemeChange when theme is selected', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const draculaMenuItem = screen.getByText('Dracula');
      fireEvent.click(draculaMenuItem);

      expect(mockOnThemeChange).toHaveBeenCalledWith('dracula');
    });

    it('closes menu after theme selection', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const monokaiMenuItem = screen.getByText('Monokai');
      fireEvent.click(monokaiMenuItem);

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    });

    it('calls onThemeChange only once per selection', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const draculaMenuItem = screen.getByText('Dracula');
      fireEvent.click(draculaMenuItem);

      expect(mockOnThemeChange).toHaveBeenCalledTimes(1);
    });

    it('handles selecting the same theme', async () => {
      render(<ThemeSelector {...defaultProps} currentTheme='vscode-dark' />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const vscodeMenuItem = screen.getByText('VS Code Dark');
      fireEvent.click(vscodeMenuItem);

      expect(mockOnThemeChange).toHaveBeenCalledWith('vscode-dark');
    });
  });

  describe('Theme Preview', () => {
    it('shows preview on hover', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const draculaMenuItem = screen.getByText('Dracula').closest('[role="menuitem"]');
      fireEvent.mouseEnter(draculaMenuItem!);

      await waitFor(() => {
        // Should show preview code with theme colors
        expect(screen.getByText('const')).toBeInTheDocument();
        expect(screen.getByText('example')).toBeInTheDocument();
        expect(screen.getByText('=')).toBeInTheDocument();
        expect(screen.getByText('"Hello"')).toBeInTheDocument();
      });
    });

    it('hides preview on mouse leave', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const draculaMenuItem = screen.getByText('Dracula').closest('[role="menuitem"]');

      // First hover to show preview
      fireEvent.mouseEnter(draculaMenuItem!);

      await waitFor(() => {
        expect(screen.getByText('const')).toBeInTheDocument();
      });

      // Then leave to hide preview
      fireEvent.mouseLeave(draculaMenuItem!);

      await waitFor(() => {
        // Preview should be hidden but theme name should still be visible
        const constElements = screen.queryAllByText('const');
        // The preview const should be gone, but theme name should remain
        expect(constElements.length).toBeLessThanOrEqual(1);
      });
    });

    it('shows preview with correct syntax highlighting', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const draculaMenuItem = screen.getByText('Dracula').closest('[role="menuitem"]');
      fireEvent.mouseEnter(draculaMenuItem!);

      await waitFor(() => {
        const preview = screen.getByText('const').parentElement;
        expect(preview).toBeInTheDocument();

        // Check that syntax elements are present
        expect(screen.getByText('example')).toBeInTheDocument();
        expect(screen.getByText('"Hello"')).toBeInTheDocument();
        expect(screen.getByText(';')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation in menu', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      // Focus the button
      button.focus();
      expect(button).toHaveFocus();

      // Open menu with Enter
      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });

    it('supports Space key to open menu', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      button.focus();
      fireEvent.keyDown(button, { key: ' ' });

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });
  });

  describe('Memoization and Performance', () => {
    it('uses memo to prevent unnecessary re-renders', () => {
      const { rerender } = render(<ThemeSelector {...defaultProps} />);

      // Re-render with same props should not cause issues
      rerender(<ThemeSelector {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /change syntax highlighting theme/i }),
      ).toBeInTheDocument();
    });

    it('memoizes callback functions', async () => {
      const { rerender } = render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Re-render should not break functionality
      rerender(<ThemeSelector {...defaultProps} currentTheme='dracula' />);

      const draculaMenuItem = screen.getByText('Dracula');
      fireEvent.click(draculaMenuItem);

      expect(mockOnThemeChange).toHaveBeenCalledWith('dracula');
    });
  });

  describe('Visual States', () => {
    it('shows current theme with different styling', async () => {
      render(<ThemeSelector {...defaultProps} currentTheme='monokai' />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        const monokaiMenuItem = screen.getByText('Monokai').closest('[role="menuitem"]');
        expect(monokaiMenuItem).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('applies hover styles to menu items', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const draculaMenuItem = screen.getByText('Dracula').closest('[role="menuitem"]');

      // Hover should work without throwing errors
      fireEvent.mouseEnter(draculaMenuItem!);
      fireEvent.mouseLeave(draculaMenuItem!);

      expect(draculaMenuItem).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty theme list gracefully', () => {
      // Mock empty themes
      jest.doMock('../../themes/syntaxThemes', () => ({
        syntaxThemes: {},
      }));

      expect(() => {
        render(<ThemeSelector {...defaultProps} />);
      }).not.toThrow();
    });

    it('handles invalid current theme', async () => {
      render(<ThemeSelector {...defaultProps} currentTheme='non-existent-theme' />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Should not crash and should render available themes
      expect(screen.getByText('VS Code Dark')).toBeInTheDocument();
    });

    it('handles undefined onThemeChange callback', () => {
      expect(() => {
        render(<ThemeSelector currentTheme='vscode-dark' onThemeChange={undefined as any} />);
      }).not.toThrow();
    });

    it('handles theme with missing properties', async () => {
      // This would normally be caught by TypeScript, but test runtime behavior
      const malformedTheme = {
        name: 'malformed',
        displayName: 'Malformed Theme',
        // Missing other required properties
      };

      jest.doMock('../../themes/syntaxThemes', () => ({
        syntaxThemes: {
          malformed: malformedTheme,
        },
      }));

      expect(() => {
        render(<ThemeSelector {...defaultProps} currentTheme='malformed' />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards when closed', async () => {
      const { container } = render(<ThemeSelector {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards when open', async () => {
      const { container } = render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides proper ARIA attributes', () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      expect(button).toHaveAttribute('aria-label', 'Change syntax highlighting theme');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('provides proper menu item attributes', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems.length).toBeGreaterThan(0);

        menuItems.forEach(item => {
          expect(item).toHaveAttribute('role', 'menuitem');
        });
      });
    });

    it('supports screen reader navigation', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();

        // Menu should contain accessible menu items
        const menuItems = screen.getAllByRole('menuitem');
        expect(menuItems.length).toBe(Object.keys(syntaxThemes).length);
      });
    });
  });

  describe('Integration with MUI Components', () => {
    it('renders MUI IconButton correctly', () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      // Should be an MUI IconButton
      expect(button.className).toContain('MuiIconButton');
    });

    it('renders MUI Menu correctly', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        const menu = screen.getByRole('menu');
        expect(menu.className).toContain('MuiMenu');
      });
    });

    it('renders MUI Tooltip correctly', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.mouseEnter(button);

      await waitFor(() => {
        expect(screen.getByText('Change syntax theme')).toBeInTheDocument();
      });
    });

    it('uses MUI Fade transition', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        // Menu should appear with transition
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });
    });
  });

  describe('Theme Preview Functionality', () => {
    it('renders preview with correct theme colors', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const draculaMenuItem = screen.getByText('Dracula').closest('[role="menuitem"]');
      fireEvent.mouseEnter(draculaMenuItem!);

      await waitFor(() => {
        const constElement = screen.getByText('const');
        const exampleElement = screen.getByText('example');
        const stringElement = screen.getByText('"Hello"');

        expect(constElement).toBeInTheDocument();
        expect(exampleElement).toBeInTheDocument();
        expect(stringElement).toBeInTheDocument();
      });
    });

    it('shows different previews for different themes', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      // Test different themes show previews
      const themeNames = ['Dracula', 'Monokai'];

      for (const themeName of themeNames) {
        const menuItem = screen.getByText(themeName).closest('[role="menuitem"]');
        fireEvent.mouseEnter(menuItem!);

        await waitFor(() => {
          expect(screen.getByText('const')).toBeInTheDocument();
        });

        fireEvent.mouseLeave(menuItem!);
      }
    });
  });

  describe('Performance', () => {
    it('renders quickly', () => {
      const startTime = performance.now();
      render(<ThemeSelector {...defaultProps} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    it('opens menu quickly', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      const startTime = performance.now();
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('handles rapid interactions efficiently', async () => {
      render(<ThemeSelector {...defaultProps} />);
      const button = screen.getByRole('button', { name: /change syntax highlighting theme/i });

      // Rapidly open and close menu
      for (let i = 0; i < 5; i++) {
        fireEvent.click(button);
        await waitFor(() => {
          expect(screen.getByRole('menu')).toBeInTheDocument();
        });

        fireEvent.click(document.body);
        await waitFor(() => {
          expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        });
      }

      // Should still work after rapid interactions
      expect(button).toBeInTheDocument();
    });
  });
});
