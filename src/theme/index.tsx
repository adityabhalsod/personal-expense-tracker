// Theme context provider enabling light/dark mode switching across the app
// Supports high-contrast mode and dynamic font scaling for accessibility

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme, highContrastOverrides, fontScaleMultipliers } from './colors';

// Storage key for persisting theme preference
const THEME_STORAGE_KEY = '@expense_tracker_theme';

// Shape of the theme context value
interface ThemeContextType {
  theme: Theme; // Current active theme object (may include high-contrast overrides)
  isDark: boolean; // Whether dark mode is active
  themeMode: 'light' | 'dark' | 'system'; // User's theme preference
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void; // Change theme preference
  fontScale: number; // Current font scale multiplier (e.g. 1.0, 1.2)
  setFontScale: (scale: 'small' | 'default' | 'large' | 'xlarge') => void; // Change font scale
  highContrast: boolean; // Whether high-contrast mode is active
  setHighContrast: (enabled: boolean) => void; // Toggle high-contrast
}

// Create context with light theme as the default fallback
const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  themeMode: 'system',
  setThemeMode: () => {},
  fontScale: 1.0,
  setFontScale: () => {},
  highContrast: false,
  setHighContrast: () => {},
});

// Custom hook for consuming theme context in child components
export const useTheme = () => useContext(ThemeContext);

// Apply high-contrast overrides to a base theme
const applyHighContrast = (base: Theme, isDark: boolean): Theme => {
  const overrides = isDark ? highContrastOverrides.dark : highContrastOverrides.light;
  return { ...base, ...overrides };
};

// ThemeProvider component that manages theme state and persistence
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detect system color scheme (light or dark) from OS settings
  const systemColorScheme = useColorScheme();
  // Track user's theme mode preference (defaults to system)
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  // Track high-contrast toggle and font scale preference
  const [highContrast, setHighContrastState] = useState(false);
  const [fontScaleKey, setFontScaleKey] = useState<'small' | 'default' | 'large' | 'xlarge'>('default');

  // Load saved theme preference from async storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeMode(saved); // Restore persisted preference
      }
    };
    loadTheme();
  }, []);

  // Persist theme preference whenever it changes
  const handleSetThemeMode = async (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  // Resolve whether dark mode should be active based on preference and system setting
  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  // Select the appropriate theme object, applying high-contrast if needed
  const baseTheme = isDark ? darkTheme : lightTheme;
  const theme = highContrast ? applyHighContrast(baseTheme, isDark) : baseTheme;

  // Resolve the numeric font scale multiplier
  const fontScale = fontScaleMultipliers[fontScaleKey] ?? 1.0;

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      theme,
      isDark,
      themeMode,
      setThemeMode: handleSetThemeMode,
      fontScale,
      setFontScale: setFontScaleKey,
      highContrast,
      setHighContrast: setHighContrastState,
    }),
    [theme, isDark, themeMode, fontScale, highContrast]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export { lightTheme, darkTheme, Theme };
