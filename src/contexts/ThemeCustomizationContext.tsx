
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UITheme, ThemeCustomization } from '../types';

interface ThemeCustomizationContextType {
  uiTheme: UITheme;
  customization: ThemeCustomization;
  setUITheme: (theme: UITheme) => void;
  updateCustomization: (updates: Partial<ThemeCustomization>) => void;
  toggleHighContrast: () => void;
  themeClass: string;
}

const DEFAULT_CUSTOMIZATION: ThemeCustomization = {
  primaryColor: '#0071e3',
  secondaryColor: '#f5f5f7',
  textColor: '#1d1d1f',
  backgroundColor: '#ffffff',
  accentColor: '#06c',
  fontFamily: 'system-ui, sans-serif',
  borderRadius: '0.5rem',
  highContrast: false
};

const ThemeCustomizationContext = createContext<ThemeCustomizationContextType | undefined>(undefined);

export const ThemeCustomizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiTheme, setUITheme] = useState<UITheme>('neo-brutalist');
  const [customization, setCustomization] = useState<ThemeCustomization>(DEFAULT_CUSTOMIZATION);
  
  // Load theme settings from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('uiTheme');
    if (savedTheme) {
      setUITheme(savedTheme as UITheme);
    }
    
    const savedCustomization = localStorage.getItem('themeCustomization');
    if (savedCustomization) {
      setCustomization(JSON.parse(savedCustomization));
    }
  }, []);
  
  // Save theme settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('uiTheme', uiTheme);
    localStorage.setItem('themeCustomization', JSON.stringify(customization));
    
    // Apply custom CSS variables
    if (uiTheme === 'custom') {
      document.documentElement.style.setProperty('--primary-color', customization.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', customization.secondaryColor);
      document.documentElement.style.setProperty('--text-color', customization.textColor);
      document.documentElement.style.setProperty('--background-color', customization.backgroundColor);
      document.documentElement.style.setProperty('--accent-color', customization.accentColor);
      document.documentElement.style.setProperty('--border-radius', customization.borderRadius);
      document.documentElement.style.setProperty('--font-family', customization.fontFamily);
    } else {
      // Reset custom CSS variables
      document.documentElement.style.removeProperty('--primary-color');
      document.documentElement.style.removeProperty('--secondary-color');
      document.documentElement.style.removeProperty('--text-color');
      document.documentElement.style.removeProperty('--background-color');
      document.documentElement.style.removeProperty('--accent-color');
      document.documentElement.style.removeProperty('--border-radius');
      document.documentElement.style.removeProperty('--font-family');
    }
  }, [uiTheme, customization]);
  
  const updateCustomization = (updates: Partial<ThemeCustomization>) => {
    setCustomization(prev => ({ ...prev, ...updates }));
  };
  
  const toggleHighContrast = () => {
    setCustomization(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };
  
  // Determine the class to apply to the root element
  const themeClass = `theme-${uiTheme} ${customization.highContrast ? 'high-contrast' : ''}`;
  
  return (
    <ThemeCustomizationContext.Provider 
      value={{ 
        uiTheme, 
        customization, 
        setUITheme, 
        updateCustomization, 
        toggleHighContrast,
        themeClass
      }}
    >
      {children}
    </ThemeCustomizationContext.Provider>
  );
};

export const useThemeCustomization = () => {
  const context = useContext(ThemeCustomizationContext);
  if (context === undefined) {
    throw new Error('useThemeCustomization must be used within a ThemeCustomizationProvider');
  }
  return context;
};
