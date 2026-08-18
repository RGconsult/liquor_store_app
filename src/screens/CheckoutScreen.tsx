import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { submitOrder } from '../services/api';
import { DELIVERY_FEE_RWF } from '../constants/pricing';
import { formatRwf } from '../utils/currency';
import { CheckCircle2, Smartphone, CreditCard, ShieldCheck } from 'lucide-react-native';
import { colors } from '../theme';

interface CheckoutScreenProps {
  onNavigateHome: () => void;
  onNavigateAccount: () => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ onNavigateHome, onNavigateAccount }) => {
  const { cart, subtotalRwf, clearCart } = useCart();
  const { user } = useAuth();

  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+250 783 523 034');
  const [address, setAddress] = useState('KG 9 Ave, Nyarutarama, Kigali');

  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card' | 'pickup_cash'>('mobile');
  const [momoProvider, setMomoProvider] = useState<'MTN' | 'AIRTEL'>('MTN');
  const [momoPhone, setMomoPhone] = useState('+250 788 123 456');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [momoPrompting, setMomoPrompting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{ id: string; totalRwf: number } | null>(null);

  const deliveryFeeRwf = fulfillment === 'delivery' ? DELIVERY_FEE_RWF : 0;
  const totalRwf = subtotalRwf + deliveryFeeRwf;

  const handleSubmit = async () => {
    if (!fullName || !email || (fulfillment === 'delivery' && !address)) {
      Alert.alert('Missing Details', 'Please fill in all delivery details.');
      return;
    }

    setIsSubmitting(true);

    if (paymentMethod === 'mobile') {
      setMomoPrompting(true);
      await new Promise((r) => setTimeout(r, 2000));
      setMomoPrompting(false);
    }

    const payload = {
      items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      delivery: {
        fulfillmentType: fulfillment,
        fullName,
        email,
        address,
        city: 'Kigali',
        province: 'Kigali City',
        momoNumber: paymentMethod === 'mobile' ? momoPhone : undefined
      },
      paymentMethod,
      subtotalRwf,
      deliveryFeeRwf,
      totalRwf
    };

    const res = await submitOrder(payload);
    setIsSubmitting(false);

    if (res && res.orderId) {
      setCompletedOrder({ id: res.orderId, totalRwf });
      clearCart();
    } else {
      Alert.alert('Order Failed', 'Failed to place order. Please check your connection.');
    }
  };

  if (completedOrder) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconBox}>
          <CheckCircle2 size={48} color={colors.success} />
        </View>

        <View style={styles.confirmedBadge}>
          <Text style={styles.confirmedBadgeText}>ORDER CONFIRMED</Text>
        </View>

        <Text style={styles.successTitle}>Thank You For Your Order!</Text>
        <Text style={styles.orderRef}>
          Order Reference: <Text style={styles.orderRefCode}>#{completedOrder.id}</Text>
        </Text>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Customer Name:</Text>
            <Text style={styles.summaryVal}>{fullName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Address:</Text>
            <Text style={styles.summaryVal}>{address}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method:</Text>
            <Text style={[styles.summaryVal, { color: colors.primary }]}>
              {paymentMethod === 'mobile' ? `${momoProvider} Mobile Money` : paymentMethod}
            </Text>
          </View>
          <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 10, marginTop: 6 }]}>
            <Text style={styles.summaryLabel}>Total Paid:</Text>
            <Text style={[styles.summaryVal, { fontWeight: 'bold', fontSize: 16 }]}>{formatRwf(completedOrder.totalRwf)}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onNavigateAccount} style={styles.primaryBtn} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Track Order Status</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNavigateHome} style={styles.secondaryBtn} activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Return to Storefront</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>Complete your order & choose payment options</Text>
      </View>

      {/* Fulfillment Toggle */}
      <View style={styles.tabToggleRow}>
        <TouchableOpacity
          onPress={() => setFulfillment('delivery')}
          style={[styles.toggleBtn, fulfillment === 'delivery' && styles.toggleBtnActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleBtnText, fulfillment === 'delivery' && styles.toggleBtnTextActive]}>
            Kigali Express Delivery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFulfillment('pickup')}
          style={[styles.toggleBtn, fulfillment === 'pickup' && styles.toggleBtnActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.toggleBtnText, fulfillment === 'pickup' && styles.toggleBtnTextActive]}>
            Boutique Pickup
          </Text>
        </TouchableOpacity>
      </View>

      {/* Delivery Form Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>DELIVERY ADDRESS & CONTACT</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter recipient full name"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email Address (for order receipt)</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="name@domain.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number (Kigali hotline / MoMo)</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+250 78X XXX XXX"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        {fulfillment === 'delivery' && (
          <View style={styles.field}>
            <Text style={styles.label}>Delivery Address in Kigali</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Street address, building, district"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>
        )}
      </View>

      {/* Payment Options Card */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>PAYMENT METHOD</Text>

        <TouchableOpacity
          onPress={() => setPaymentMethod('mobile')}
          style={[styles.payOption, paymentMethod === 'mobile' && styles.payOptionActive]}
          activeOpacity={0.85}
        >
          <View style={styles.payOptionRow}>
            <Smartphone size={20} color={paymentMethod === 'mobile' ? colors.primary : colors.textMuted} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.payOptionTitle}>MTN / Airtel Mobile Money</Text>
              <Text style={styles.payOptionSub}>Instant prompt to your Rwandan phone number</Text>
            </View>
          </View>
        </TouchableOpacity>

        {paymentMethod === 'mobile' && (
          <View style={styles.momoSubBox}>
            <Text style={[styles.label, { marginBottom: 8 }]}>Select Mobile Money Provider:</Text>
            <View style={styles.momoProviderRow}>
              <TouchableOpacity
                onPress={() => setMomoProvider('MTN')}
                style={[styles.momoPill, momoProvider === 'MTN' && styles.momoPillMTN]}
              >
                <Text style={styles.momoPillText}>MTN MoMo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setMomoProvider('AIRTEL')}
                style={[styles.momoPill, momoProvider === 'AIRTEL' && styles.momoPillAirtel]}
              >
                <Text style={styles.momoPillText}>Airtel Money</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.field, { marginTop: 12, marginBottom: 0 }]}>
              <Text style={styles.label}>MoMo Paying Phone Number</Text>
              <TextInput
                value={momoPhone}
                onChangeText={setMomoPhone}
                placeholder="+250 788 000 000"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => setPaymentMethod('card')}
          style={[styles.payOption, paymentMethod === 'card' && styles.payOptionActive]}
          activeOpacity={0.85}
        >
          <View style={styles.payOptionRow}>
            <CreditCard size={20} color={paymentMethod === 'card' ? colors.primary : colors.textMuted} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.payOptionTitle}>Credit / Debit Card</Text>
              <Text style={styles.payOptionSub}>Visa, Mastercard, American Express</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Total Payable Summary Card */}
      <View style={styles.totalPayableCard}>
        <View style={styles.totalPayableRow}>
          <Text style={styles.totalPayableLineLabel}>Subtotal</Text>
          <Text style={styles.totalPayableLineVal}>{formatRwf(subtotalRwf)}</Text>
        </View>
        <View style={styles.totalPayableRow}>
          <Text style={styles.totalPayableLineLabel}>
            {fulfillment === 'delivery' ? 'Delivery Fee' : 'Pickup'}
          </Text>
          <Text style={styles.totalPayableLineVal}>
            {fulfillment === 'delivery' ? formatRwf(deliveryFeeRwf) : 'FREE'}
          </Text>
        </View>
        <View style={[styles.totalPayableRow, styles.totalPayableFinalRow]}>
          <Text style={styles.totalPayableLabel}>TOTAL PAYABLE</Text>
          <Text style={styles.totalPayableRwf}>{formatRwf(totalRwf)}</Text>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>
              {momoPrompting ? 'Sending MoMo Payment Prompt...' : 'Placing Order...'}
            </Text>
          </View>
        ) : (
          <Text style={styles.submitBtnText}>Confirm & Pay {formatRwf(totalRwf)}</Text>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14 }}>
        <ShieldCheck size={16} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Encrypted 256-bit Secure Checkout</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 14,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#ffffff',
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 16,
  },
  sectionCardTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bgElevated,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 16,
    height: 52,
  },
  payOption: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.bgElevated,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    marginBottom: 10,
  },
  payOptionActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  payOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payOptionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  payOptionSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  momoSubBox: {
    backgroundColor: colors.bgElevated,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  momoProviderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  momoPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  momoPillMTN: {
    backgroundColor: 'rgba(255, 204, 0, 0.18)',
    borderColor: '#FFCC00',
  },
  momoPillAirtel: {
    backgroundColor: 'rgba(255, 68, 68, 0.18)',
    borderColor: '#FF4444',
  },
  momoPillText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalPayableCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 18,
  },
  totalPayableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalPayableLineLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  totalPayableLineVal: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  totalPayableFinalRow: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginBottom: 0,
  },
  totalPayableLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  totalPayableRwf: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  successContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  successIconBox: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  confirmedBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  confirmedBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  successTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  orderRef: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: 24,
  },
  orderRefCode: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  summaryBox: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 24,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  summaryVal: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: colors.card,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
