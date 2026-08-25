import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ColorPalette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { itemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'catalog', label: 'Catalog', icon: Compass },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: wishlistIds.length },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: itemCount },
    { id: 'account', label: 'Account', icon: User }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const iconColor = isActive ? colors.primary : colors.textMuted;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <Icon size={20} color={iconColor} strokeWidth={isActive ? 2.5 : 1.8} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {(tab.badge || 0) > 99 ? '99+' : tab.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: isActive ? colors.primary : colors.textMuted, fontWeight: isActive ? '700' : '500' }
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container: {
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: colors.primaryContainer,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: 2,
    backgroundColor: colors.amber,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  label: {
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },
});
