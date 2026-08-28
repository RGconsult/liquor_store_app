import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tag, Truck } from 'lucide-react-native';
import { ColorPalette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';
import { LoyaltySettings } from '../services/api';
import { Coupon } from '../types';

interface LoyaltyTrackerProps {
  orderCount: number;
  settings: LoyaltySettings | null;
  activeCoupons: Coupon[];
  freeDeliveryCredits: number;
}

const ProgressBar: React.FC<{ pct: number; colors: ColorPalette }> = ({ pct, colors }) => (
  <View style={{ height: 6, backgroundColor: colors.cardElevated, borderRadius: 3, overflow: 'hidden' }}>
    <View style={{ height: '100%', width: `${pct}%`, backgroundColor: colors.primary, borderRadius: 3 }} />
  </View>
);

export const LoyaltyTracker: React.FC<LoyaltyTrackerProps> = ({ orderCount, settings, activeCoupons, freeDeliveryCredits }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const couponEvery = settings?.couponEveryNOrders ?? 2;
  const couponPercentOff = settings?.couponPercentOff ?? 10;
  const deliveryEvery = settings?.freeDeliveryEveryNOrders ?? 5;

  const couponProgress = couponEvery > 0 ? orderCount % couponEvery : 0;
  const couponPct = couponEvery > 0 ? Math.round((couponProgress / couponEvery) * 100) : 0;
  const ordersUntilCoupon = couponEvery > 0 ? couponEvery - couponProgress : 0;

  const deliveryProgress = deliveryEvery > 0 ? orderCount % deliveryEvery : 0;
  const deliveryPct = deliveryEvery > 0 ? Math.round((deliveryProgress / deliveryEvery) * 100) : 0;
  const ordersUntilDelivery = deliveryEvery > 0 ? deliveryEvery - deliveryProgress : 0;

  return (
    <View style={styles.perksRow}>
      <View style={styles.perkCard}>
        <View style={styles.perkHeaderRow}>
          <Tag size={14} color={colors.primary} />
          <Text style={styles.perkLabel}>Coupons</Text>
          <Text style={styles.perkFraction}>{couponEvery > 0 ? `${couponProgress}/${couponEvery}` : '—'}</Text>
        </View>
        {couponEvery > 0 && <ProgressBar pct={couponPct} colors={colors} />}
        <Text style={styles.perkEmptyText}>
          {couponEvery > 0
            ? `${ordersUntilCoupon} more order${ordersUntilCoupon === 1 ? '' : 's'} for ${couponPercentOff}% off.`
            : 'Coupon rewards are off.'}
        </Text>
        {activeCoupons.length > 0 && (
          <View style={styles.couponList}>
            {activeCoupons.map((c) => (
              <View key={c.id} style={styles.couponLine}>
                <Text style={styles.couponCode}>{c.code}</Text>
                <Text style={styles.couponPercent}>{c.percentOff}% off</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.perkCard}>
        <View style={styles.perkHeaderRow}>
          <Truck size={14} color={colors.primary} />
          <Text style={styles.perkLabel}>Free Delivery</Text>
          <Text style={styles.perkFraction}>{deliveryEvery > 0 ? `${deliveryProgress}/${deliveryEvery}` : '—'}</Text>
        </View>
        {deliveryEvery > 0 && <ProgressBar pct={deliveryPct} colors={colors} />}
        <Text style={styles.perkEmptyText}>
          {freeDeliveryCredits > 0
            ? `${freeDeliveryCredits} credit${freeDeliveryCredits === 1 ? '' : 's'} — applied automatically.`
            : deliveryEvery > 0
            ? `${ordersUntilDelivery} more order${ordersUntilDelivery === 1 ? '' : 's'} until your next credit.`
            : 'Free delivery rewards are off.'}
        </Text>
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  perksRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  perkCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    gap: 6,
  },
  perkHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  perkLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  perkFraction: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  perkEmptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  couponList: {
    gap: 4,
    marginTop: 2,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  couponLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  couponCode: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  couponPercent: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
