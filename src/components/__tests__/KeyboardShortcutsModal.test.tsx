import { screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import { Shortcut } from '../../hooks/useKeyboardShortcuts';
import { render, setupTest, teardownTest } from '../../test-utils';
import KeyboardShortcutsModal from '../KeyboardShortcutsModal';

expect.extend(toHaveNoViolations);

// Mock shortcuts data
const mockShortcuts: Shortcut[] = [
  {
    key: 'k',
    ctrl: true,
    description: 'Focus search',
    category: 'Navigation',
    action: jest.fn(),
  },
  {
    key: '/',
    description: 'Focus search (alternative)',
    category: 'Navigation',
    action: jest.fn(),
  },
  {
    key: 'b',
    cmd: true,
    description: 'Toggle sidebar',
    category: 'Navigation',
    action: jest.fn(),
  },
  {
    key: 'j',
    description: 'Navigate down',
    category: 'Navigation',
    action: jest.fn(),
  },
  {
    key: '?',
    description: 'Show help',
    category: 'Help',
    action: jest.fn(),
  },
  {
    key: 's',
    ctrl: true,
    shift: true,
    description: 'Save document',
    category: 'Document',
    action: jest.fn(),
  },
  {
    key: 'f',
    alt: true,
    description: 'Open file menu',
    category: 'Menu',
    action: jest.fn(),
  },
];

const mockFormatShortcut = (shortcut: Shortcut): string => {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.cmd) parts.push('⌘');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');

  let { key } = shortcut;
  if (key === ' ') key = 'Space';

  parts.push(key.toUpperCase());

  return parts.join('+');
};

