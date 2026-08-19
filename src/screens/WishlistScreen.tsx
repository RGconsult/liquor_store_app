import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { Heart } from 'lucide-react-native';
import { colors } from '../theme';

interface WishlistScreenProps {
  products: Product[];
  onQuickView: (product: Product) => void;
}

export const WishlistScreen: React.FC<WishlistScreenProps> = ({ products, onQuickView }) => {
  const { user } = useAuth();
  const { wishlistIds } = useWishlist();
  const wishlisted = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wishlist</Text>
        <Text style={styles.subtitle}>
          {wishlisted.length} bottle{wishlisted.length === 1 ? '' : 's'} saved
        </Text>
      </View>

      {!user ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBox}>
            <Heart size={32} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Sign in to see your wishlist</Text>
          <Text style={styles.emptySubtitle}>Your saved drinks are tied to your account — log in from the Account tab.</Text>
        </View>
      ) : wishlisted.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconBox}>
            <Heart size={32} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySubtitle}>Tap the heart icon on any bottle to save it here.</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {wishlisted.map((product) => (
            <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
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
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 10,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 28,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.badgeBorder,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
