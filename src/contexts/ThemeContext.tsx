import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  highContrastMode: boolean;
  toggleHighContrastMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [highContrastMode, setHighContrastMode] = useState(() => {
    // Check localStorage on initial load
    const stored = localStorage.getItem('highContrastMode');
    return stored === 'true';
  });

  useEffect(() => {
    // Save to localStorage whenever it changes
    localStorage.setItem('highContrastMode', highContrastMode.toString());

    // Apply high contrast class to root element
    if (highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrastMode]);

  const toggleHighContrastMode = () => {
    setHighContrastMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ highContrastMode, toggleHighContrastMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
