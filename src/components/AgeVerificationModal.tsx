import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { colors } from '../theme';

export const AgeVerificationModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleConfirm = () => {
    setIsOpen(false);
  };

  const handleReject = () => {
    Linking.openURL('https://www.google.com');
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <ShieldCheck size={36} color={colors.primary} />
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>AGE VERIFICATION (18+)</Text>
          </View>

          <Text style={styles.title}>Wine & Liquor Joint</Text>

          <Text style={styles.description}>
            Welcome to Rwanda's premier cellar boutique. You must be at least 18 years of age to enter and purchase alcoholic beverages.
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>I AM 18 YEARS OR OLDER</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleReject} activeOpacity={0.8}>
            <AlertTriangle size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>I am Under 18 — Exit</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By entering, you confirm you comply with local Rwandan alcohol purchasing laws. Drink Responsibly.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 28,
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    marginBottom: 14,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: colors.bgElevated,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
});
