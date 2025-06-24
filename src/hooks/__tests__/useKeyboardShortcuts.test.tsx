import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import { useKeyboardShortcuts, Shortcut, ShortcutConfig } from '../useKeyboardShortcuts';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper to create wrapper with router
const createWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('useKeyboardShortcuts', () => {
  let originalUserAgent: string;
  let originalPlatform: string;

  beforeEach(() => {
    jest.clearAllMocks();
    originalUserAgent = navigator.userAgent;
    originalPlatform = window.navigator.platform;

    // Mock addEventListener/removeEventListener
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, writable: true });
    Object.defineProperty(window.navigator, 'platform', {
      value: originalPlatform,
      writable: true,
    });
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const config: ShortcutConfig = { shortcuts: [] };
      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      expect(result.current.shortcuts).toHaveLength(7); // Default shortcuts
      expect(result.current.isHelpOpen).toBe(false);
      expect(result.current.keySequence).toEqual([]);
    });

    it('should add event listener on mount', () => {
      const config: ShortcutConfig = { shortcuts: [] };
      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should remove event listener on unmount', () => {
      const config: ShortcutConfig = { shortcuts: [] };
      const { unmount } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Platform detection', () => {
    it('should detect macOS correctly', () => {
      Object.defineProperty(window.navigator, 'platform', { value: 'MacIntel', writable: true });

      const config: ShortcutConfig = { shortcuts: [] };
      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      expect(result.current.isMac).toBe(true);
    });

    it('should detect non-macOS correctly', () => {
      Object.defineProperty(window.navigator, 'platform', { value: 'Win32', writable: true });

      const config: ShortcutConfig = { shortcuts: [] };
      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      expect(result.current.isMac).toBe(false);
    });
  });

  describe('Shortcut formatting', () => {
    it('should format shortcuts correctly on Windows', () => {
      Object.defineProperty(window.navigator, 'platform', { value: 'Win32', writable: true });

      const config: ShortcutConfig = { shortcuts: [] };
      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const shortcut: Shortcut = {
        key: 'k',
        ctrl: true,
        description: 'Test shortcut',
        action: jest.fn(),
      };

      const formatted = result.current.formatShortcut(shortcut);
      expect(formatted).toBe('Ctrl+K');
    });

    it('should format shortcuts correctly on macOS', () => {
      Object.defineProperty(window.navigator, 'platform', { value: 'MacIntel', writable: true });

      const config: ShortcutConfig = { shortcuts: [] };
      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const shortcut: Shortcut = {
        key: 'k',
        cmd: true,
        description: 'Test shortcut',
        action: jest.fn(),
      };

      const formatted = result.current.formatShortcut(shortcut);
      expect(formatted).toBe('⌘K');
    });

    it('should format complex shortcuts correctly', () => {
      const config: ShortcutConfig = { shortcuts: [] };
      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const shortcut: Shortcut = {
        key: 'k',
        ctrl: true,
        shift: true,
        alt: true,
        description: 'Complex shortcut',
        action: jest.fn(),
      };

      const formatted = result.current.formatShortcut(shortcut);
      expect(formatted).toContain('Ctrl');
      expect(formatted).toContain('Shift');
      expect(formatted).toContain('Alt');
      expect(formatted).toContain('K');
    });

    it('should format special keys correctly', () => {
      const config: ShortcutConfig = { shortcuts: [] };
      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const testCases = [
        { key: ' ', expected: 'SPACE' },
        { key: 'ArrowUp', expected: '↑' },
        { key: 'ArrowDown', expected: '↓' },
        { key: 'ArrowLeft', expected: '←' },
        { key: 'ArrowRight', expected: '→' },
      ];

      testCases.forEach(({ key, expected }) => {
        const shortcut: Shortcut = {
          key,
          description: 'Special key',
          action: jest.fn(),
        };

        const formatted = result.current.formatShortcut(shortcut);
        expect(formatted).toBe(expected);
      });
    });
  });

  describe('Custom shortcuts', () => {
    it('should merge custom shortcuts with default ones', () => {
      const customShortcut: Shortcut = {
        key: 'x',
        description: 'Custom shortcut',
        action: jest.fn(),
      };

      const config: ShortcutConfig = { shortcuts: [customShortcut] };
      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      expect(result.current.shortcuts).toHaveLength(8); // 7 default + 1 custom
      expect(result.current.shortcuts).toContainEqual(customShortcut);
    });

    it('should handle multiple custom shortcuts', () => {
      const customShortcuts: Shortcut[] = [
        { key: 'x', description: 'Custom 1', action: jest.fn() },
        { key: 'y', description: 'Custom 2', action: jest.fn() },
        { key: 'z', description: 'Custom 3', action: jest.fn() },
      ];

      const config: ShortcutConfig = { shortcuts: customShortcuts };
      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      expect(result.current.shortcuts).toHaveLength(10); // 7 default + 3 custom
    });
  });

  describe('Keyboard event handling', () => {
    it('should ignore events from input elements', () => {
      const onFocusSearch = jest.fn();
      const config: ShortcutConfig = { shortcuts: [], onFocusSearch };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      // Create mock input element
      const mockInput = document.createElement('input');
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      Object.defineProperty(event, 'target', { value: mockInput });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(onFocusSearch).not.toHaveBeenCalled();
    });

    it('should ignore events from textarea elements', () => {
      const onFocusSearch = jest.fn();
      const config: ShortcutConfig = { shortcuts: [], onFocusSearch };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      // Create mock textarea element
      const mockTextarea = document.createElement('textarea');
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      Object.defineProperty(event, 'target', { value: mockTextarea });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(onFocusSearch).not.toHaveBeenCalled();
    });

    it('should ignore events from contentEditable elements', () => {
      const onFocusSearch = jest.fn();
      const config: ShortcutConfig = { shortcuts: [], onFocusSearch };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      // Create mock contentEditable element
      const mockDiv = document.createElement('div');
      mockDiv.contentEditable = 'true';
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      Object.defineProperty(event, 'target', { value: mockDiv });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(onFocusSearch).not.toHaveBeenCalled();
    });
  });

  describe('Help shortcut', () => {
    it('should show help when ? is pressed', () => {
      const onShowHelp = jest.fn();
      const config: ShortcutConfig = { shortcuts: [], onShowHelp };

      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: '?' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(result.current.isHelpOpen).toBe(true);
      expect(onShowHelp).toHaveBeenCalled();
    });

    it('should not show help when ? is pressed with modifiers', () => {
      const onShowHelp = jest.fn();
      const config: ShortcutConfig = { shortcuts: [], onShowHelp };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: '?', ctrlKey: true });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(onShowHelp).not.toHaveBeenCalled();
    });
  });

  describe('Key sequences', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should handle "g h" sequence to navigate home', () => {
      const config: ShortcutConfig = { shortcuts: [] };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      // Press 'g'
      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(gEvent);
      });

      // Press 'h'
      const hEvent = new KeyboardEvent('keydown', { key: 'h' });
      Object.defineProperty(hEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(hEvent);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle "g d" sequence to navigate to docs', () => {
      const config: ShortcutConfig = { shortcuts: [] };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      // Press 'g'
      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(gEvent);
      });

      // Press 'd'
      const dEvent = new KeyboardEvent('keydown', { key: 'd' });
      Object.defineProperty(dEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(dEvent);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/docs');
    });

    it('should handle "g e" sequence to navigate to engine', () => {
      const config: ShortcutConfig = { shortcuts: [] };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      // Press 'g'
      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(gEvent);
      });

      // Press 'e'
      const eEvent = new KeyboardEvent('keydown', { key: 'e' });
      Object.defineProperty(eEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(eEvent);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/engine');
    });

    it('should reset sequence after timeout', () => {
      const config: ShortcutConfig = { shortcuts: [] };

      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      // Press 'g'
      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(gEvent);
      });

      expect(result.current.keySequence).toEqual(['g']);

      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.keySequence).toEqual([]);
    });

    it('should not start sequence with g when modifiers are pressed', () => {
      const config: ShortcutConfig = { shortcuts: [] };

      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      // Press 'g' with Ctrl
      const gEvent = new KeyboardEvent('keydown', { key: 'g', ctrlKey: true });

      act(() => {
        window.dispatchEvent(gEvent);
      });

      expect(result.current.keySequence).toEqual([]);
    });
  });

  describe('Default shortcuts execution', () => {
    it('should call onFocusSearch for Ctrl+K (Windows)', () => {
      Object.defineProperty(window.navigator, 'platform', { value: 'Win32', writable: true });

      const onFocusSearch = jest.fn();
      const config: ShortcutConfig = { shortcuts: [], onFocusSearch };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(onFocusSearch).toHaveBeenCalled();
    });

    it('should call onFocusSearch for Cmd+K (macOS)', () => {
      Object.defineProperty(window.navigator, 'platform', { value: 'MacIntel', writable: true });

      const onFocusSearch = jest.fn();
      const config: ShortcutConfig = { shortcuts: [], onFocusSearch };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(onFocusSearch).toHaveBeenCalled();
    });

    it('should call onFocusSearch for / key', () => {
      const onFocusSearch = jest.fn();
      const config: ShortcutConfig = { shortcuts: [], onFocusSearch };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: '/' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(onFocusSearch).toHaveBeenCalled();
    });

    it('should call onToggleSidebar for Ctrl+B', () => {
      const onToggleSidebar = jest.fn();
      const config: ShortcutConfig = { shortcuts: [], onToggleSidebar };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: 'b', ctrlKey: true });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(onToggleSidebar).toHaveBeenCalled();
    });

    it('should call onNavigateUp for j key', () => {
      const onNavigateUp = jest.fn();
      const config: ShortcutConfig = { shortcuts: [], onNavigateUp };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: 'k' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(onNavigateUp).toHaveBeenCalled();
    });

    it('should call onNavigateDown for k key', () => {
      const onNavigateDown = jest.fn();
      const config: ShortcutConfig = { shortcuts: [], onNavigateDown };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: 'j' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(onNavigateDown).toHaveBeenCalled();
    });
  });

  describe('Custom shortcut execution', () => {
    it('should execute custom shortcut action', () => {
      const customAction = jest.fn();
      const customShortcut: Shortcut = {
        key: 'x',
        description: 'Custom shortcut',
        action: customAction,
      };

      const config: ShortcutConfig = { shortcuts: [customShortcut] };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: 'x' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(customAction).toHaveBeenCalled();
    });

    it('should execute custom shortcut with modifiers', () => {
      const customAction = jest.fn();
      const customShortcut: Shortcut = {
        key: 'x',
        ctrl: true,
        shift: true,
        description: 'Custom shortcut with modifiers',
        action: customAction,
      };

      const config: ShortcutConfig = { shortcuts: [customShortcut] };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true, shiftKey: true });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(event);
      });

      expect(customAction).toHaveBeenCalled();
    });

    it('should not execute custom shortcut when modifiers do not match', () => {
      const customAction = jest.fn();
      const customShortcut: Shortcut = {
        key: 'x',
        ctrl: true,
        description: 'Custom shortcut requiring Ctrl',
        action: customAction,
      };

      const config: ShortcutConfig = { shortcuts: [customShortcut] };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: 'x' }); // No Ctrl

      act(() => {
        window.dispatchEvent(event);
      });

      expect(customAction).not.toHaveBeenCalled();
    });
  });

  describe('State management', () => {
    it('should update isHelpOpen state', () => {
      const config: ShortcutConfig = { shortcuts: [] };

      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      expect(result.current.isHelpOpen).toBe(false);

      act(() => {
        result.current.setIsHelpOpen(true);
      });

      expect(result.current.isHelpOpen).toBe(true);
    });

    it('should track key sequence state', () => {
      const config: ShortcutConfig = { shortcuts: [] };

      const { result } = renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      expect(result.current.keySequence).toEqual([]);

      // Press 'g' to start sequence
      const gEvent = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(gEvent, 'preventDefault', { value: jest.fn() });

      act(() => {
        window.dispatchEvent(gEvent);
      });

      expect(result.current.keySequence).toEqual(['g']);
    });
  });

  describe('Error handling', () => {
    it('should handle shortcut action errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const throwingAction = jest.fn(() => {
        throw new Error('Shortcut action error');
      });

      const customShortcut: Shortcut = {
        key: 'x',
        description: 'Throwing shortcut',
        action: throwingAction,
      };

      const config: ShortcutConfig = { shortcuts: [customShortcut] };

      renderHook(() => useKeyboardShortcuts(config), {
        wrapper: createWrapper,
      });

      const event = new KeyboardEvent('keydown', { key: 'x' });
      Object.defineProperty(event, 'preventDefault', { value: jest.fn() });

      expect(() => {
        act(() => {
          window.dispatchEvent(event);
        });
      }).not.toThrow();

      consoleErrorSpy.mockRestore();
    });
  });
});
