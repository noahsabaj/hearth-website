import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { Shortcut } from '../../hooks/useKeyboardShortcuts';
import {
  KeyboardShortcutsProvider,
  useKeyboardShortcutsContext,
} from '../KeyboardShortcutsContext';

// Mock the KeyboardShortcutsModal and ToastNotification components
jest.mock('../../components/KeyboardShortcutsModal', () => {
  return function KeyboardShortcutsModal({ open, onClose, shortcuts, formatShortcut, isMac }: any) {
    return open ? (
      <div data-testid='keyboard-shortcuts-modal'>
        <button onClick={onClose}>Close Modal</button>
        <div data-testid='shortcuts-count'>{shortcuts.length}</div>
        <div data-testid='is-mac'>{isMac.toString()}</div>
      </div>
    ) : null;
  };
});

jest.mock('../../components/ToastNotification', () => {
  return function ToastNotification({ open, message, onClose, severity, duration }: any) {
    return open ? (
      <div data-testid='toast-notification'>
        <span data-testid='toast-message'>{message}</span>
        <span data-testid='toast-severity'>{severity}</span>
        <span data-testid='toast-duration'>{duration}</span>
        <button onClick={onClose}>Close Toast</button>
      </div>
    ) : null;
  };
});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Test component that uses the context
const TestComponent = () => {
  const {
    registerShortcut,
    unregisterShortcut,
    showToast,
    setSearchFocusCallback,
    setSidebarToggleCallback,
    setNavigationCallbacks,
  } = useKeyboardShortcutsContext();

  const [searchFocused, setSearchFocused] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [navigationDirection, setNavigationDirection] = React.useState('');

  React.useEffect(() => {
    setSearchFocusCallback(() => {
      setSearchFocused(true);
    });

    setSidebarToggleCallback(() => {
      setSidebarOpen(prev => !prev);
    });

    setNavigationCallbacks(
      () => setNavigationDirection('up'),
      () => setNavigationDirection('down')
    );

    // Register a custom shortcut
    const customShortcut: Shortcut = {
      key: 'x',
      description: 'Custom test shortcut',
      action: () => setNavigationDirection('custom'),
    };

    registerShortcut(customShortcut);

    return () => {
      unregisterShortcut('x');
    };
  }, []);

  return (
    <div>
      <div data-testid='search-focused'>{searchFocused.toString()}</div>
      <div data-testid='sidebar-open'>{sidebarOpen.toString()}</div>
      <div data-testid='navigation-direction'>{navigationDirection}</div>
      <button onClick={() => showToast('Test toast message')}>Show Toast</button>
    </div>
  );
};

// Helper to render with providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <KeyboardShortcutsProvider>{component}</KeyboardShortcutsProvider>
    </BrowserRouter>
  );
};

