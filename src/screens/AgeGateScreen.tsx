import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Wine, ShieldAlert } from 'lucide-react-native';
import { ColorPalette } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { setItem } from '../services/storage';

// Shown once per install, before sign-in and before any storefront content —
// this app sells alcohol, so entry is gated on confirming the legal drinking
// age up front rather than relying only on the date-of-birth field buried in
// the signup form (which a returning/logging-in user never sees at all).
export const AgeGateScreen: React.FC<{ onVerified: () => void }> = ({ onVerified }) => {
  const { systemColors: colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [declined, setDeclined] = useState(false);

  const confirmOfAge = async () => {
    await setItem('rv_age_verified', 'true');
    onVerified();
  };

  if (declined) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: colors.danger + '1a', borderColor: colors.danger }]}>
            <ShieldAlert size={36} color={colors.danger} />
          </View>
          <Text style={styles.title}>Access Restricted</Text>
          <Text style={styles.subtitle}>
            You must be of legal drinking age in your location to use this app. Thanks for your honesty.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Wine size={36} color={colors.primary} />
        </View>
        <Text style={styles.brandTitle}>Wine &amp; Liquor Joint</Text>
        <Text style={styles.title}>Are you of legal drinking age?</Text>
        <Text style={styles.subtitle}>
          This app sells alcoholic beverages. You must be 18 or older to browse or order. Please drink responsibly.
        </Text>

        <TouchableOpacity onPress={confirmOfAge} style={styles.confirmBtn} activeOpacity={0.85}>
          <Text style={styles.confirmBtnText}>Yes, I&apos;m 18 or older</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setDeclined(true)} style={styles.declineBtn} activeOpacity={0.7}>
          <Text style={styles.declineBtnText}>No, I&apos;m not</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    alignItems: 'center',
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1.5,
    borderColor: colors.badgeBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  declineBtn: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
