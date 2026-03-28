// Theme system providing light and dark color palettes
// Used by ThemeContext to provide consistent styling across the app

// Light mode color palette for daytime use
export const lightTheme = {
  dark: false, // Indicates this is a light theme
  colors: {
    primary: '#6C63FF', // Main brand/action color (violet)
    primaryLight: '#8B85FF', // Lighter shade for backgrounds
    primaryDark: '#4B44CC', // Darker shade for pressed states
    secondary: '#FF6B6B', // Accent color for highlights
    background: '#F8F9FE', // Main screen background
    surface: '#FFFFFF', // Card and modal backgrounds
    surfaceVariant: '#F0F1F8', // Subtle surface differentiation
    card: '#FFFFFF', // Card component background
    text: '#1A1A2E', // Primary text color
    textSecondary: '#6B7280', // Secondary/muted text color
    textTertiary: '#9CA3AF', // Tertiary/hint text color
    border: '#E5E7EB', // Border and divider color
    notification: '#FF6B6B', // Badge and notification color
    error: '#EF4444', // Error/destructive action color
    success: '#10B981', // Success/positive color
    warning: '#F59E0B', // Warning/caution color
    info: '#3B82F6', // Informational color
    income: '#10B981', // Income/positive balance color
    expense: '#EF4444', // Expense/negative balance color
    shadow: 'rgba(0, 0, 0, 0.08)', // Shadow color for elevation
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlay backdrop
    tabBar: '#FFFFFF', // Bottom tab bar background
    tabBarInactive: '#9CA3AF', // Inactive tab icon color
    statusBar: 'dark' as 'dark' | 'light', // Status bar text style
    inputBackground: '#F3F4F6', // Text input background
    chipBackground: '#EEF2FF', // Chip/tag background color
    chipText: '#6C63FF', // Chip/tag text color
  },
  spacing: {
    xs: 4, // Extra small spacing
    sm: 8, // Small spacing
    md: 16, // Medium spacing
    lg: 24, // Large spacing
    xl: 32, // Extra large spacing
    xxl: 48, // Double extra large spacing
  },
  borderRadius: {
    sm: 8, // Small radius for chips and small elements
    md: 12, // Medium radius for cards
    lg: 16, // Large radius for modals
    xl: 24, // Extra large radius for full-round elements
    full: 9999, // Fully rounded (circles)
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 36 },
    h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
    h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
    body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
    bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
    button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 20 },
    label: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  },
};

// Dark mode color palette for nighttime use
export const darkTheme = {
  ...lightTheme, // Inherit spacing, borderRadius, and typography
  dark: true, // Indicates this is a dark theme
  colors: {
    primary: '#8B85FF', // Brighter primary for dark backgrounds
    primaryLight: '#A5A0FF', // Lighter variant
    primaryDark: '#6C63FF', // Darker variant
    secondary: '#FF8A8A', // Brighter accent
    background: '#0F0F23', // Deep dark background
    surface: '#1A1A2E', // Surface elevation level 1
    surfaceVariant: '#16213E', // Surface elevation level 2
    card: '#1A1A2E', // Card background
    text: '#F8F9FE', // Primary text on dark
    textSecondary: '#9CA3AF', // Muted text
    textTertiary: '#6B7280', // Hint text
    border: '#2D2D44', // Subtle borders on dark
    notification: '#FF6B6B', // Notification badge
    error: '#F87171', // Error color
    success: '#34D399', // Success color
    warning: '#FBBF24', // Warning color
    info: '#60A5FA', // Info color
    income: '#34D399', // Income highlight
    expense: '#F87171', // Expense highlight
    shadow: 'rgba(0, 0, 0, 0.3)', // Deeper shadow for dark
    overlay: 'rgba(0, 0, 0, 0.7)', // Darker overlay
    tabBar: '#1A1A2E', // Tab bar background
    tabBarInactive: '#6B7280', // Inactive tab icon
    statusBar: 'light' as 'dark' | 'light', // Light status bar text
    inputBackground: '#16213E', // Input background
    chipBackground: '#2D2D44', // Chip background
    chipText: '#8B85FF', // Chip text
  },
};

// Type export for the theme object used across the app
export type Theme = typeof lightTheme;

// High-contrast color overrides for accessibility — applied on top of light/dark themes
export const highContrastOverrides = {
  light: {
    text: '#000000', // Pure black for maximum readability
    textSecondary: '#1A1A1A', // Near-black for secondary text
    textTertiary: '#333333', // Dark grey for hints
    border: '#666666', // Stronger borders for visibility
    primary: '#4338CA', // Deeper indigo for contrast on white
    expense: '#B91C1C', // Darker red for contrast
    income: '#047857', // Darker green for contrast
  },
  dark: {
    text: '#FFFFFF', // Pure white for maximum readability
    textSecondary: '#E5E5E5', // Near-white for secondary text
    textTertiary: '#CCCCCC', // Light grey for hints
    border: '#888888', // Brighter borders for visibility
    primary: '#A5B4FC', // Brighter primary for dark backgrounds
    expense: '#FCA5A5', // Brighter red for dark backgrounds
    income: '#6EE7B7', // Brighter green for dark backgrounds
  },
};

// Font scale multipliers mapped to user preference
export const fontScaleMultipliers: Record<string, number> = {
  small: 0.85,
  default: 1.0,
  large: 1.2,
  xlarge: 1.4,
};