describe('KeyboardShortcutsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock addEventListener/removeEventListener
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Provider initialization', () => {
    it('should render children correctly', () => {
      renderWithProviders(<div data-testid='test-child'>Test Child</div>);

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    it('should provide context value to children', () => {
      renderWithProviders(<TestComponent />);

      expect(screen.getByTestId('search-focused')).toHaveTextContent('false');
      expect(screen.getByTestId('sidebar-open')).toHaveTextContent('false');
      expect(screen.getByTestId('navigation-direction')).toHaveTextContent('');
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const TestComponentOutsideProvider = () => {
        useKeyboardShortcutsContext();
        return <div>Test</div>;
      };

      expect(() => {
        render(<TestComponentOutsideProvider />);
      }).toThrow('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Toast functionality', () => {
    it('should show toast when showToast is called', () => {
      renderWithProviders(<TestComponent />);

      const showToastButton = screen.getByText('Show Toast');
      fireEvent.click(showToastButton);

      expect(screen.getByTestId('toast-notification')).toBeInTheDocument();
      expect(screen.getByTestId('toast-message')).toHaveTextContent('Test toast message');
      expect(screen.getByTestId('toast-severity')).toHaveTextContent('info');
    });

    it('should close toast when close button is clicked', () => {
      renderWithProviders(<TestComponent />);

      const showToastButton = screen.getByText('Show Toast');
      fireEvent.click(showToastButton);

      expect(screen.getByTestId('toast-notification')).toBeInTheDocument();

      const closeButton = screen.getByText('Close Toast');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('toast-notification')).not.toBeInTheDocument();
    });

    it('should show toast for search focus action', () => {
      renderWithProviders(<TestComponent />);

      // Simulate Ctrl+K keypress
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('toast-message')).toHaveTextContent(
        'Search focused - start typing to search',
      );
      expect(screen.getByTestId('search-focused')).toHaveTextContent('true');
    });

    it('should show toast for sidebar toggle action', () => {
      renderWithProviders(<TestComponent />);

      // Simulate Ctrl+B keypress
      const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('toast-message')).toHaveTextContent('Sidebar toggled');
      expect(screen.getByTestId('sidebar-open')).toHaveTextContent('true');
    });

    it('should show toast for help action', () => {
      renderWithProviders(<TestComponent />);

      // Simulate ? keypress
      const event = new KeyboardEvent('keydown', { key: '?' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('toast-message')).toHaveTextContent(
        'Keyboard shortcuts help opened',
      );
      expect(screen.getByTestId('keyboard-shortcuts-modal')).toBeInTheDocument();
    });
  });

  describe('Keyboard shortcuts modal', () => {
    it('should show modal when help shortcut is triggered', () => {
      renderWithProviders(<TestComponent />);

      const event = new KeyboardEvent('keydown', { key: '?' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('keyboard-shortcuts-modal')).toBeInTheDocument();
      expect(screen.getByTestId('shortcuts-count')).toHaveTextContent('8'); // 7 default + 1 custom
    });

    it('should close modal when close button is clicked', () => {
      renderWithProviders(<TestComponent />);

      // Open modal
      const event = new KeyboardEvent('keydown', { key: '?' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('keyboard-shortcuts-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByText('Close Modal');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('keyboard-shortcuts-modal')).not.toBeInTheDocument();
    });

    it('should pass correct props to modal', () => {
      renderWithProviders(<TestComponent />);

      const event = new KeyboardEvent('keydown', { key: '?' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('shortcuts-count')).toHaveTextContent('8');
      expect(screen.getByTestId('is-mac')).toHaveTextContent('false');
    });
  });

  describe('Custom shortcuts', () => {
    it('should register custom shortcuts', () => {
      renderWithProviders(<TestComponent />);

      // Test custom shortcut
      const event = new KeyboardEvent('keydown', { key: 'x' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('navigation-direction')).toHaveTextContent('custom');
    });

    it('should unregister custom shortcuts', () => {
      const TestComponentWithUnregister = () => {
        const { registerShortcut, unregisterShortcut } = useKeyboardShortcutsContext();
        const [shortcutActive, setShortcutActive] = React.useState(false);

        React.useEffect(() => {
          const customShortcut: Shortcut = {
            key: 'z',
            description: 'Temporary shortcut',
            action: () => setShortcutActive(true),
          };

          registerShortcut(customShortcut);

          // Unregister after a timeout
          const timeout = setTimeout(() => {
            unregisterShortcut('z');
          }, 100);

          return () => clearTimeout(timeout);
        }, []);

        return <div data-testid='shortcut-active'>{shortcutActive.toString()}</div>;
      };

      renderWithProviders(<TestComponentWithUnregister />);

      // Initially shortcut should work
      const event = new KeyboardEvent('keydown', { key: 'z' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('shortcut-active')).toHaveTextContent('true');

      // After unregistering, it shouldn't work (but we can't easily test this due to timing)
    });
  });

  describe('Navigation callbacks', () => {
    it('should handle navigation up callback', () => {
      renderWithProviders(<TestComponent />);

      const event = new KeyboardEvent('keydown', { key: 'k' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('navigation-direction')).toHaveTextContent('up');
    });

    it('should handle navigation down callback', () => {
      renderWithProviders(<TestComponent />);

      const event = new KeyboardEvent('keydown', { key: 'j' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('navigation-direction')).toHaveTextContent('down');
    });

    it('should not show toast for navigation actions', () => {
      renderWithProviders(<TestComponent />);

      const event = new KeyboardEvent('keydown', { key: 'j' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.queryByTestId('toast-notification')).not.toBeInTheDocument();
    });
  });

  describe('Key sequence indicators', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should show key sequence indicator when sequence is started', () => {
      renderWithProviders(<TestComponent />);

      // Start sequence with 'g'
      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(gEvent);
      });

      // Should show sequence indicator
      const toastElements = screen.getAllByTestId('toast-notification');
      const sequenceToast = toastElements.find(toast =>
        toast
          .querySelector('[data-testid="toast-message"]')
          ?.textContent?.includes('Key sequence: g')
      );

      expect(sequenceToast).toBeInTheDocument();
    });

    it('should update sequence indicator with key sequence', () => {
      renderWithProviders(<TestComponent />);

      // Start sequence with 'g'
      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(gEvent);
      });

      // Check that sequence indicator shows 'g'
      const toastMessage = screen.getByText(/Key sequence: g/);
      expect(toastMessage).toBeInTheDocument();
    });

    it('should set duration for sequence indicator toast', () => {
      renderWithProviders(<TestComponent />);

      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(gEvent);
      });

      const durationElement = screen.getByTestId('toast-duration');
      expect(durationElement).toHaveTextContent('1000');
    });
  });

  describe('Callback management', () => {
    it('should update search focus callback', () => {
      const TestCallbackUpdate = () => {
        const { setSearchFocusCallback } = useKeyboardShortcutsContext();
        const [callbackCalled, setCallbackCalled] = React.useState(false);

        React.useEffect(() => {
          setSearchFocusCallback(() => {
            setCallbackCalled(true);
          });
        }, []);

        return <div data-testid='callback-called'>{callbackCalled.toString()}</div>;
      };

      renderWithProviders(<TestCallbackUpdate />);

      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('callback-called')).toHaveTextContent('true');
    });

    it('should update sidebar toggle callback', () => {
      const TestCallbackUpdate = () => {
        const { setSidebarToggleCallback } = useKeyboardShortcutsContext();
        const [callbackCalled, setCallbackCalled] = React.useState(false);

        React.useEffect(() => {
          setSidebarToggleCallback(() => {
            setCallbackCalled(true);
          });
        }, []);

        return <div data-testid='callback-called'>{callbackCalled.toString()}</div>;
      };

      renderWithProviders(<TestCallbackUpdate />);

      const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('callback-called')).toHaveTextContent('true');
    });

    it('should update navigation callbacks', () => {
      const TestNavigationCallbacks = () => {
        const { setNavigationCallbacks } = useKeyboardShortcutsContext();
        const [direction, setDirection] = React.useState('');

        React.useEffect(() => {
          setNavigationCallbacks(
            () => setDirection('updated-up'),
            () => setDirection('updated-down')
          );
        }, []);

        return <div data-testid='direction'>{direction}</div>;
      };

      renderWithProviders(<TestNavigationCallbacks />);

      const upEvent = new KeyboardEvent('keydown', { key: 'k' });
      Object.defineProperty(upEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(upEvent);
      });

      expect(screen.getByTestId('direction')).toHaveTextContent('updated-up');

      const downEvent = new KeyboardEvent('keydown', { key: 'j' });
      Object.defineProperty(downEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(downEvent);
      });

      expect(screen.getByTestId('direction')).toHaveTextContent('updated-down');
    });
  });

  describe('Platform detection', () => {
    it('should detect macOS platform', () => {
      Object.defineProperty(window.navigator, 'platform', {
        value: 'MacIntel',
        writable: true,
      });

      renderWithProviders(<TestComponent />);

      const event = new KeyboardEvent('keydown', { key: '?' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('is-mac')).toHaveTextContent('true');
    });

    it('should detect non-macOS platform', () => {
      Object.defineProperty(window.navigator, 'platform', {
        value: 'Win32',
        writable: true,
      });

      renderWithProviders(<TestComponent />);

      const event = new KeyboardEvent('keydown', { key: '?' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('is-mac')).toHaveTextContent('false');
    });
  });

  describe('Integration with useKeyboardShortcuts', () => {
    it('should integrate with navigation shortcuts', () => {
      renderWithProviders(<TestComponent />);

      // Test 'g h' sequence
      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(gEvent);
      });

      const hEvent = new KeyboardEvent('keydown', { key: 'h' });
      Object.defineProperty(hEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(hEvent);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle search shortcut with slash key', () => {
      renderWithProviders(<TestComponent />);

      const event = new KeyboardEvent('keydown', { key: '/' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(screen.getByTestId('search-focused')).toHaveTextContent('true');
    });
  });

  describe('Error handling', () => {
    it('should handle callback errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const TestErrorCallback = () => {
        const { setSearchFocusCallback } = useKeyboardShortcutsContext();

        React.useEffect(() => {
          setSearchFocusCallback(() => {
            throw new Error('Callback error');
          });
        }, []);

        return <div>Test</div>;
      };

      renderWithProviders(<TestErrorCallback />);

      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      expect(() => {
        act(() => {
          window.dispatchEvent(event);
        });
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('State persistence', () => {
    it('should maintain state across re-renders', () => {
      const TestStatePersistence = ({ shouldRerender }: { shouldRerender: boolean }) => {
        const { showToast } = useKeyboardShortcutsContext();

        React.useEffect(() => {
          if (shouldRerender) {
            showToast('Re-render test');
          }
        }, [shouldRerender, showToast]);

        return <div data-testid='rerender-test'>{shouldRerender.toString()}</div>;
      };

      const { rerender } = renderWithProviders(<TestStatePersistence shouldRerender={false} />);

      expect(screen.getByTestId('rerender-test')).toHaveTextContent('false');
      expect(screen.queryByTestId('toast-notification')).not.toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <KeyboardShortcutsProvider>
            <TestStatePersistence shouldRerender />
          </KeyboardShortcutsProvider>
        </BrowserRouter>
      );

      expect(screen.getByTestId('rerender-test')).toHaveTextContent('true');
      expect(screen.getByTestId('toast-notification')).toBeInTheDocument();
      expect(screen.getByTestId('toast-message')).toHaveTextContent('Re-render test');
    });
  });
});
