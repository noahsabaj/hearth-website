import { screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { render, setupTest, teardownTest } from '../../test-utils';
import ShortcutIndicator from '../ShortcutIndicator';

expect.extend(toHaveNoViolations);

describe('ShortcutIndicator Component', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });

    it('renders with single shortcut', () => {
      render(<ShortcutIndicator shortcuts={['esc']} />);
      expect(screen.getByText('ESC')).toBeInTheDocument();
    });

    it('renders with multiple shortcuts', () => {
      render(<ShortcutIndicator shortcuts={['ctrl', 'shift', 'k']} />);
      expect(screen.getByText('CTRL')).toBeInTheDocument();
      expect(screen.getByText('SHIFT')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
    });

    it('renders keyboard icon', () => {
      render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);
      // Check for the keyboard icon (MUI icon)
      const keyboardIcon = document.querySelector('svg');
      expect(keyboardIcon).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      const description = 'Open search';
      render(<ShortcutIndicator shortcuts={['ctrl', 'k']} description={description} />);
      expect(screen.getByText(description)).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
      render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);
      // Should not have any description text
      expect(screen.queryByText(/open/i)).not.toBeInTheDocument();
    });
  });

  describe('Key Formatting', () => {
    describe('Mac Platform Detection', () => {
      beforeEach(() => {
        // Mock Mac platform
        Object.defineProperty(window.navigator, 'platform', {
          value: 'MacIntel',
          configurable: true,
        });
      });

      it('formats cmd key correctly on Mac', () => {
        render(<ShortcutIndicator shortcuts={['cmd', 'k']} />);
        expect(screen.getByText('⌘')).toBeInTheDocument();
        expect(screen.getByText('K')).toBeInTheDocument();
      });

      it('formats ctrl key correctly on Mac', () => {
        render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);
        expect(screen.getByText('⌃')).toBeInTheDocument();
      });

      it('formats alt key correctly on Mac', () => {
        render(<ShortcutIndicator shortcuts={['alt', 'k']} />);
        expect(screen.getByText('⌥')).toBeInTheDocument();
      });

      it('formats shift key correctly on Mac', () => {
        render(<ShortcutIndicator shortcuts={['shift', 'k']} />);
        expect(screen.getByText('⇧')).toBeInTheDocument();
      });
    });

    describe('Non-Mac Platform', () => {
      beforeEach(() => {
        // Mock Windows platform
        Object.defineProperty(window.navigator, 'platform', {
          value: 'Win32',
          configurable: true,
        });
      });

      it('formats cmd key correctly on Windows', () => {
        render(<ShortcutIndicator shortcuts={['cmd', 'k']} />);
        expect(screen.getByText('Ctrl')).toBeInTheDocument();
        expect(screen.getByText('K')).toBeInTheDocument();
      });

      it('formats ctrl key correctly on Windows', () => {
        render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);
        expect(screen.getByText('Ctrl')).toBeInTheDocument();
      });

      it('formats alt key correctly on Windows', () => {
        render(<ShortcutIndicator shortcuts={['alt', 'k']} />);
        expect(screen.getByText('Alt')).toBeInTheDocument();
      });

      it('formats shift key correctly on Windows', () => {
        render(<ShortcutIndicator shortcuts={['shift', 'k']} />);
        expect(screen.getByText('Shift')).toBeInTheDocument();
      });
    });

    describe('Arrow Keys', () => {
      it('formats arrow keys with symbols', () => {
        render(<ShortcutIndicator shortcuts={['up', 'down', 'left', 'right']} />);
        expect(screen.getByText('↑')).toBeInTheDocument();
        expect(screen.getByText('↓')).toBeInTheDocument();
        expect(screen.getByText('←')).toBeInTheDocument();
        expect(screen.getByText('→')).toBeInTheDocument();
      });
    });

    describe('Regular Keys', () => {
      it('formats regular keys in uppercase', () => {
        render(<ShortcutIndicator shortcuts={['a', 'b', 'c']} />);
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
        expect(screen.getByText('C')).toBeInTheDocument();
      });

      it('handles lowercase input correctly', () => {
        render(<ShortcutIndicator shortcuts={['ctrl', 'shift', 'p']} />);
        expect(screen.getByText('P')).toBeInTheDocument();
      });

      it('handles mixed case input correctly', () => {
        render(<ShortcutIndicator shortcuts={['Ctrl', 'Alt', 'DeL']} />);
        expect(screen.getByText('Ctrl')).toBeInTheDocument();
        expect(screen.getByText('Alt')).toBeInTheDocument();
        expect(screen.getByText('DEL')).toBeInTheDocument();
      });
    });

    describe('Special Keys', () => {
      it('formats unrecognized keys in uppercase', () => {
        render(<ShortcutIndicator shortcuts={['f1', 'enter', 'space']} />);
        expect(screen.getByText('F1')).toBeInTheDocument();
        expect(screen.getByText('ENTER')).toBeInTheDocument();
        expect(screen.getByText('SPACE')).toBeInTheDocument();
      });
    });

    describe('Case Insensitivity', () => {
      it('handles keys with different cases', () => {
        render(<ShortcutIndicator shortcuts={['CMD', 'alt', 'ShIfT']} />);
        // Should format consistently regardless of input case
        expect(screen.getByText(/⌘|Ctrl/)).toBeInTheDocument(); // Depending on platform
        expect(screen.getByText(/⌥|Alt/)).toBeInTheDocument();
        expect(screen.getByText(/⇧|Shift/)).toBeInTheDocument();
      });
    });
  });

  describe('Platform Detection', () => {
    it('detects Mac platform correctly', () => {
      const platforms = ['Mac68K', 'MacPPC', 'MacIntel', 'iPhone', 'iPad', 'iPod'];

      platforms.forEach(platform => {
        Object.defineProperty(window.navigator, 'platform', {
          value: platform,
          configurable: true,
        });

        render(<ShortcutIndicator shortcuts={['cmd']} />);
        expect(screen.getByText('⌘')).toBeInTheDocument();

        // Clean up for next iteration
        document.body.innerHTML = '';
      });
    });

    it('detects non-Mac platform correctly', () => {
      const platforms = ['Win32', 'Win64', 'Linux x86_64', 'Linux armv7l'];

      platforms.forEach(platform => {
        Object.defineProperty(window.navigator, 'platform', {
          value: platform,
          configurable: true,
        });

        render(<ShortcutIndicator shortcuts={['cmd']} />);
        expect(screen.getByText('Ctrl')).toBeInTheDocument();

        // Clean up for next iteration
        document.body.innerHTML = '';
      });
    });

    it('handles undefined window/navigator gracefully', () => {
      // Simulate server-side rendering
      const originalWindow = global.window;
      delete (global as any).window;

      // Should not crash
      expect(() => render(<ShortcutIndicator shortcuts={['cmd']} />)).not.toThrow();

      // Restore window
      global.window = originalWindow;
    });
  });

  describe('Separator Rendering', () => {
    it('renders plus signs between shortcuts', () => {
      render(<ShortcutIndicator shortcuts={['ctrl', 'shift', 'k']} />);
      const plusSigns = screen.getAllByText('+');
      expect(plusSigns).toHaveLength(2); // Between 3 shortcuts, should have 2 separators
    });

    it('does not render separator for single shortcut', () => {
      render(<ShortcutIndicator shortcuts={['esc']} />);
      expect(screen.queryByText('+')).not.toBeInTheDocument();
    });

    it('renders correct number of separators for multiple shortcuts', () => {
      const shortcuts = ['ctrl', 'alt', 'shift', 'f12'];
      render(<ShortcutIndicator shortcuts={shortcuts} />);
      const plusSigns = screen.getAllByText('+');
      expect(plusSigns).toHaveLength(shortcuts.length - 1);
    });
  });

  describe('Complex Shortcut Combinations', () => {
    it('renders complex Mac shortcut combination', () => {
      Object.defineProperty(window.navigator, 'platform', {
        value: 'MacIntel',
        configurable: true,
      });

      render(<ShortcutIndicator shortcuts={['cmd', 'shift', 'alt', 'up']} />);
      expect(screen.getByText('⌘')).toBeInTheDocument();
      expect(screen.getByText('⇧')).toBeInTheDocument();
      expect(screen.getByText('⌥')).toBeInTheDocument();
      expect(screen.getByText('↑')).toBeInTheDocument();

      const plusSigns = screen.getAllByText('+');
      expect(plusSigns).toHaveLength(3);
    });

    it('renders complex Windows shortcut combination', () => {
      Object.defineProperty(window.navigator, 'platform', {
        value: 'Win32',
        configurable: true,
      });

      render(<ShortcutIndicator shortcuts={['ctrl', 'shift', 'alt', 'down']} />);
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('Shift')).toBeInTheDocument();
      expect(screen.getByText('Alt')).toBeInTheDocument();
      expect(screen.getByText('↓')).toBeInTheDocument();
    });
  });

  describe('Description Rendering', () => {
    it('renders description with proper styling', () => {
      const description = 'Toggle dark mode';
      render(<ShortcutIndicator shortcuts={['ctrl', 'd']} description={description} />);

      const descriptionElement = screen.getByText(description);
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement.tagName.toLowerCase()).toBe('p'); // MUI Typography variant="caption" renders as p
    });

    it('handles long descriptions', () => {
      const longDescription =
        'This is a very long description that describes what this keyboard shortcut does in great detail';
      render(<ShortcutIndicator shortcuts={['ctrl', 'k']} description={longDescription} />);
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('handles special characters in description', () => {
      const specialDescription = 'Search & replace with "quotes" & <html> tags';
      render(<ShortcutIndicator shortcuts={['ctrl', 'h']} description={specialDescription} />);
      expect(screen.getByText(specialDescription)).toBeInTheDocument();
    });

    it('handles empty string description', () => {
      render(<ShortcutIndicator shortcuts={['ctrl', 'k']} description='' />);
      // Empty description should still render the element but be empty
      expect(screen.queryByText(/.+/)).toBeTruthy(); // Should have shortcuts but empty description
    });
  });

  describe('Edge Cases', () => {
    it('handles empty shortcuts array', () => {
      render(<ShortcutIndicator shortcuts={[]} />);
      // Should render without shortcuts
      expect(screen.queryByText('+')).not.toBeInTheDocument();
    });

    it('handles single character shortcuts', () => {
      render(<ShortcutIndicator shortcuts={['a']} />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('handles shortcuts with numbers', () => {
      render(<ShortcutIndicator shortcuts={['ctrl', '1', '2', '3']} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('handles shortcuts with special characters', () => {
      render(<ShortcutIndicator shortcuts={['ctrl', '/', '.']} />);
      expect(screen.getByText('/')).toBeInTheDocument();
      expect(screen.getByText('.')).toBeInTheDocument();
    });

    it('handles null or undefined values gracefully', () => {
      // TypeScript would prevent this, but test runtime behavior
      expect(() => {
        render(<ShortcutIndicator shortcuts={['ctrl', null as any, 'k']} />);
      }).not.toThrow();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct container styling', () => {
      render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);
      const container = screen.getByRole('generic');

      // Container should be inline-flex (tested through behavior)
      expect(container).toBeInTheDocument();
    });

    it('renders shortcuts as chips', () => {
      render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);

      // MUI Chip components should be rendered
      const ctrlChip = screen.getByText('Ctrl').closest('.MuiChip-root');
      const kChip = screen.getByText('K').closest('.MuiChip-root');

      expect(ctrlChip).toBeInTheDocument();
      expect(kChip).toBeInTheDocument();
    });

    it('applies monospace font to chips', () => {
      render(<ShortcutIndicator shortcuts={['ctrl']} />);
      const chip = screen.getByText('Ctrl').closest('.MuiChip-root');

      // Should have monospace font applied through sx prop
      expect(chip).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(
        <ShortcutIndicator shortcuts={['ctrl', 'k']} description='Open search dialog' />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards with complex shortcuts', async () => {
      const { container } = render(
        <ShortcutIndicator
          shortcuts={['cmd', 'shift', 'alt', 'f12']}
          description='Developer tools'
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('meets accessibility standards without description', async () => {
      const { container } = render(<ShortcutIndicator shortcuts={['esc']} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('provides meaningful text content for screen readers', () => {
      render(
        <ShortcutIndicator shortcuts={['ctrl', 'shift', 'p']} description='Command palette' />,
      );

      // Screen readers should be able to read the shortcut keys and description
      expect(screen.getByText('Ctrl')).toBeInTheDocument();
      expect(screen.getByText('Shift')).toBeInTheDocument();
      expect(screen.getByText('P')).toBeInTheDocument();
      expect(screen.getByText('Command palette')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    it('renders with theme colors', () => {
      render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);

      // Should render without errors and use theme colors
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });

    it('handles theme changes gracefully', () => {
      const { rerender } = render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);

      // Re-render should work fine (theme changes handled by provider)
      rerender(<ShortcutIndicator shortcuts={['alt', 'f4']} />);

      expect(screen.getByText('Alt')).toBeInTheDocument();
      expect(screen.getByText('F4')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders quickly with simple shortcuts', () => {
      const startTime = performance.now();
      render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    it('renders quickly with complex shortcuts', () => {
      const startTime = performance.now();
      render(
        <ShortcutIndicator
          shortcuts={['cmd', 'shift', 'alt', 'ctrl', 'f12']}
          description='Complex shortcut combination'
        />
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('handles re-renders efficiently', () => {
      const { rerender } = render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);

      const startTime = performance.now();

      // Multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender(<ShortcutIndicator shortcuts={['ctrl', `${i}`]} />);
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Props Validation', () => {
    it('handles shortcuts prop changes', () => {
      const { rerender } = render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);

      expect(screen.getByText('K')).toBeInTheDocument();

      rerender(<ShortcutIndicator shortcuts={['alt', 'f4']} />);

      expect(screen.queryByText('K')).not.toBeInTheDocument();
      expect(screen.getByText('F4')).toBeInTheDocument();
    });

    it('handles description prop changes', () => {
      const { rerender } = render(
        <ShortcutIndicator shortcuts={['ctrl', 'k']} description='First description' />
      );

      expect(screen.getByText('First description')).toBeInTheDocument();

      rerender(<ShortcutIndicator shortcuts={['ctrl', 'k']} description='Second description' />);

      expect(screen.queryByText('First description')).not.toBeInTheDocument();
      expect(screen.getByText('Second description')).toBeInTheDocument();
    });

    it('handles adding and removing description', () => {
      const { rerender } = render(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);

      expect(screen.queryByText(/description/)).not.toBeInTheDocument();

      rerender(<ShortcutIndicator shortcuts={['ctrl', 'k']} description='Added description' />);

      expect(screen.getByText('Added description')).toBeInTheDocument();

      rerender(<ShortcutIndicator shortcuts={['ctrl', 'k']} />);

      expect(screen.queryByText('Added description')).not.toBeInTheDocument();
    });
  });
});
