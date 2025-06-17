import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  category?: string;
}

export interface ShortcutConfig {
  shortcuts: Shortcut[];
  onShowHelp?: () => void;
  onToggleSidebar?: () => void;
  onFocusSearch?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
}

// Detect if user is on macOS
const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

export const useKeyboardShortcuts = (config: ShortcutConfig) => {
  const navigate = useNavigate();
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Format shortcut for display
  const formatShortcut = useCallback((shortcut: Shortcut): string => {
    const parts: string[] = [];
    
    if (shortcut.ctrl && !isMac) parts.push('Ctrl');
    if (shortcut.cmd && isMac) parts.push('⌘');
    if (shortcut.ctrl && isMac) parts.push('⌃');
    if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
    if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
    
    // Format the key
    let key = shortcut.key;
    if (key === ' ') key = 'Space';
    if (key === 'ArrowUp') key = '↑';
    if (key === 'ArrowDown') key = '↓';
    if (key === 'ArrowLeft') key = '←';
    if (key === 'ArrowRight') key = '→';
    
    parts.push(key.toUpperCase());
    
    return parts.join(isMac ? '' : '+');
  }, []);

  // Default shortcuts
  const defaultShortcuts: Shortcut[] = [
    {
      key: 'k',
      ctrl: !isMac,
      cmd: isMac,
      description: 'Focus search',
      category: 'Navigation',
      action: () => config.onFocusSearch?.(),
    },
    {
      key: '/',
      description: 'Focus search',
      category: 'Navigation',
      action: () => config.onFocusSearch?.(),
    },
    {
      key: 'b',
      ctrl: !isMac,
      cmd: isMac,
      description: 'Toggle sidebar',
      category: 'Navigation',
      action: () => config.onToggleSidebar?.(),
    },
    {
      key: 'j',
      description: 'Navigate down',
      category: 'Navigation',
      action: () => config.onNavigateDown?.(),
    },
    {
      key: 'k',
      description: 'Navigate up',
      category: 'Navigation',
      action: () => config.onNavigateUp?.(),
    },
    {
      key: 'g',
      description: 'Go to... (press G then H/D)',
      category: 'Navigation',
      action: () => {}, // This is handled in the sequence logic
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      category: 'Help',
      action: () => {
        setIsHelpOpen(true);
        config.onShowHelp?.();
      },
    },
  ];

  // Merge default shortcuts with custom ones
  const allShortcuts = [...defaultShortcuts, ...config.shortcuts];

  // Track key sequences (for shortcuts like 'g h')
  const [keySequence, setKeySequence] = useState<string[]>([]);
  const [sequenceTimeout, setSequenceTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    // Check for help shortcut (?)
    if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      setIsHelpOpen(true);
      config.onShowHelp?.();
      return;
    }

    // Handle key sequences (g h, g d)
    if (keySequence.length > 0) {
      const newSequence = [...keySequence, event.key.toLowerCase()];
      
      // Clear previous timeout
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }

      // Check for matching sequences
      if (newSequence.join(' ') === 'g h') {
        event.preventDefault();
        navigate('/');
        setKeySequence([]);
        return;
      } else if (newSequence.join(' ') === 'g d') {
        event.preventDefault();
        navigate('/docs');
        setKeySequence([]);
        return;
      }

      // Reset sequence after timeout
      const timeout = setTimeout(() => {
        setKeySequence([]);
      }, 1000);
      setSequenceTimeout(timeout);
    }

    // Start a new sequence with 'g'
    if (event.key.toLowerCase() === 'g' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      event.preventDefault();
      setKeySequence(['g']);
      
      // Clear sequence after 1 second
      const timeout = setTimeout(() => {
        setKeySequence([]);
      }, 1000);
      setSequenceTimeout(timeout);
      return;
    }

    // Check all shortcuts
    for (const shortcut of allShortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const shiftMatch = !shortcut.shift || event.shiftKey;
      const altMatch = !shortcut.alt || event.altKey;

      // Special handling for platform-specific modifiers
      const modifierMatch = isMac
        ? (!shortcut.cmd || event.metaKey) && (!shortcut.ctrl || event.ctrlKey)
        : (!shortcut.ctrl || event.ctrlKey) && !event.metaKey;

      if (keyMatch && modifierMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [keySequence, sequenceTimeout, allShortcuts, navigate, config]);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }
    };
  }, [handleKeyDown, sequenceTimeout]);

  return {
    shortcuts: allShortcuts,
    formatShortcut,
    isHelpOpen,
    setIsHelpOpen,
    keySequence,
    isMac,
  };
};