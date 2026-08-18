import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Product } from '../types';
import { X, Heart, ShoppingBag, MapPin, Check } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { colors } from '../theme';
import { formatRwf } from '../utils/currency';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal visible={Boolean(product)} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.imageBox}>
              <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />

              {Boolean(product.badge) && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{product.badge}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => toggleWishlist(product.id)}
                style={[styles.wishlistBtn, wishlisted && styles.wishlistBtnActive]}
              >
                <Heart size={18} color={wishlisted ? '#fff' : colors.text} fill={wishlisted ? '#fff' : 'transparent'} />
              </TouchableOpacity>
            </View>

            <View style={styles.tagsRow}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{product.category}</Text>
              </View>
              <Text style={styles.tagText}>ABV: {product.abv}</Text>
              <Text style={styles.tagText}>Vol: {product.volume}</Text>
            </View>

            <Text style={styles.title}>{product.name}</Text>
            <Text style={styles.subtitle}>{product.subtitle}</Text>

            {Boolean(product.region) && (
              <View style={styles.regionRow}>
                <MapPin size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.regionText}>Origin: {product.region}</Text>
              </View>
            )}

            <View style={styles.descBox}>
              <Text style={styles.descText}>{product.description}</Text>
            </View>

            <View style={styles.priceQtyRow}>
              <View>
                <Text style={styles.priceRwf}>{formatRwf(product.priceRwf * quantity)}</Text>
              </View>

              <View style={styles.qtyBox}>
                <TouchableOpacity
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.qtyNumber}>{quantity}</Text>

                <TouchableOpacity
                  onPress={() => setQuantity((q) => q + 1)}
                  style={[styles.qtyBtn, styles.qtyBtnPlus]}
                >
                  <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleAddToCart}
              style={[styles.addCartBtn, addedToast && styles.addCartBtnSuccess]}
              activeOpacity={0.85}
            >
              {addedToast ? (
                <>
                  <Check size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.addCartTextSuccess}>Added to Bag!</Text>
                </>
              ) : (
                <>
                  <ShoppingBag size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.addCartText}>
                    Add {quantity} Bottle{quantity > 1 ? 's' : ''} to Bag
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 22,
    maxHeight: '85%',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBox: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistBtnActive: {
    backgroundColor: colors.accent,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  catBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  catBadgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 13,
    backgroundColor: colors.bgElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: 10,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  regionText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  descBox: {
    backgroundColor: colors.bgElevated,
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  descText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  priceQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  priceRwf: {
    color: colors.text,
    fontSize: 26,
    fontWeight: 'bold',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnPlus: {
    backgroundColor: colors.primary,
  },
  qtyBtnText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyNumber: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    width: 36,
    textAlign: 'center',
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  addCartBtnSuccess: {
    backgroundColor: colors.success,
  },
  addCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addCartTextSuccess: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
