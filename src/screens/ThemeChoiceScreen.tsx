import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon, Smartphone, Check } from 'lucide-react-native';
import { useTheme, ThemeMode } from '../context/ThemeContext';

interface ThemeChoiceScreenProps {
  onDone: () => void;
}

const OPTIONS: { mode: ThemeMode; label: string; sub: string; icon: React.ComponentType<any> }[] = [
  { mode: 'light', label: 'Light', sub: 'Bright background, dark text', icon: Sun },
  { mode: 'dark', label: 'Dark', sub: 'Dark background, easy on the eyes at night', icon: Moon },
  { mode: 'system', label: 'Use System Setting', sub: "Matches your phone's appearance automatically", icon: Smartphone }
];

export const ThemeChoiceScreen: React.FC<ThemeChoiceScreenProps> = ({ onDone }) => {
  const { colors, mode, setMode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const handleSelect = (next: ThemeMode) => {
    setMode(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Look</Text>
        <Text style={styles.subtitle}>
          Pick how Wine & Liquor Joint should appear. You can always change this later in Account settings.
        </Text>
      </View>

      <View style={styles.optionsList}>
        {OPTIONS.map(({ mode: optMode, label, sub, icon: Icon }) => {
          const selected = mode === optMode;
          return (
            <TouchableOpacity
              key={optMode}
              onPress={() => handleSelect(optMode)}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
              activeOpacity={0.85}
            >
              <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
                <Icon size={22} color={selected ? colors.textOnPrimary : colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{label}</Text>
                <Text style={styles.optionSub}>{sub}</Text>
              </View>
              {selected && (
                <View style={styles.checkBox}>
                  <Check size={16} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity onPress={onDone} style={styles.continueBtn} activeOpacity={0.85}>
        <Text style={styles.continueBtnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
      padding: 24,
      justifyContent: 'center',
    },
    header: {
      marginBottom: 32,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    optionsList: {
      gap: 14,
      marginBottom: 32,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: colors.cardBorder,
      padding: 16,
      gap: 14,
    },
    optionCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryContainer,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.bgElevated,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconBoxSelected: {
      backgroundColor: colors.primary,
    },
    optionLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
    optionSub: {
      color: colors.textSecondary,
      fontSize: 12,
      marginTop: 2,
      lineHeight: 16,
    },
    checkBox: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    continueBtn: {
      backgroundColor: colors.primary,
      height: 54,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    continueBtnText: {
      color: '#ffffff',
      fontSize: 15,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
