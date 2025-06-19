import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal';
import ToastNotification from '../components/ToastNotification';
import { useKeyboardShortcuts, Shortcut } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsContextType {
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (key: string) => void;
  showToast: (message: string) => void;
  setSearchFocusCallback: (callback: () => void) => void;
  setSidebarToggleCallback: (callback: () => void) => void;
  setNavigationCallbacks: (up: () => void, down: () => void) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | null>(null);

export const useKeyboardShortcutsContext = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');
  }
  return context;
};

interface KeyboardShortcutsProviderProps {
  children: ReactNode;
}

export const KeyboardShortcutsProvider: React.FC<KeyboardShortcutsProviderProps> = ({
  children,
}) => {
  const [customShortcuts, setCustomShortcuts] = useState<Shortcut[]>([]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Callbacks for various actions
  const [searchFocusCallback, setSearchFocusCallback] = useState<() => void>(() => () => {});
  const [sidebarToggleCallback, setSidebarToggleCallback] = useState<() => void>(() => () => {});
  const [navigationUpCallback, setNavigationUpCallback] = useState<() => void>(() => () => {});
  const [navigationDownCallback, setNavigationDownCallback] = useState<() => void>(() => () => {});

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastOpen(true);
  }, []);

  const handleCloseToast = useCallback(() => {
    setToastOpen(false);
  }, []);

  const handleShowHelp = useCallback(() => {
    showToast('Keyboard shortcuts help opened');
  }, [showToast]);

  const handleFocusSearch = useCallback(() => {
    searchFocusCallback();
    showToast('Search focused - start typing to search');
  }, [searchFocusCallback, showToast]);

  const handleToggleSidebar = useCallback(() => {
    sidebarToggleCallback();
    showToast('Sidebar toggled');
  }, [sidebarToggleCallback, showToast]);

  const handleNavigateUp = useCallback(() => {
    navigationUpCallback();
  }, [navigationUpCallback]);

  const handleNavigateDown = useCallback(() => {
    navigationDownCallback();
  }, [navigationDownCallback]);

  const { shortcuts, formatShortcut, isHelpOpen, setIsHelpOpen, keySequence, isMac } =
    useKeyboardShortcuts({
      shortcuts: customShortcuts,
      onShowHelp: handleShowHelp,
      onFocusSearch: handleFocusSearch,
      onToggleSidebar: handleToggleSidebar,
      onNavigateUp: handleNavigateUp,
      onNavigateDown: handleNavigateDown,
    });

  const registerShortcut = useCallback((shortcut: Shortcut) => {
    setCustomShortcuts(prev => [...prev, shortcut]);
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setCustomShortcuts(prev => prev.filter(s => s.key !== key));
  }, []);

  const setNavigationCallbacks = useCallback((up: () => void, down: () => void) => {
    setNavigationUpCallback(() => up);
    setNavigationDownCallback(() => down);
  }, []);

  const contextValue: KeyboardShortcutsContextType = {
    registerShortcut,
    unregisterShortcut,
    showToast,
    setSearchFocusCallback: callback => setSearchFocusCallback(() => callback),
    setSidebarToggleCallback: callback => setSidebarToggleCallback(() => callback),
    setNavigationCallbacks,
  };

  return (
    <KeyboardShortcutsContext.Provider value={contextValue}>
      {children}

      <KeyboardShortcutsModal
        open={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        shortcuts={shortcuts}
        formatShortcut={formatShortcut}
        isMac={isMac}
      />

      <ToastNotification
        open={toastOpen}
        message={toastMessage}
        onClose={handleCloseToast}
        severity='info'
      />

      {/* Show key sequence indicator */}
      {keySequence.length > 0 && (
        <ToastNotification
          open
          message={`Key sequence: ${keySequence.join(' ')} ...`}
          onClose={() => {}}
          severity='info'
          duration={1000}
        />
      )}
    </KeyboardShortcutsContext.Provider>
  );
};
