import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react-native';
import { colors } from '../theme';
import { formatRwf } from '../utils/currency';

interface CartScreenProps {
  onNavigateCheckout: () => void;
  onNavigateCatalog: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onNavigateCheckout, onNavigateCatalog }) => {
  const { cart, removeFromCart, updateQuantity, itemCount, subtotalRwf } = useCart();

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <ShoppingBag size={48} color={colors.primary} />
        </View>

        <Text style={styles.emptyTitle}>Your Cellar Bag is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Explore our fine spirits, single malt scotch whiskies, tequilas, cognacs, and wines.
        </Text>

        <TouchableOpacity onPress={onNavigateCatalog} style={styles.exploreBtn} activeOpacity={0.85}>
          <Text style={styles.exploreBtnText}>Explore Cellar Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping Bag</Text>
        <Text style={styles.subtitle}>{itemCount} bottle{itemCount > 1 ? 's' : ''} in your cellar cart</Text>
      </View>

      {/* Cart Items List */}
      <View style={styles.cartList}>
        {cart.map((item) => (
          <View key={item.product.id} style={styles.cartItemCard}>
            <View style={styles.itemImageContainer}>
              <Image source={{ uri: item.product.image }} style={styles.itemImage} resizeMode="contain" />
            </View>

            <View style={styles.itemInfo}>
              <View style={styles.itemCatBadge}>
                <Text style={styles.itemCatText}>{item.product.category}</Text>
              </View>
              <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
              <Text style={styles.itemSub} numberOfLines={1}>{item.product.subtitle}</Text>

              <View style={styles.priceRow}>
                <Text style={styles.itemPriceRwf}>{formatRwf(item.product.priceRwf * item.quantity)}</Text>
              </View>
            </View>

            <View style={styles.itemControls}>
              <TouchableOpacity onPress={() => removeFromCart(item.product.id)} style={styles.deleteBtn} activeOpacity={0.7}>
                <Trash2 size={20} color={colors.danger} />
              </TouchableOpacity>

              <View style={styles.qtyBox}>
                <TouchableOpacity onPress={() => updateQuantity(item.product.id, item.quantity - 1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQuantity(item.product.id, item.quantity + 1)} style={[styles.qtyBtn, styles.qtyBtnPlus]}>
                  <Text style={[styles.qtyBtnText, { color: '#ffffff' }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Order Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>ORDER SUMMARY</Text>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalRwf}>{formatRwf(subtotalRwf)}</Text>
        </View>

        <Text style={styles.deliveryNote}>
          Delivery adds a flat 2,500 RWF fee, applied at checkout if you choose delivery over pickup.
        </Text>
      </View>

      {/* Big Prominent Checkout Button */}
      <TouchableOpacity onPress={onNavigateCheckout} style={styles.checkoutBtn} activeOpacity={0.85}>
        <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
        <ArrowRight size={22} color="#ffffff" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    paddingBottom: 40,
    paddingHorizontal: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.bg,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.badgeBorder,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cartList: {
    gap: 14,
    marginBottom: 18,
  },
  cartItemCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    padding: 4,
  },
  itemImage: {
    width: '90%',
    height: '90%',
  },
  itemInfo: {
    flex: 1,
  },
  itemCatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  itemCatText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  itemName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
  },
  itemSub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  priceRow: {
    marginTop: 6,
  },
  itemPriceRwf: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
  },
  itemControls: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    paddingLeft: 10,
  },
  deleteBtn: {
    padding: 6,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnPlus: {
    backgroundColor: colors.primary,
  },
  qtyBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  qtyNum: {
    color: colors.text,
    fontSize: 15,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    marginBottom: 20,
  },
  summaryTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  totalRwf: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  deliveryNote: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    lineHeight: 17,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    gap: 10,
    elevation: 3,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
