/**
 * Design System Theme
 * Based on Mobile App Style Guide - Ninja Track
 * Monochrome-first design with polymath focus
 */

import React, { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    secondaryBackground: string;
    surface: string;
    border: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  typography: {
    h1: TextStyle;
    h2: TextStyle;
    h3: TextStyle;
    h4: TextStyle;
    bodyLarge: TextStyle;
    bodyBase: TextStyle;
    bodySmall: TextStyle;
    caption: TextStyle;
    button: TextStyle;
    label: TextStyle;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    container: number;
    section: number;
    component: number;
    element: number;
  };
  layout: {
    borderRadius: {
      small: number;
      medium: number;
      large: number;
    };
    touchTarget: {
      minimum: number;
      recommended: number;
    };
    safeArea: {
      sides: number;
    };
  };
  shadows: {
    subtle: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

interface TextStyle {
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700' | 'normal' | 'medium' | 'semibold' | 'bold';
  lineHeight: number;
  letterSpacing?: number;
}

// Light Mode Theme
export const lightTheme: Theme = {
  colors: {
    primary: '#0f172a',      // Slate 900
    secondary: '#64748b',    // Slate 500
    accent: '#2563eb',       // Blue 600
    background: '#ffffff',   // White
    secondaryBackground: '#e2e8f0', // Slate 200
    surface: '#ffffff',      // White (for cards, modals)
    border: '#e2e8f0',       // Slate 200
    text: {
      primary: '#0f172a',    // Slate 900
      secondary: '#334155',  // Slate 700
      muted: '#64748b',      // Slate 500
    },
    semantic: {
      success: '#059669',    // Emerald 600
      warning: '#d97706',    // Amber 600
      error: '#dc2626',      // Red 600
      info: '#2563eb',       // Blue 600
    },
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 38,
      letterSpacing: -0.02,
    },
    h2: {
      fontSize: 28,
      fontWeight: 'bold', 
      lineHeight: 34,
      letterSpacing: -0.02,
    },
    h3: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 29,
    },
    h4: {
      fontSize: 20,
      fontWeight: 'semibold',
      lineHeight: 24,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: 'normal',
      lineHeight: 22,
      letterSpacing: 0.02,
    },
    bodyBase: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 20,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 17,
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal',
      lineHeight: 14,
    },
    button: {
      fontSize: 16,
      fontWeight: 'medium',
      lineHeight: 19,
    },
    label: {
      fontSize: 14,
      fontWeight: 'medium',
      lineHeight: 17,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    container: 16,        // Container padding (sides)
    section: 24,          // Section spacing (vertical)
    component: 16,        // Component spacing (vertical)  
    element: 8,           // Element spacing (within components)
  },
  layout: {
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12,
    },
    touchTarget: {
      minimum: 44,
      recommended: 48,
    },
    safeArea: {
      sides: 16,
    },
  },
  shadows: {
    subtle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
  },
};

// Dark Mode Theme
export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    primary: '#f8fafc',      // Slate 50
    secondary: '#94a3b8',    // Slate 400
    accent: '#3b82f6',       // Blue 500
    background: '#0f172a',   // Slate 900
    secondaryBackground: '#1e293b', // Slate 800
    surface: '#1e293b',      // Slate 800 (for cards, modals)
    border: '#334155',       // Slate 700
    text: {
      primary: '#f8fafc',    // Slate 50
      secondary: '#cbd5e1',  // Slate 300
      muted: '#94a3b8',      // Slate 400
    },
    semantic: {
      success: '#10b981',    // Emerald 500
      warning: '#f59e0b',    // Amber 500
      error: '#ef4444',      // Red 500
      info: '#3b82f6',       // Blue 500
    },
  },
};

// Theme context for React components
interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <ThemeContext.Provider value={{ theme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility functions for creating consistent styles
export const createSpacing = (theme: Theme) => ({
  margin: (size: keyof Theme['spacing']) => ({ margin: theme.spacing[size] }),
  marginVertical: (size: keyof Theme['spacing']) => ({ marginVertical: theme.spacing[size] }),
  marginHorizontal: (size: keyof Theme['spacing']) => ({ marginHorizontal: theme.spacing[size] }),
  marginTop: (size: keyof Theme['spacing']) => ({ marginTop: theme.spacing[size] }),
  marginBottom: (size: keyof Theme['spacing']) => ({ marginBottom: theme.spacing[size] }),
  marginLeft: (size: keyof Theme['spacing']) => ({ marginLeft: theme.spacing[size] }),
  marginRight: (size: keyof Theme['spacing']) => ({ marginRight: theme.spacing[size] }),
  padding: (size: keyof Theme['spacing']) => ({ padding: theme.spacing[size] }),
  paddingVertical: (size: keyof Theme['spacing']) => ({ paddingVertical: theme.spacing[size] }),
  paddingHorizontal: (size: keyof Theme['spacing']) => ({ paddingHorizontal: theme.spacing[size] }),
  paddingTop: (size: keyof Theme['spacing']) => ({ paddingTop: theme.spacing[size] }),
  paddingBottom: (size: keyof Theme['spacing']) => ({ paddingBottom: theme.spacing[size] }),
  paddingLeft: (size: keyof Theme['spacing']) => ({ paddingLeft: theme.spacing[size] }),
  paddingRight: (size: keyof Theme['spacing']) => ({ paddingRight: theme.spacing[size] }),
});

export const createTextStyle = (theme: Theme, variant: keyof Theme['typography'], color?: string) => ({
  ...theme.typography[variant],
  color: color || theme.colors.text.primary,
});