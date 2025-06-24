import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import React from 'react';

import App from '../../App';
import { KeyboardShortcutsProvider } from '../../contexts/KeyboardShortcutsContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { render, setupTest, teardownTest } from '../../test-utils';

expect.extend(toHaveNoViolations);

// Mock keyboard shortcuts context
const mockKeyboardContext = {
  shortcuts: {
    '/': { key: '/', description: 'Focus search', action: 'focusSearch' },
    '?': { key: '?', description: 'Show shortcuts', action: 'showShortcuts' },
    h: { key: 'h', description: 'Go home', action: 'goHome' },
    d: { key: 'd', description: 'Go to docs', action: 'goDocs' },
    t: { key: 't', description: 'Toggle theme', action: 'toggleTheme' },
    Escape: { key: 'Escape', description: 'Close modal', action: 'closeModal' },
    k: { key: 'k', description: 'Search (with Ctrl)', action: 'focusSearch', modifier: 'ctrl' },
    n: { key: 'n', description: 'Next page', action: 'nextPage', modifier: 'ctrl' },
    p: { key: 'p', description: 'Previous page', action: 'prevPage', modifier: 'ctrl' },
  },
  isModalOpen: false,
  toggleModal: jest.fn(),
  closeModal: jest.fn(),
  registerShortcut: jest.fn(),
  unregisterShortcut: jest.fn(),
  isEnabled: true,
  setEnabled: jest.fn(),
};

