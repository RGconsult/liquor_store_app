import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Order } from '../types';
import { X, PackageCheck, ChefHat, Truck, PartyPopper } from 'lucide-react-native';
import { ColorPalette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { formatRwf } from '../utils/currency';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

const STEPS: { status: Order['status']; label: string; description: string; icon: React.ComponentType<any> }[] = [
  { status: 'ORDER_PLACED', label: 'Order Placed', description: 'We’ve received your order and it’s confirmed.', icon: PackageCheck },
  { status: 'PREPARING', label: 'Preparing for Dispatch', description: 'Your bottles are being packed at the cellar.', icon: ChefHat },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', description: 'On its way to you across Kigali.', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', description: 'Enjoy responsibly!', icon: PartyPopper }
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  if (!order) return null;

  const currentIndex = STEPS.findIndex((s) => s.status === order.status);

  return (
    <Modal visible={Boolean(order)} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Track Order</Text>
              <Text style={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={styles.timeline}>
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isDone = index < currentIndex;
                const isActive = index === currentIndex;
                const isLast = index === STEPS.length - 1;
                const reached = index <= currentIndex;

                return (
                  <View key={step.status} style={styles.stepRow}>
                    <View style={styles.stepIconColumn}>
                      <View
                        style={[
                          styles.stepIconCircle,
                          reached ? styles.stepIconCircleActive : styles.stepIconCircleInactive
                        ]}
                      >
                        <Icon size={18} color={reached ? '#ffffff' : colors.textMuted} />
                      </View>
                      {!isLast && (
                        <View
                          style={[styles.stepConnector, isDone ? styles.stepConnectorActive : styles.stepConnectorInactive]}
                        />
                      )}
                    </View>
                    <View style={styles.stepTextColumn}>
                      <Text style={[styles.stepLabel, reached && styles.stepLabelActive]}>{step.label}</Text>
                      <Text style={styles.stepDescription}>{step.description}</Text>
                      {isActive && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>CURRENT STATUS</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>{order.items.length} item{order.items.length === 1 ? '' : 's'}</Text>
              {order.items.map((it, idx) => (
                <Text key={idx} style={styles.summaryItem} numberOfLines={1}>
                  {it.quantity}x {it.product?.name || it.nameSnapshot}
                </Text>
              ))}
              <View style={styles.summaryFooter}>
                <Text style={styles.summaryTotalLabel}>Total Paid</Text>
                <Text style={styles.summaryTotalValue}>{formatRwf(order.totalUsd)}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: 'bold',
  },
  orderId: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeline: {
    marginBottom: 18,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepIconColumn: {
    alignItems: 'center',
    marginRight: 14,
  },
  stepIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconCircleActive: {
    backgroundColor: colors.primary,
  },
  stepIconCircleInactive: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  stepConnector: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginVertical: 2,
  },
  stepConnectorActive: {
    backgroundColor: colors.primary,
  },
  stepConnectorInactive: {
    backgroundColor: colors.cardBorder,
  },
  stepTextColumn: {
    flex: 1,
    paddingBottom: 22,
  },
  stepLabel: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
  },
  stepLabelActive: {
    color: colors.text,
  },
  stepDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  currentBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryItem: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
    marginTop: 8,
  },
  summaryTotalLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  summaryTotalValue: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
