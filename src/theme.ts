/**
 * Wine & Liquor Joint – Official Brand Theme
 * Exact brand color system from web storefront (C:\Users\hp\Desktop\rg_other):
 *   Primary:   Teal Green #1b5e53 ("Wine")
 *   Secondary: Warm Amber #d84315 ("& Liquor Joint")
 *
 * Light and dark palettes share the same keys so every screen's styles work
 * unchanged regardless of which one is active — see ThemeContext.
 */

export const lightColors = {
  // Primary Teal Green (from web brand)
  primary: '#1b5e53',        // Official website primary teal green (#1b5e53)
  primaryDark: '#14463e',    // Darker teal for active buttons/borders
  primaryLight: '#2ba894',   // Bright teal accent
  primaryContainer: '#e6f4f1', // Soft light teal tint background

  // Secondary Warm Amber (from web brand "& Liquor Joint")
  amber: '#d84315',          // Official website secondary amber (#d84315)
  amberDark: '#bf360c',      // Dark amber
  amberLight: '#fbe9e7',     // Soft warm amber tint
  amberContainer: '#fbe9e7',

  // Gold & Accent aliases
  gold: '#d84315',
  goldDark: '#bf360c',
  goldLight: '#fbe9e7',
  accent: '#d84315',

  // Light Mode Backgrounds & Surface Containers
  bg: '#ffffff',             // White background for all screens
  bgElevated: '#f8faf9',     // Soft off-white for navigation & headers
  card: '#ffffff',           // Crisp white background for cards
  cardBorder: '#e2e8f0',     // Soft slate border
  cardElevated: '#f1f5f9',   // Light gray/slate surface container

  // High-Contrast Typography for White Screens
  text: '#0f172a',           // Dark slate text
  textSecondary: '#475569',  // Medium slate for subtitles
  textMuted: '#64748b',      // Soft slate for captions
  textOnPrimary: '#ffffff',  // White text on primary buttons
  textOnAmber: '#ffffff',    // White text on amber buttons

  // Input & Status
  inputBg: '#f8fafc',        // Light input background
  inputBorder: '#cbd5e1',    // Soft input border
  success: '#1b5e53',        // Teal success indicator
  danger: '#e53935',         // Red alert
  warning: '#d84315',        // Amber warning

  // Badges & Overlay
  badgeBg: '#e6f4f1',        // Soft teal badge background
  badgeBorder: '#a3d9cf',    // Soft teal badge border
  amberBadgeBg: '#fbe9e7',   // Soft amber badge background

  // Dividers & Overlay
  divider: '#e2e8f0',        // Light divider line
  overlay: 'rgba(15, 23, 42, 0.65)', // Modal backdrop overlay
};

export type ColorPalette = typeof lightColors;

export const darkColors: ColorPalette = {
  // Brand teal, brightened slightly for contrast against dark surfaces
  primary: '#2ba894',
  primaryDark: '#1b5e53',
  primaryLight: '#4fc9b3',
  primaryContainer: '#123a33',

  // Brand amber, brightened slightly for contrast against dark surfaces
  amber: '#ff7043',
  amberDark: '#d84315',
  amberLight: '#3a241c',
  amberContainer: '#3a241c',

  gold: '#ff7043',
  goldDark: '#d84315',
  goldLight: '#3a241c',
  accent: '#ff7043',

  // Dark Mode Backgrounds & Surface Containers
  bg: '#0b1210',
  bgElevated: '#111a17',
  card: '#141f1c',
  cardBorder: '#22322d',
  cardElevated: '#1a2622',

  // High-Contrast Typography for Dark Screens
  text: '#f1f5f4',
  textSecondary: '#b7c4c0',
  textMuted: '#8a9793',
  textOnPrimary: '#ffffff',
  textOnAmber: '#ffffff',

  // Input & Status
  inputBg: '#141f1c',
  inputBorder: '#2c3d37',
  success: '#2ba894',
  danger: '#ef5350',
  warning: '#ff7043',

  // Badges & Overlay
  badgeBg: '#123a33',
  badgeBorder: '#2ba894',
  amberBadgeBg: '#3a241c',

  // Dividers & Overlay
  divider: '#22322d',
  overlay: 'rgba(0, 0, 0, 0.75)',
};
