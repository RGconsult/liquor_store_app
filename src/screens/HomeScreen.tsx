import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Product, LiquorCategory } from '../types';
import { HeroCarousel } from '../components/HeroCarousel';
import { CategoryShowcase } from '../components/CategoryShowcase';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductCard } from '../components/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { ColorPalette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

interface HomeScreenProps {
  products: Product[];
  categories: any[];
  onSelectCategory: (cat: LiquorCategory) => void;
  onSearch: (query: string) => void;
  onQuickView: (product: Product) => void;
  onNavigateCatalog: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  products,
  categories,
  onSelectCategory,
  onSearch,
  onQuickView,
  onNavigateCatalog
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    // Drive straight to the full catalog list as soon as the customer starts typing.
    if (text.trim().length > 0) {
      onSearch(text);
    }
  };

  // Home lists the full catalog inline rather than a curated preview — Catalog (via
  // "View All") stays useful for its search/sort/price-tier tools on top of this list.
  const allProductsList = products;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Search size={20} color={colors.primary} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search Whisky, Tequila, Cognac, Wine..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={onNavigateCatalog} style={styles.filterBtn}>
          <SlidersHorizontal size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Hero Banner with background drinks picture */}
      <HeroCarousel onSelectCategory={(cat) => onSelectCategory(cat as LiquorCategory)} />

      {/* Animated, sliding "explore by type" showcase row — comes before the category pills */}
      <CategoryShowcase categories={categories} onSelectCategory={onSelectCategory} />

      {/* Category Pills Filter */}
      <CategoryFilter
        selectedCategory="ALL"
        onSelectCategory={onSelectCategory}
        categoriesWithCount={categories}
      />

      {/* Grid Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Full Cellar</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{products.length} Bottles</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onNavigateCatalog}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Product List - Single Column (1 card per row) */}
      <View style={styles.listContainer}>
        {allProductsList.map((product) => (
          <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
        ))}
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterBtn: {
    padding: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  countBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
  },
  countBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  viewAllText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
});
