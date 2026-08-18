/**
 * Wine & Liquor Joint – Official Brand Theme
 * Exact brand color system from web storefront (C:\Users\hp\Desktop\rg_other):
 *   Primary:   Teal Green #1b5e53 ("Wine")
 *   Secondary: Warm Amber #d84315 ("& Liquor Joint")
 */

export const colors = {
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
