import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Product } from '../types';
import { Heart, Plus } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { colors } from '../theme';
import { formatRwf } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const handleToggleWishlist = async () => {
    const result = await toggleWishlist(product.id);
    if (!result.ok && result.error) {
      Alert.alert('Sign in required', result.error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onQuickView(product)}
      activeOpacity={0.9}
    >
      {/* Bottle Image Showcase Box */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Featured / Special Badge (Teal #1b5e53 from web) */}
        {Boolean(product.badge || product.isRare) && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.badge || 'Rare Vintage'}</Text>
          </View>
        )}

        {/* Wishlist Icon */}
        <TouchableOpacity
          onPress={handleToggleWishlist}
          style={[styles.wishlistBtn, wishlisted && styles.wishlistActiveBtn]}
          activeOpacity={0.8}
        >
          <Heart
            size={18}
            color={wishlisted ? '#ffffff' : colors.text}
            fill={wishlisted ? '#ffffff' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Details Container */}
      <View style={styles.detailsContainer}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>

        {/* Price & Add to Bag Footer */}
        <View style={styles.footer}>
          <Text style={styles.priceRwf}>{formatRwf(product.priceUsd)}</Text>

          <TouchableOpacity
            onPress={() => addToCart(product)}
            style={styles.addBtn}
            activeOpacity={0.85}
          >
            <Plus size={18} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 260,
    backgroundColor: colors.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primaryDark, // #1b5e53
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    zIndex: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  wishlistActiveBtn: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  detailsContainer: {
    padding: 14,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRwf: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryDark, // #1b5e53
    justifyContent: 'center',
    alignItems: 'center',
  },
});
