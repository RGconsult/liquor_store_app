import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { submitOrder, ApiError } from '../services/api';
import { rwfToUsd, formatRwf } from '../utils/currency';
import { DELIVERY_FEE_RWF } from '../constants/pricing';
import { Order } from '../types';
import { CheckCircle2, Smartphone, CreditCard, Store, ShieldCheck } from 'lucide-react-native';
import { ColorPalette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

interface CheckoutScreenProps {
  onNavigateHome: () => void;
  onNavigateAccount: () => void;
}

type PaymentMethodUi = 'momo' | 'card' | 'pickup_counter';

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ onNavigateHome, onNavigateAccount }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { cart, subtotalUsd, clearCart } = useCart();
  const { user, coupons, refreshMe } = useAuth();

  const hasAccountInfo = Boolean(user?.email);
  const [useAccountInfo, setUseAccountInfo] = useState(hasAccountInfo);
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Kigali');
  const [province, setProvince] = useState('Kigali City');
  const [contactPhone, setContactPhone] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodUi>('momo');
  const [momoNumber, setMomoNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [couponId, setCouponId] = useState('');
  const freeDeliveryCredits = user?.freeDeliveryCredits ?? 0;
  const [useFreeDelivery, setUseFreeDelivery] = useState(freeDeliveryCredits > 0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [rewardMessages, setRewardMessages] = useState<string[]>([]);

  const isPickup = fulfillmentType === 'pickup';
  const coupon = coupons.find((c) => c.id === couponId);

  const shippingUsd = isPickup ? 0 : useFreeDelivery && freeDeliveryCredits > 0 ? 0 : rwfToUsd(DELIVERY_FEE_RWF);
  const discountedSubtotal = coupon ? subtotalUsd * (1 - coupon.percentOff / 100) : subtotalUsd;
  const taxesUsd = Number((discountedSubtotal * 0.0825).toFixed(2));
  const totalUsd = discountedSubtotal + shippingUsd + taxesUsd;

  const handleSubmit = async () => {
    setError('');

    if (!fullName.trim() || !email.trim()) {
      setError('Please fill in your name and email.');
      return;
    }
    if (!isPickup && !address.trim()) {
      setError('Please enter your delivery address.');
      return;
    }
    if (!isPickup && !contactPhone.trim()) {
      setError('Please enter a contact number so our driver can reach you.');
      return;
    }
    if (paymentMethod === 'momo' && !momoNumber.trim()) {
      setError('Please enter your Mobile Money number.');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim())) {
      setError('Please fill in all card details.');
      return;
    }

    setIsSubmitting(true);
    const cardLast4 = cardNumber ? cardNumber.replace(/\s+/g, '').slice(-4) : undefined;

    try {
      const res = await submitOrder({
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        delivery: {
          fulfillmentType,
          fullName,
          email,
          contactPhone: isPickup ? undefined : contactPhone,
          address: isPickup ? 'In-Store Pick-up (Kigali Boutique)' : address,
          city: isPickup ? 'Kigali' : city,
          province: isPickup ? 'Kigali City' : province,
          deliveryOption: 'now',
          paymentPlan: paymentMethod === 'pickup_counter' ? 'PICKUP_PAY' : 'FULL',
          momoNumber: paymentMethod === 'momo' ? momoNumber : undefined,
          cardLast4: paymentMethod === 'card' ? cardLast4 : undefined
        },
        paymentMethod: paymentMethod === 'pickup_counter' ? 'pickup_cash' : paymentMethod === 'momo' ? 'mobile' : 'card',
        couponId: couponId || undefined,
        useFreeDelivery: !isPickup && useFreeDelivery
      });

      clearCart();

      const messages: string[] = [];
      if (res.earnedCoupon) {
        messages.push(`You earned a ${res.earnedCoupon.percentOff}% coupon (${res.earnedCoupon.code}) for your next order!`);
      }
      if (res.earnedFreeDelivery) {
        messages.push('You earned a free delivery credit for your next order!');
      }
      setRewardMessages(messages);

      // The server already returns the authoritative, fully-computed order
      // (status, exact totals) — no need for a second round trip to fetch it.
      setCompletedOrder(res.order);

      refreshMe().catch(() => {});
    } catch (e) {
      const message = e instanceof ApiError ? e.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    const details = completedOrder.deliveryDetails;
    const isPickupPay = details.paymentPlan === 'PICKUP_PAY';

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.successContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.successIconBox}>
          <CheckCircle2 size={48} color={colors.success} />
        </View>

        <View style={styles.confirmedBadge}>
          <Text style={styles.confirmedBadgeText}>ORDER CONFIRMED</Text>
        </View>

        <Text style={styles.successTitle}>Thank You For Your Order!</Text>
        <Text style={styles.orderRef}>
          Order Reference: <Text style={styles.orderRefCode}>#{completedOrder.id.slice(0, 10).toUpperCase()}</Text>
        </Text>

        {rewardMessages.length > 0 && (
          <View style={styles.rewardBox}>
            {rewardMessages.map((msg, idx) => (
              <Text key={idx} style={styles.rewardText}>🎉 {msg}</Text>
            ))}
          </View>
        )}

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fulfillment:</Text>
            <Text style={styles.summaryVal}>{details.fulfillmentType === 'pickup' ? 'In-Store Pick-up' : 'Doorstep Delivery'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Customer:</Text>
            <Text style={styles.summaryVal}>{details.fullName}</Text>
          </View>
          {Boolean(details.contactPhone) && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Contact Number:</Text>
              <Text style={styles.summaryVal}>{details.contactPhone}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Status:</Text>
            <Text style={[styles.summaryVal, { color: colors.primary }]}>
              {isPickupPay ? 'Pay on Collection at Boutique' : 'Paid in Full'}
            </Text>
          </View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 10, marginTop: 6 }]}>
            <Text style={styles.summaryLabel}>Total Order Value:</Text>
            <Text style={[styles.summaryVal, { fontWeight: 'bold', fontSize: 16 }]}>{formatRwf(completedOrder.totalUsd)}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onNavigateAccount} style={styles.primaryBtn} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Track Order Status</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNavigateHome} style={styles.secondaryBtn} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Return to Storefront</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>Complete your order & choose payment options</Text>
      </View>

      {/* Step 1: Fulfillment */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>1. HOW DO YOU WANT YOUR ORDER?</Text>

        <View style={styles.fulfillmentRow}>
          <TouchableOpacity
            onPress={() => {
              setFulfillmentType('delivery');
              if (paymentMethod === 'pickup_counter') setPaymentMethod('momo');
            }}
            style={[styles.fulfillmentOption, fulfillmentType === 'delivery' && styles.fulfillmentOptionActive]}
            activeOpacity={0.85}
          >
            <Text style={styles.fulfillmentTitle}>Home Delivery</Text>
            <Text style={styles.fulfillmentSub}>We bring it to your door</Text>
            <Text style={styles.fulfillmentFee}>
              {useFreeDelivery && freeDeliveryCredits > 0 ? 'Free (credit)' : `${DELIVERY_FEE_RWF.toLocaleString()} RWF`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFulfillmentType('pickup')}
            style={[styles.fulfillmentOption, fulfillmentType === 'pickup' && styles.fulfillmentOptionActive]}
            activeOpacity={0.85}
          >
            <Text style={styles.fulfillmentTitle}>Pick Up at Store</Text>
            <Text style={styles.fulfillmentSub}>Collect at our Kigali boutique</Text>
            <Text style={[styles.fulfillmentFee, { color: colors.success }]}>Free</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Step 2: Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>2. YOUR DETAILS</Text>

        {hasAccountInfo && (
          <View style={styles.accountToggleRow}>
            <TouchableOpacity
              onPress={() => { setUseAccountInfo(true); setFullName(user?.name || ''); setEmail(user?.email || ''); }}
              style={[styles.accountToggleBtn, useAccountInfo && styles.accountToggleBtnActive]}
            >
              <Text style={[styles.accountToggleText, useAccountInfo && styles.accountToggleTextActive]}>Use my account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setUseAccountInfo(false); setFullName(''); setEmail(''); }}
              style={[styles.accountToggleBtn, !useAccountInfo && styles.accountToggleBtnActive]}
            >
              <Text style={[styles.accountToggleText, !useAccountInfo && styles.accountToggleTextActive]}>Use different info</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            editable={!(useAccountInfo && hasAccountInfo)}
            placeholder="Your full name"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, useAccountInfo && hasAccountInfo && styles.inputDisabled]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            editable={!(useAccountInfo && hasAccountInfo)}
            placeholder="your@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, useAccountInfo && hasAccountInfo && styles.inputDisabled]}
          />
        </View>

        {!isPickup && (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Delivery Address</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Street, area or neighbourhood"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>City</Text>
              <TextInput value={city} onChangeText={setCity} style={styles.input} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="e.g. 0788 123 456"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                style={styles.input}
              />
              <Text style={styles.helperText}>So our driver can reach you when they arrive.</Text>
            </View>
          </>
        )}

        {isPickup && (
          <View style={styles.pickupInfoBox}>
            <Text style={styles.pickupInfoTitle}>Store Location</Text>
            <Text style={styles.pickupInfoText}>Wine & Liquor Joint, KN 3 Rd, Kigali City Centre</Text>
            <Text style={styles.pickupInfoText}>Mon–Sat: 9 AM – 9 PM · Sun: 11 AM – 6 PM</Text>
          </View>
        )}
      </View>

      {/* Step 3: Payment */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>3. HOW DO YOU WANT TO PAY?</Text>

        <View style={styles.payOptionsRow}>
          <TouchableOpacity
            onPress={() => setPaymentMethod('momo')}
            style={[styles.payOption, paymentMethod === 'momo' && styles.payOptionActive]}
          >
            <Smartphone size={20} color={paymentMethod === 'momo' ? colors.primary : colors.textMuted} />
            <Text style={styles.payOptionLabel}>Mobile Money</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPaymentMethod('card')}
            style={[styles.payOption, paymentMethod === 'card' && styles.payOptionActive]}
          >
            <CreditCard size={20} color={paymentMethod === 'card' ? colors.primary : colors.textMuted} />
            <Text style={styles.payOptionLabel}>Card</Text>
          </TouchableOpacity>
          {isPickup && (
            <TouchableOpacity
              onPress={() => setPaymentMethod('pickup_counter')}
              style={[styles.payOption, paymentMethod === 'pickup_counter' && styles.payOptionActive]}
            >
              <Store size={20} color={paymentMethod === 'pickup_counter' ? colors.primary : colors.textMuted} />
              <Text style={styles.payOptionLabel}>Pay at Store</Text>
            </TouchableOpacity>
          )}
        </View>

        {paymentMethod === 'pickup_counter' && (
          <View style={styles.payDetailBox}>
            <Text style={styles.payDetailText}>
              Pay <Text style={{ fontWeight: 'bold' }}>{formatRwf(totalUsd)}</Text> when you collect at our store counter. We accept cash, MoMo, and card.
            </Text>
          </View>
        )}

        {paymentMethod === 'momo' && (
          <View style={styles.payDetailBox}>
            <Text style={styles.label}>Mobile Money Number</Text>
            <TextInput
              value={momoNumber}
              onChangeText={setMomoNumber}
              placeholder="e.g. 0788 123 456"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <Text style={styles.payDetailHint}>You'll get a payment prompt on this number for {formatRwf(totalUsd)}.</Text>
          </View>
        )}

        {paymentMethod === 'card' && (
          <View style={styles.payDetailBox}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="4532 •••• •••• 8892"
              placeholderTextColor={colors.textMuted}
              maxLength={19}
              style={styles.input}
            />
            <View style={styles.cardRow}>
              <View style={[styles.field, { flex: 1, marginBottom: 0 }]}>
                <Text style={styles.label}>Expiry</Text>
                <TextInput
                  value={cardExpiry}
                  onChangeText={setCardExpiry}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.textMuted}
                  maxLength={5}
                  style={styles.input}
                />
              </View>
              <View style={[styles.field, { flex: 1, marginBottom: 0 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  value={cardCvv}
                  onChangeText={setCardCvv}
                  placeholder="123"
                  placeholderTextColor={colors.textMuted}
                  maxLength={4}
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Rewards & Coupons */}
      {(coupons.length > 0 || (!isPickup && freeDeliveryCredits > 0)) && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionCardTitle}>DISCOUNTS & PERKS</Text>

          {coupons.length > 0 && (
            <View style={styles.field}>
              <Text style={styles.label}>Coupon</Text>
              <View style={styles.couponRow}>
                <TouchableOpacity
                  onPress={() => setCouponId('')}
                  style={[styles.couponChip, couponId === '' && styles.couponChipActive]}
                >
                  <Text style={[styles.couponChipText, couponId === '' && styles.couponChipTextActive]}>No coupon</Text>
                </TouchableOpacity>
                {coupons.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => setCouponId(c.id)}
                    style={[styles.couponChip, couponId === c.id && styles.couponChipActive]}
                  >
                    <Text style={[styles.couponChipText, couponId === c.id && styles.couponChipTextActive]}>
                      {c.code} — {c.percentOff}% off
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {!isPickup && freeDeliveryCredits > 0 && (
            <TouchableOpacity
              onPress={() => setUseFreeDelivery((v) => !v)}
              style={styles.freeDeliveryRow}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, useFreeDelivery && styles.checkboxActive]}>
                {useFreeDelivery && <Text style={styles.checkboxMark}>✓</Text>}
              </View>
              <Text style={styles.freeDeliveryText}>Use free delivery credit ({freeDeliveryCredits} left)</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Total */}
      <View style={styles.totalPayableCard}>
        <View style={styles.totalPayableRow}>
          <Text style={styles.totalPayableLineLabel}>Subtotal</Text>
          <Text style={styles.totalPayableLineVal}>{formatRwf(subtotalUsd)}</Text>
        </View>
        {coupon && (
          <View style={styles.totalPayableRow}>
            <Text style={[styles.totalPayableLineLabel, { color: colors.primary }]}>Coupon ({coupon.percentOff}% off)</Text>
            <Text style={[styles.totalPayableLineVal, { color: colors.primary }]}>-{formatRwf(subtotalUsd - discountedSubtotal)}</Text>
          </View>
        )}
        <View style={styles.totalPayableRow}>
          <Text style={styles.totalPayableLineLabel}>Delivery</Text>
          <Text style={styles.totalPayableLineVal}>{isPickup ? 'Free (pick-up)' : shippingUsd === 0 ? 'Free' : formatRwf(shippingUsd)}</Text>
        </View>
        <View style={styles.totalPayableRow}>
          <Text style={styles.totalPayableLineLabel}>Tax (8.25%)</Text>
          <Text style={styles.totalPayableLineVal}>{formatRwf(taxesUsd)}</Text>
        </View>
        <View style={[styles.totalPayableRow, styles.totalPayableFinalRow]}>
          <Text style={styles.totalPayableLabel}>TOTAL</Text>
          <Text style={styles.totalPayableRwf}>{formatRwf(totalUsd)}</Text>
        </View>
      </View>

      {Boolean(error) && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>Placing Order...</Text>
          </View>
        ) : (
          <Text style={styles.submitBtnText}>
            {paymentMethod === 'pickup_counter' ? `Confirm — Pay at Store (${formatRwf(totalUsd)})` : `Confirm & Pay (${formatRwf(totalUsd)})`}
          </Text>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14 }}>
        <ShieldCheck size={16} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Encrypted 256-bit Secure Checkout</Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  contentContainer: { padding: 16, paddingBottom: 40 },
  header: { paddingVertical: 14 },
  title: { color: colors.text, fontSize: 24, fontWeight: 'bold' },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 16
  },
  sectionCardTitle: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginBottom: 14 },
  fulfillmentRow: { flexDirection: 'row', gap: 10 },
  fulfillmentOption: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.bgElevated,
    borderWidth: 1.5,
    borderColor: colors.cardBorder
  },
  fulfillmentOptionActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  fulfillmentTitle: { color: colors.text, fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  fulfillmentSub: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  fulfillmentFee: { color: colors.primary, fontSize: 12, fontWeight: '800', marginTop: 10 },
  accountToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  accountToggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center'
  },
  accountToggleBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  accountToggleText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  accountToggleTextActive: { color: '#ffffff' },
  field: { marginBottom: 14 },
  label: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 6 },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 16,
    height: 52
  },
  inputDisabled: { color: colors.textMuted },
  helperText: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
  pickupInfoBox: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    padding: 14
  },
  pickupInfoTitle: { color: colors.primary, fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  pickupInfoText: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  payOptionsRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  payOption: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.bgElevated,
    borderWidth: 1.5,
    borderColor: colors.cardBorder
  },
  payOptionActive: { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
  payOptionLabel: { color: colors.text, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  payDetailBox: {
    backgroundColor: colors.bgElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginTop: 12
  },
  payDetailText: { color: colors.text, fontSize: 13, lineHeight: 19 },
  payDetailHint: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  cardRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  couponRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  couponChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.bgElevated
  },
  couponChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  couponChipText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  couponChipTextActive: { color: '#ffffff' },
  freeDeliveryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxMark: { color: '#ffffff', fontSize: 13, fontWeight: 'bold' },
  freeDeliveryText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  totalPayableCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 18
  },
  totalPayableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  totalPayableLineLabel: { color: colors.textSecondary, fontSize: 14 },
  totalPayableLineVal: { color: colors.text, fontSize: 14, fontWeight: '700' },
  totalPayableFinalRow: { marginTop: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.divider, marginBottom: 0 },
  totalPayableLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  totalPayableRwf: { color: colors.text, fontSize: 22, fontWeight: 'bold' },
  errorBox: {
    backgroundColor: 'rgba(229, 57, 53, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(229, 57, 53, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14
  },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3
  },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  submitBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  emptyText: { color: colors.textSecondary, fontSize: 15 },
  successContainer: { padding: 24, alignItems: 'center' },
  successIconBox: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.success
  },
  confirmedBadge: { backgroundColor: colors.primaryContainer, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, marginBottom: 12 },
  confirmedBadgeText: { color: colors.success, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  successTitle: { color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  orderRef: { color: colors.textSecondary, fontSize: 15, marginBottom: 16 },
  orderRefCode: { color: colors.primary, fontWeight: 'bold' },
  rewardBox: {
    width: '100%',
    backgroundColor: colors.amberContainer,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    padding: 14,
    marginBottom: 16,
    gap: 6
  },
  rewardText: { color: colors.amberDark, fontSize: 13, fontWeight: '700' },
  summaryBox: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 24,
    gap: 10
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: colors.textSecondary, fontSize: 14 },
  summaryVal: { color: colors.text, fontSize: 14, fontWeight: '600' },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  primaryBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800', textTransform: 'uppercase' },
  secondaryBtn: {
    width: '100%',
    backgroundColor: colors.card,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  secondaryBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' }
});