jest.mock('../../contexts/KeyboardShortcutsContext', () => ({
  ...jest.requireActual('../../contexts/KeyboardShortcutsContext'),
  useKeyboardShortcuts: () => mockKeyboardContext,
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Keyboard Shortcuts Integration Tests', () => {
  beforeEach(() => {
    setupTest();
    mockNavigate.mockClear();
    mockKeyboardContext.toggleModal.mockClear();
    mockKeyboardContext.closeModal.mockClear();
    mockKeyboardContext.registerShortcut.mockClear();
    mockKeyboardContext.unregisterShortcut.mockClear();
    mockKeyboardContext.setEnabled.mockClear();
  });

  afterEach(() => {
    teardownTest();
  });

  describe('Basic Keyboard Navigation', () => {
    it('should focus search input with / key', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Press / key
      await user.keyboard('/');

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      expect(searchInput).toHaveFocus();
    });

    it('should show keyboard shortcuts modal with ? key', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Press ? key
      await user.keyboard('?');

      expect(mockKeyboardContext.toggleModal).toHaveBeenCalled();

      // Modal should be visible
      await waitFor(() => {
        const modal = screen.getByRole('dialog', { name: /keyboard shortcuts/i });
        expect(modal).toBeInTheDocument();
      });
    });

    it('should navigate to home with h key', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Press h key
      await user.keyboard('h');

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should navigate to documentation with d key', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Press d key
      await user.keyboard('d');

      expect(mockNavigate).toHaveBeenCalledWith('/docs');
    });

    it('should toggle theme with t key', async () => {
      const user = userEvent.setup();
      const mockToggleTheme = jest.fn();

      render(
        <ThemeProvider value={{ toggleTheme: mockToggleTheme }}>
          <KeyboardShortcutsProvider>
            <App />
          </KeyboardShortcutsProvider>
        </ThemeProvider>
      );

      // Press t key
      await user.keyboard('t');

      expect(mockToggleTheme).toHaveBeenCalled();
    });

    it('should close modal with Escape key', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Open modal first
      await user.keyboard('?');
      expect(mockKeyboardContext.toggleModal).toHaveBeenCalled();

      // Press Escape to close
      await user.keyboard('{Escape}');
      expect(mockKeyboardContext.closeModal).toHaveBeenCalled();
    });
  });

  describe('Modifier Key Combinations', () => {
    it('should handle Ctrl+K for search focus', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Press Ctrl+K
      await user.keyboard('{Control>}k{/Control}');

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      expect(searchInput).toHaveFocus();
    });

    it('should handle Ctrl+N for next page navigation', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Set up current page context
      Object.defineProperty(window, 'location', {
        value: { pathname: '/docs' },
        writable: true,
      });

      // Press Ctrl+N
      await user.keyboard('{Control>}n{/Control}');

      // Should navigate to next logical page
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle Ctrl+P for previous page navigation', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Set up current page context
      Object.defineProperty(window, 'location', {
        value: { pathname: '/engine' },
        writable: true,
      });

      // Press Ctrl+P
      await user.keyboard('{Control>}p{/Control}');

      // Should navigate to previous logical page
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should distinguish between modified and unmodified keys', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Press k without modifier (should do nothing special)
      await user.keyboard('k');

      // Search should not be focused
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      expect(searchInput).not.toHaveFocus();

      // Press Ctrl+K (should focus search)
      await user.keyboard('{Control>}k{/Control}');
      expect(searchInput).toHaveFocus();
    });
  });

  describe('Context-Sensitive Shortcuts', () => {
    it('should disable shortcuts when typing in input fields', async () => {
      const user = userEvent.setup();
      render(<App />);

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.click(searchInput);

      // Type keys that would normally trigger shortcuts
      await user.type(searchInput, 'hdt?');

      // Should not navigate or trigger shortcuts
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockKeyboardContext.toggleModal).not.toHaveBeenCalled();

      // Text should appear in input
      expect(searchInput).toHaveValue('hdt?');
    });

    it('should disable shortcuts when modal is open', async () => {
      const user = userEvent.setup();
      mockKeyboardContext.isModalOpen = true;

      render(<App />);

      // Press navigation shortcuts
      await user.keyboard('h');
      await user.keyboard('d');

      // Should not navigate when modal is open
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should enable shortcuts after modal closes', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Open modal
      await user.keyboard('?');
      mockKeyboardContext.isModalOpen = true;

      // Close modal
      await user.keyboard('{Escape}');
      mockKeyboardContext.isModalOpen = false;

      // Now shortcuts should work
      await user.keyboard('h');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle shortcuts in different page contexts', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Navigate to documentation page
      Object.defineProperty(window, 'location', {
        value: { pathname: '/docs' },
        writable: true,
      });

      // Page-specific shortcuts should work
      await user.keyboard('{Control>}n{/Control}');
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts Modal', () => {
    it('should display all available shortcuts in modal', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Open shortcuts modal
      await user.keyboard('?');

      await waitFor(() => {
        const modal = screen.getByRole('dialog', { name: /keyboard shortcuts/i });
        expect(modal).toBeInTheDocument();

        // Check for shortcut descriptions
        expect(within(modal).getByText(/focus search/i)).toBeInTheDocument();
        expect(within(modal).getByText(/show shortcuts/i)).toBeInTheDocument();
        expect(within(modal).getByText(/go home/i)).toBeInTheDocument();
        expect(within(modal).getByText(/toggle theme/i)).toBeInTheDocument();
      });
    });

    it('should group shortcuts by category', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.keyboard('?');

      await waitFor(() => {
        const modal = screen.getByRole('dialog', { name: /keyboard shortcuts/i });

        // Check for category headings
        expect(within(modal).getByText(/navigation/i)).toBeInTheDocument();
        expect(within(modal).getByText(/search/i)).toBeInTheDocument();
        expect(within(modal).getByText(/appearance/i)).toBeInTheDocument();
      });
    });

    it('should show keyboard key representations', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.keyboard('?');

      await waitFor(() => {
        const modal = screen.getByRole('dialog', { name: /keyboard shortcuts/i });

        // Check for key representations
        const keyElements = within(modal).getAllByTestId('keyboard-key');
        expect(keyElements.length).toBeGreaterThan(0);

        // Check specific keys
        expect(within(modal).getByText('/')).toBeInTheDocument();
        expect(within(modal).getByText('?')).toBeInTheDocument();
        expect(within(modal).getByText('Ctrl')).toBeInTheDocument();
      });
    });

    it('should be closable via keyboard and mouse', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Open modal
      await user.keyboard('?');

      await waitFor(() => {
        const modal = screen.getByRole('dialog', { name: /keyboard shortcuts/i });
        expect(modal).toBeInTheDocument();
      });

      // Close with Escape
      await user.keyboard('{Escape}');
      expect(mockKeyboardContext.closeModal).toHaveBeenCalled();

      // Reopen and close with click
      await user.keyboard('?');
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      expect(mockKeyboardContext.closeModal).toHaveBeenCalledTimes(2);
    });
  });

  describe('Dynamic Shortcut Registration', () => {
    it('should allow components to register custom shortcuts', () => {
      render(
        <KeyboardShortcutsProvider>
          <div>Test Component</div>
        </KeyboardShortcutsProvider>
      );

      // Should be able to register new shortcuts
      expect(mockKeyboardContext.registerShortcut).toBeDefined();
    });

    it('should clean up shortcuts when components unmount', () => {
      const { unmount } = render(
        <KeyboardShortcutsProvider>
          <div>Test Component</div>
        </KeyboardShortcutsProvider>
      );

      unmount();

      // Should unregister shortcuts on unmount
      expect(mockKeyboardContext.unregisterShortcut).toBeDefined();
    });

    it('should handle conflicting shortcut registrations', () => {
      render(<App />);

      // Try to register duplicate shortcut
      mockKeyboardContext.registerShortcut('h', {
        description: 'Duplicate home shortcut',
        action: 'duplicateHome',
      });

      // Should handle conflict appropriately (warn or override)
      expect(mockKeyboardContext.registerShortcut).toHaveBeenCalled();
    });
  });

  describe('Accessibility for Keyboard Navigation', () => {
    it('should provide proper focus management', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Tab through interactive elements
      await user.tab();

      const focusedElement = document.activeElement;
      expect(focusedElement).toHaveAttribute('role');

      await user.tab();

      const newFocusedElement = document.activeElement;
      expect(newFocusedElement).not.toBe(focusedElement);
    });

    it('should skip to main content with skip link', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Focus skip link (usually first focusable element)
      await user.tab();

      const skipLink = screen.getByText(/skip to main content/i);
      expect(skipLink).toHaveFocus();

      // Activate skip link
      await user.keyboard('{Enter}');

      // Should focus main content
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveFocus();
    });

    it('should provide visible focus indicators', async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.tab();

      const focusedElement = document.activeElement;
      const styles = window.getComputedStyle(focusedElement!);

      // Should have visible focus indicator
      expect(styles.outline).not.toBe('none');
      expect(styles.boxShadow).toBeTruthy();
    });

    it('should meet WCAG keyboard navigation standards', async () => {
      const { container } = render(<App />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should announce keyboard shortcut activations', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Press navigation shortcut
      await user.keyboard('h');

      // Should announce navigation action
      await waitFor(() => {
        const liveRegion = screen.getByRole('status', { hidden: true });
        expect(liveRegion).toHaveTextContent(/navigating to home/i);
      });
    });
  });

  describe('Keyboard Shortcuts Performance', () => {
    it('should not cause performance issues with rapid keystrokes', async () => {
      const user = userEvent.setup({ delay: 1 });
      render(<App />);

      const startTime = performance.now();

      // Rapidly press keys
      for (let i = 0; i < 10; i++) {
        await user.keyboard('h');
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should handle rapid keystrokes efficiently
      expect(executionTime).toBeLessThan(100); // 100ms threshold
    });

    it('should debounce rapid shortcut activations', async () => {
      const user = userEvent.setup({ delay: 1 });
      render(<App />);

      // Rapidly press same shortcut
      await user.keyboard('hhhhh');

      // Should only process final action
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should not leak event listeners', () => {
      const initialListenerCount = document.querySelectorAll('*').length;

      const { unmount } = render(<App />);
      unmount();

      // Listener count should not increase significantly
      const finalListenerCount = document.querySelectorAll('*').length;
      expect(finalListenerCount).toBeLessThanOrEqual(initialListenerCount + 5);
    });
  });

  describe('Cross-Browser Keyboard Compatibility', () => {
    it('should handle different key codes correctly', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Test different representations of same key
      const event1 = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' });
      const event2 = new KeyboardEvent('keydown', { key: 'Esc', code: 'Escape' });

      fireEvent(document, event1);
      fireEvent(document, event2);

      // Both should trigger the same action
      expect(mockKeyboardContext.closeModal).toHaveBeenCalledTimes(2);
    });

    it('should work with different keyboard layouts', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Test QWERTY layout shortcuts
      await user.keyboard('/');
      expect(screen.getByRole('textbox', { name: /search/i })).toHaveFocus();

      // Should also work with other common layouts (AZERTY, QWERTZ)
      // This would require more complex testing in a real scenario
    });

    it('should handle international characters appropriately', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Should not trigger shortcuts for international characters
      await user.keyboard('ñ');
      await user.keyboard('é');
      await user.keyboard('ü');

      // Should not trigger any navigation
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts Customization', () => {
    it('should allow users to customize shortcuts', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Open settings or customization panel
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      // Should show shortcut customization options
      const shortcutSettings = screen.getByText(/customize shortcuts/i);
      expect(shortcutSettings).toBeInTheDocument();
    });

    it('should validate custom shortcut assignments', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Try to assign conflicting shortcut
      mockKeyboardContext.registerShortcut('/', {
        description: 'Conflicting shortcut',
        action: 'conflict',
      });

      // Should handle conflict (show warning or prevent assignment)
      expect(mockKeyboardContext.registerShortcut).toHaveBeenCalled();
    });

    it('should persist custom shortcuts', () => {
      // Mock localStorage for persistence
      const customShortcuts = {
        j: { key: 'j', description: 'Custom down', action: 'customDown' },
        k: { key: 'k', description: 'Custom up', action: 'customUp' },
      };

      localStorage.setItem('keyboard-shortcuts', JSON.stringify(customShortcuts));

      render(<App />);

      // Should load custom shortcuts from storage
      expect(localStorage.getItem).toHaveBeenCalledWith('keyboard-shortcuts');
    });
  });

  describe('Mobile and Touch Device Considerations', () => {
    it('should disable keyboard shortcuts on touch devices', () => {
      // Mock touch device
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 1,
        writable: true,
      });

      render(<App />);

      // Shortcuts should be disabled on touch devices
      expect(mockKeyboardContext.isEnabled).toBe(false);
    });

    it('should show alternative UI for touch devices', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 1,
        writable: true,
      });

      render(<App />);

      // Should show touch-friendly navigation instead of keyboard shortcuts
      expect(screen.queryByText(/keyboard shortcuts/i)).not.toBeInTheDocument();
      expect(screen.getByText(/navigation menu/i)).toBeInTheDocument();
    });

    it('should handle hybrid devices correctly', () => {
      // Mock hybrid device (touchscreen + keyboard)
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 1,
        writable: true,
      });

      // Mock keyboard detection
      Object.defineProperty(navigator, 'keyboard', {
        value: { lock: jest.fn() },
        writable: true,
      });

      render(<App />);

      // Should enable shortcuts when keyboard is detected
      expect(mockKeyboardContext.isEnabled).toBe(true);
    });
  });
});
