import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LiquorCategory } from '../types';
import { ColorPalette } from '../theme';
import { useThemedStyles } from '../context/ThemeContext';

interface CategoryFilterProps {
  selectedCategory: LiquorCategory;
  onSelectCategory: (category: LiquorCategory) => void;
  categoriesWithCount?: { name: string; productCount: number }[];
}

export const CATEGORY_LIST: { id: LiquorCategory; label: string }[] = [
  { id: 'ALL', label: 'All Bottles' },
  { id: 'Brandy', label: 'Brandy' },
  { id: 'Gin', label: 'Gin' },
  { id: 'Rum', label: 'Rum' },
  { id: 'Tequila', label: 'Tequila' },
  { id: 'Vodka', label: 'Vodka' },
  { id: 'Whiskey', label: 'Whiskey' },
  { id: 'Wine', label: 'Wine' }
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoriesWithCount = []
}) => {
  const styles = useThemedStyles(createStyles);

  // Keep the currently selected category pinned right after "All Bottles" so it's
  // always visible without needing to scroll the row to find it.
  const orderedList = useMemo(() => {
    if (selectedCategory === 'ALL') return CATEGORY_LIST;
    const allItem = CATEGORY_LIST.find((c) => c.id === 'ALL')!;
    const selectedItem = CATEGORY_LIST.find((c) => c.id === selectedCategory);
    if (!selectedItem) return CATEGORY_LIST;
    const rest = CATEGORY_LIST.filter((c) => c.id !== 'ALL' && c.id !== selectedCategory);
    return [allItem, selectedItem, ...rest];
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>CATEGORIES</Text>
        <View style={styles.dot} />
        <Text style={styles.subtitle}>7 Liquor Types</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
        {orderedList.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const countItem = categoriesWithCount.find(
            (c) => c.name.toLowerCase() === cat.id.toLowerCase()
          );
          const count = countItem ? countItem.productCount : null;

          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => onSelectCategory(cat.id)}
              style={[styles.pill, isActive ? styles.pillActive : styles.pillInactive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, isActive ? styles.pillTextActive : styles.pillTextInactive]}>
                {cat.label}
              </Text>
              {count !== null && (
                <View style={[styles.countBadge, isActive ? styles.countBadgeActive : styles.countBadgeInactive]}>
                  <Text style={[styles.countText, isActive ? styles.countTextActive : styles.countTextInactive]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginHorizontal: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
  },
  scrollList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillInactive: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
  },
  pillText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  pillTextInactive: {
    color: colors.text,
  },
  countBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  countBadgeInactive: {
    backgroundColor: colors.primaryContainer,
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
  },
  countTextActive: {
    color: '#ffffff',
  },
  countTextInactive: {
    color: colors.primary,
  },
});
