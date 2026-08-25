import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { getItem, setItem } from '../services/storage';
import { updateThemePreference } from '../services/api';
import { lightColors, darkColors, ColorPalette } from '../theme';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedScheme = 'light' | 'dark';

const STORAGE_KEY = 'rv_theme_mode';
const DEFAULT_MODE: ThemeMode = 'system';

function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

interface ThemeContextType {
  mode: ThemeMode;
  resolvedScheme: ResolvedScheme;
  colors: ColorPalette;
  hasChosenTheme: boolean;
  setMode: (mode: ThemeMode) => void;
  /** Adopts a preference fetched from the account (e.g. after login) without
   *  re-syncing it back to the server it just came from. */
  applyRemoteMode: (mode: ThemeMode | null | undefined) => void;
  /** The phone's actual appearance setting, regardless of any account/device
   *  preference — for screens shown before there's a signed-in account to
   *  have a preference at all (the login/signup screen). */
  systemScheme: ResolvedScheme;
  systemColors: ColorPalette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storedMode = getItem(STORAGE_KEY);
  const [mode, setModeState] = useState<ThemeMode>(isThemeMode(storedMode) ? storedMode : DEFAULT_MODE);
  const [hasChosenTheme, setHasChosenTheme] = useState(isThemeMode(storedMode));

  // Live system appearance.
  const rawSystemScheme = useColorScheme();
  const systemScheme: ResolvedScheme = rawSystemScheme === 'dark' ? 'dark' : 'light';
  const systemColors = systemScheme === 'dark' ? darkColors : lightColors;

  const resolvedScheme: ResolvedScheme = mode === 'system' ? systemScheme : mode;
  const colors = resolvedScheme === 'dark' ? darkColors : lightColors;

  // User-initiated change — from the first-time picker or Account settings.
  // Persists locally and follows the account to other devices/reinstalls.
  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    setHasChosenTheme(true);
    setItem(STORAGE_KEY, next).catch(() => {});
    updateThemePreference(next).catch(() => {});
  }, []);

  // Reconciling with what the server already has on file for this account —
  // not a new choice, so it isn't sent back up.
  const applyRemoteMode = useCallback((next: ThemeMode | null | undefined) => {
    if (!isThemeMode(next)) return;
    setModeState((current) => {
      if (current === next) return current;
      setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
    setHasChosenTheme(true);
  }, []);

  const value = useMemo(
    () => ({ mode, resolvedScheme, colors, hasChosenTheme, setMode, applyRemoteMode, systemScheme, systemColors }),
    [mode, resolvedScheme, colors, hasChosenTheme, setMode, applyRemoteMode, systemScheme, systemColors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

/**
 * Builds a StyleSheet from the active palette and re-creates it only when the
 * palette actually changes — lets every screen keep its existing `styles.xxx`
 * usage while responding to theme switches.
 */
export function useThemedStyles<T>(factory: (colors: ColorPalette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors]);
}
