import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
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

  // The header elements are memoized so FlatList doesn't remount them on every
  // render (which would reset the search field's cursor position).
  const listHeader = useMemo(() => (
    <>
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
    </>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [searchQuery, colors, categories, products.length]);

  // FlatList only renders the cards currently near the screen — the full catalog
  // (295+ bottles, each with a 260px image) in a plain ScrollView was keeping
  // every node in memory simultaneously, exhausting Android's memory budget and
  // causing OOM kills (the "app closing itself" crashes testers reported).
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      data={products}
      keyExtractor={(product) => product.id}
      renderItem={({ item }) => (
        <View style={styles.listContainer}>
          <ProductCard product={item} onQuickView={onQuickView} />
        </View>
      )}
      ListHeaderComponent={listHeader}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={7}
      removeClippedSubviews
    />
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
