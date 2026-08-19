import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { fetchOrders } from '../services/api';
import { Order, Product } from '../types';
import { User, Heart, LogOut, Clock, Package, Tag, Truck } from 'lucide-react-native';
import { useWishlist } from '../context/WishlistContext';
import { colors } from '../theme';
import { formatRwf } from '../utils/currency';

interface AccountScreenProps {
  products: Product[];
  onQuickView: (p: Product) => void;
}

const STATUS_LABEL: Record<string, string> = {
  ORDER_PLACED: 'Order Placed',
  PREPARING: 'Preparing for Dispatch',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered'
};

export const AccountScreen: React.FC<AccountScreenProps> = ({ products, onQuickView }) => {
  const { user, coupons, login, signup, logout } = useAuth();
  const { wishlistIds } = useWishlist();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!user) return;
    setLoadingOrders(true);
    setOrdersError('');
    fetchOrders()
      .then(setOrders)
      .catch((e) => setOrdersError(e?.message || 'Could not load your order history.'))
      .finally(() => setLoadingOrders(false));
  }, [user]);

  const handleAuth = async () => {
    setAuthError('');
    setAuthSubmitting(true);
    const result = isLoginMode ? await login(email, password) : await signup(name, email, password);
    setAuthSubmitting(false);
    if (!result.ok) setAuthError(result.error || 'Something went wrong.');
  };

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));
  const orderCount = orders.length;
  const ordersUntilCoupon = orderCount === 0 ? 2 : 2 - (orderCount % 2 === 0 ? 0 : orderCount % 2);
  const ordersUntilFreeDelivery = orderCount === 0 ? 5 : 5 - (orderCount % 5 === 0 ? 0 : orderCount % 5);
  const freeDeliveryCredits = user?.freeDeliveryCredits ?? 0;

  if (!user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.authContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.authHeader}>
          <View style={styles.userIconBox}>
            <User size={36} color={colors.primary} />
          </View>
          <Text style={styles.authTitle}>
            {isLoginMode ? 'Welcome Back' : 'Create Cellar Account'}
          </Text>
          <Text style={styles.authSub}>
            {isLoginMode ? 'Sign in to access past orders & VIP rewards' : 'Join Rwanda premier spirits membership club'}
          </Text>
        </View>

        <View style={styles.card}>
          {!isLoginMode && (
            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textMuted}
                style={styles.input}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email Address</Text>
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
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {Boolean(authError) && <Text style={styles.errorText}>{authError}</Text>}

          <TouchableOpacity onPress={handleAuth} style={styles.submitBtn} activeOpacity={0.85} disabled={authSubmitting}>
            {authSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>{isLoginMode ? 'Sign In' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text style={styles.switchAuthText}>
              {isLoginMode ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name ? user.name[0].toUpperCase() : 'U'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.vipBadge}>
              <Text style={styles.vipBadgeText}>CELLAR VIP MEMBER</Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn} activeOpacity={0.7}>
            <LogOut size={22} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Loyalty Perks */}
      <View style={styles.perksRow}>
        <View style={styles.perkCard}>
          <View style={styles.perkHeaderRow}>
            <Tag size={14} color={colors.primary} />
            <Text style={styles.perkLabel}>Coupons</Text>
          </View>
          {coupons.length === 0 ? (
            <Text style={styles.perkEmptyText}>
              {ordersUntilCoupon} more order{ordersUntilCoupon === 1 ? '' : 's'} until your next coupon.
            </Text>
          ) : (
            <View style={{ gap: 4 }}>
              {coupons.map((c) => (
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
          </View>
          <Text style={styles.perkBigNumber}>{freeDeliveryCredits}</Text>
          <Text style={styles.perkEmptyText}>
            {freeDeliveryCredits > 0
              ? 'Applied automatically at checkout.'
              : `${ordersUntilFreeDelivery} more order${ordersUntilFreeDelivery === 1 ? '' : 's'} until your next credit.`}
          </Text>
        </View>
      </View>

      {/* Orders Section */}
      <View style={styles.sectionTitleRow}>
        <Package size={18} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.sectionTitle}>ORDER HISTORY</Text>
      </View>

      {loadingOrders ? (
        <View style={styles.emptyBox}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : ordersError ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{ordersError}</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Clock size={28} color={colors.textMuted} style={{ marginBottom: 6 }} />
          <Text style={styles.emptyText}>No past orders recorded yet.</Text>
        </View>
      ) : (
        <View style={{ gap: 12, marginBottom: 20 }}>
          {orders.map((ord) => (
            <View key={ord.id} style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <View>
                  <Text style={styles.orderId}>#{ord.id.slice(0, 8)}</Text>
                  <Text style={styles.orderDate}>{new Date(ord.createdAt).toLocaleDateString()}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{STATUS_LABEL[ord.status] || ord.status}</Text>
                </View>
              </View>

              {ord.items.map((it, idx) => (
                <View key={idx} style={styles.orderItemRow}>
                  <Text style={styles.orderItemName}>{it.quantity}x {it.product?.name || it.nameSnapshot}</Text>
                  <Text style={styles.orderItemPrice}>{formatRwf((it.priceUsdSnapshot ?? 0) * it.quantity)}</Text>
                </View>
              ))}

              <View style={styles.orderFooter}>
                <Text style={styles.orderTotalLabel}>Total Paid:</Text>
                <Text style={styles.orderTotalVal}>{formatRwf(ord.totalUsd)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Wishlist Section */}
      <View style={styles.sectionTitleRow}>
        <Heart size={18} color={colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.sectionTitle}>WISHLISTED BOTTLES ({wishlistedProducts.length})</Text>
      </View>

      {wishlistedProducts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Your wishlist is currently empty.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {wishlistedProducts.map((p) => (
            <TouchableOpacity key={p.id} onPress={() => onQuickView(p)} style={styles.wishlistCard} activeOpacity={0.8}>
              <Image source={{ uri: p.image }} style={styles.wishlistImg} resizeMode="contain" />
              <View style={{ flex: 1 }}>
                <Text style={styles.wishlistTitle} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.wishlistPrice}>{formatRwf(p.priceUsd)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  authContainer: {
    padding: 20,
    justifyContent: 'center',
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  userIconBox: {
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
  authTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  authSub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
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
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  switchAuthText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginVertical: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  vipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  vipBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  logoutBtn: {
    padding: 8,
  },
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
  },
  perkHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  perkLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  perkBigNumber: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  perkEmptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
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
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  emptyBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: 10,
    marginBottom: 10,
  },
  orderId: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  orderDate: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderItemName: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  orderItemPrice: {
    color: colors.textMuted,
    fontSize: 13,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
    marginTop: 8,
  },
  orderTotalLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  orderTotalVal: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wishlistCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  wishlistImg: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  wishlistTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  wishlistPrice: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