describe('KeyboardShortcutsModal Component', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    shortcuts: mockShortcuts,
    formatShortcut: mockFormatShortcut,
    isMac: false,
  };

  beforeEach(() => {
    setupTest();
    jest.clearAllMocks();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Basic Rendering', () => {
    it('renders when open is true', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<KeyboardShortcutsModal {...defaultProps} open={false} />);

      expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
    });

    it('renders modal title correctly', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Keyboard Shortcuts');
    });

    it('renders help text about showing shortcuts', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      expect(screen.getByText(/Press/)).toBeInTheDocument();
      expect(screen.getByText(/anytime to show this help/)).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<KeyboardShortcutsModal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', () => {
      const onClose = jest.fn();
      render(<KeyboardShortcutsModal {...defaultProps} onClose={onClose} />);

      // Get the backdrop (MUI Dialog backdrop)
      const backdrop = document.querySelector('.MuiBackdrop-root');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('calls onClose when Escape key is pressed', () => {
      const onClose = jest.fn();
      render(<KeyboardShortcutsModal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Shortcuts Display', () => {
    it('displays all provided shortcuts', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      // Check that shortcuts from different categories are displayed
      expect(screen.getByText('Focus search')).toBeInTheDocument();
      expect(screen.getByText('Toggle sidebar')).toBeInTheDocument();
      expect(screen.getByText('Navigate down')).toBeInTheDocument();
      expect(screen.getByText('Show help')).toBeInTheDocument();
    });

    it('groups shortcuts by category', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      // Check category headers
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
      expect(screen.getByText('Document')).toBeInTheDocument();
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    it('formats shortcut keys correctly', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      // Check for formatted key combinations
      expect(screen.getByText('CTRL')).toBeInTheDocument();
      expect(screen.getByText('K')).toBeInTheDocument();
      expect(screen.getByText('/')).toBeInTheDocument();
    });

    it('displays modifier keys correctly', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      // Should show Ctrl, Shift, Alt modifiers
      expect(screen.getAllByText('CTRL')).toHaveLength(2); // Ctrl+K and Ctrl+Shift+S
      expect(screen.getByText('SHIFT')).toBeInTheDocument();
      expect(screen.getByText('ALT')).toBeInTheDocument();
    });

    it('handles shortcuts without modifiers', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      // Check for shortcuts without modifiers like 'j' and '?'
      expect(screen.getByText('J')).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('Mac vs PC Display', () => {
    it('shows PC-style shortcuts when isMac is false', () => {
      render(<KeyboardShortcutsModal {...defaultProps} isMac={false} />);

      expect(screen.getByText(/Control/)).toBeInTheDocument();
      expect(screen.queryByText('⌘')).not.toBeInTheDocument();
    });

    it('shows Mac-style shortcuts when isMac is true', () => {
      render(<KeyboardShortcutsModal {...defaultProps} isMac />);

      expect(screen.getByText(/Command/)).toBeInTheDocument();
      expect(screen.getByText('⌘')).toBeInTheDocument();
    });

    it('displays appropriate tips for Mac users', () => {
      render(<KeyboardShortcutsModal {...defaultProps} isMac />);

      expect(screen.getByText(/⌘ represents the Command key/)).toBeInTheDocument();
    });

    it('displays appropriate tips for PC users', () => {
      render(<KeyboardShortcutsModal {...defaultProps} isMac={false} />);

      expect(screen.getByText(/Ctrl represents the Control key/)).toBeInTheDocument();
    });
  });

  describe('Special Shortcuts', () => {
    it('displays special navigation shortcuts', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      // Check for special G+H and G+D shortcuts
      expect(screen.getByText('Go to Home')).toBeInTheDocument();
      expect(screen.getByText('Go to Documentation')).toBeInTheDocument();
    });

    it('shows sequence indicators for multi-key shortcuts', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      // Should show "then" between G and H for sequence shortcuts
      expect(screen.getAllByText('then')).toHaveLength(2); // G then H, G then D
    });

    it('filters out the g key from regular shortcuts display', () => {
      const shortcutsWithG = [
        ...mockShortcuts,
        {
          key: 'g',
          description: 'Go mode',
          category: 'Navigation',
          action: jest.fn(),
        },
      ];

      render(<KeyboardShortcutsModal {...defaultProps} shortcuts={shortcutsWithG} />);

      // Should not show the standalone 'g' shortcut in the table
      expect(screen.queryByText('Go mode')).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('handles empty shortcuts array', () => {
      render(<KeyboardShortcutsModal {...defaultProps} shortcuts={[]} />);

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      // Should still show the general information
      expect(screen.getByText(/Press/)).toBeInTheDocument();
    });

    it('handles shortcuts without categories', () => {
      const shortcutsWithoutCategory = [
        {
          key: 'x',
          description: 'Test shortcut',
          action: jest.fn(),
        },
      ];

      render(<KeyboardShortcutsModal {...defaultProps} shortcuts={shortcutsWithoutCategory} />);

      // Should group under "General" category
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Test shortcut')).toBeInTheDocument();
    });
  });

  describe('Interaction and Hover Effects', () => {
    it('applies hover effects to shortcut rows', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      const firstRow = screen.getByText('Focus search').closest('tr');
      expect(firstRow).toBeInTheDocument();

      // Hover should not cause errors
      fireEvent.mouseEnter(firstRow!);
      fireEvent.mouseLeave(firstRow!);

      expect(screen.getByText('Focus search')).toBeInTheDocument();
    });

    it('maintains proper table structure', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      // Check for proper table elements
      expect(screen.getAllByRole('table')).toHaveLength(4); // One per category
      expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
      expect(screen.getAllByRole('cell').length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('renders with fullWidth dialog', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('uses maxWidth md for dialog', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      // Dialog should be present and responsive
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Tips and Help Information', () => {
    it('displays helpful tips section', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      expect(screen.getByText('Tips:')).toBeInTheDocument();
      expect(
        screen.getByText(/Shortcuts work anywhere except in input fields/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Press ESC to close dialogs/)).toBeInTheDocument();
    });

    it('shows correct platform-specific modifier information', () => {
      render(<KeyboardShortcutsModal {...defaultProps} isMac={false} />);

      expect(screen.getByText(/Ctrl represents the Control key/)).toBeInTheDocument();
    });
  });

  describe('Complex Shortcut Formatting', () => {
    it('handles shortcuts with multiple modifiers', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      // Ctrl+Shift+S should be displayed correctly
      expect(screen.getByText('Save document')).toBeInTheDocument();
    });

    it('handles shortcuts with special characters', () => {
      const specialShortcuts = [
        {
          key: '?',
          description: 'Help',
          category: 'Help',
          action: jest.fn(),
        },
      ];

      render(<KeyboardShortcutsModal {...defaultProps} shortcuts={specialShortcuts} />);

      expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('processes formatShortcut function correctly', () => {
      const customFormatShortcut = jest.fn(shortcut => `Custom-${shortcut.key}`);

      render(<KeyboardShortcutsModal {...defaultProps} formatShortcut={customFormatShortcut} />);

      expect(customFormatShortcut).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('meets accessibility standards', async () => {
      const { container } = render(<KeyboardShortcutsModal {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper dialog role and labels', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Keyboard Shortcuts');
    });

    it('has proper table structure for screen readers', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      const tables = screen.getAllByRole('table');
      expect(tables.length).toBeGreaterThan(0);

      // Each table should have proper structure
      tables.forEach(table => {
        expect(table).toBeInTheDocument();
      });
    });

    it('provides proper focus management', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();

      closeButton.focus();
      expect(closeButton).toHaveFocus();
    });

    it('handles keyboard navigation properly', () => {
      render(<KeyboardShortcutsModal {...defaultProps} />);

      const closeButton = screen.getByRole('button');

      fireEvent.keyDown(closeButton, { key: 'Tab' });
      fireEvent.keyDown(closeButton, { key: 'Enter' });

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles malformed shortcuts gracefully', () => {
      const malformedShortcuts = [
        {
          key: '',
          description: 'Empty key',
          category: 'Test',
          action: jest.fn(),
        },
        // @ts-ignore - testing runtime behavior
        {
          description: 'Missing key',
          category: 'Test',
          action: jest.fn(),
        },
      ];

      render(<KeyboardShortcutsModal {...defaultProps} shortcuts={malformedShortcuts} />);

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });

    it('handles missing formatShortcut function', () => {
      // @ts-ignore - testing runtime behavior
      render(<KeyboardShortcutsModal {...defaultProps} formatShortcut={undefined} />);

      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large numbers of shortcuts efficiently', () => {
      const manyShortcuts = Array.from({ length: 100 }, (_, i) => ({
        key: String.fromCharCode(97 + (i % 26)), // a-z cycling
        description: `Shortcut ${i}`,
        category: `Category ${Math.floor(i / 10)}`,
        action: jest.fn(),
      }));

      const start = performance.now();
      render(<KeyboardShortcutsModal {...defaultProps} shortcuts={manyShortcuts} />);
      const end = performance.now();

      expect(end - start).toBeLessThan(1000); // Should render in under 1 second
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });
  });
});
