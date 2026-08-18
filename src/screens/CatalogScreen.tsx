import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Product, LiquorCategory } from '../types';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductCard } from '../components/ProductCard';
import { Search, Sparkles } from 'lucide-react-native';
import { colors } from '../theme';

interface CatalogScreenProps {
  products: Product[];
  categories: any[];
  onQuickView: (product: Product) => void;
  initialSearch?: string;
  initialCategory?: LiquorCategory;
  autoFocusSearch?: boolean;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  products,
  categories,
  onQuickView,
  initialSearch,
  initialCategory,
  autoFocusSearch
}) => {
  const [search, setSearch] = useState(initialSearch || '');
  const [selectedCat, setSelectedCat] = useState<LiquorCategory>(initialCategory || 'ALL');
  const [sortOrder, setSortOrder] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [priceTier, setPriceTier] = useState<'all' | 'under50' | '50to100' | 'above100'>('all');

  let filtered = products.filter((p) => {
    const matchesCat = selectedCat === 'ALL' || p.category.toLowerCase() === selectedCat.toLowerCase();
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    let matchesPrice = true;
    if (priceTier === 'under50') matchesPrice = p.priceRwf < 50000;
    else if (priceTier === '50to100') matchesPrice = p.priceRwf >= 50000 && p.priceRwf <= 100000;
    else if (priceTier === 'above100') matchesPrice = p.priceRwf > 100000;

    return matchesCat && matchesSearch && matchesPrice;
  });

  if (sortOrder === 'price-asc') {
    filtered.sort((a, b) => a.priceRwf - b.priceRwf);
  } else if (sortOrder === 'price-desc') {
    filtered.sort((a, b) => b.priceRwf - a.priceRwf);
  } else if (sortOrder === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Cellar Catalog</Text>
        <Text style={styles.subtitle}>Browse premium spirits, champagnes, and fine wines.</Text>
      </View>

      <View style={styles.searchBar}>
        <Search size={20} color={colors.primary} style={{ marginRight: 10 }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search catalog by name, type, or region..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoFocus={autoFocusSearch}
        />
      </View>

      <CategoryFilter
        selectedCategory={selectedCat}
        onSelectCategory={(cat) => setSelectedCat(cat)}
        categoriesWithCount={categories}
      />

      {/* Price Tier Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <TouchableOpacity
          onPress={() => setPriceTier('all')}
          style={[styles.filterChip, priceTier === 'all' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, priceTier === 'all' && styles.filterChipTextActive]}>All Prices</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPriceTier('under50')}
          style={[styles.filterChip, priceTier === 'under50' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, priceTier === 'under50' && styles.filterChipTextActive]}>Under 50K RWF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPriceTier('50to100')}
          style={[styles.filterChip, priceTier === '50to100' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, priceTier === '50to100' && styles.filterChipTextActive]}>50K–100K RWF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPriceTier('above100')}
          style={[styles.filterChip, priceTier === 'above100' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, priceTier === 'above100' && styles.filterChipTextActive]}>100K+ RWF</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 1 Card Per Row Product List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyCard}>
          <Sparkles size={36} color={colors.primary} style={{ marginBottom: 10 }} />
          <Text style={styles.emptyTitle}>No matching bottles found</Text>
          <TouchableOpacity
            onPress={() => {
              setSearch('');
              setSelectedCat('ALL');
              setPriceTier('all');
            }}
            style={styles.resetBtn}
          >
            <Text style={styles.resetBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filtered.map((product) => (
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '800',
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
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  resetBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
