import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Modal, Pressable } from 'react-native';
import { PhoneCall, ShoppingBag, Heart, Bell, Menu, ChevronRight, MessageCircle } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useNotifications } from '../context/NotificationContext';
import { useChat } from '../context/ChatContext';
import { ColorPalette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { itemCount } = useCart();
  const { wishlistIds } = useWishlist();
  const { unreadCount } = useNotifications();
  const { unreadCount: chatUnreadCount } = useChat();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCall = () => {
    setMenuOpen(false);
    Linking.openURL('tel:+250783523034');
  };

  const goTo = (tab: string) => {
    setMenuOpen(false);
    setActiveTab(tab);
  };

  const totalAlerts = unreadCount + wishlistIds.length + itemCount + chatUnreadCount;

  const menuItems = [
    { key: 'call', label: 'Call the Store', icon: PhoneCall, onPress: handleCall, count: 0 },
    { key: 'chat', label: 'Chat with Us', icon: MessageCircle, onPress: () => goTo('chat'), count: chatUnreadCount },
    { key: 'notifications', label: 'Notifications', icon: Bell, onPress: () => goTo('notifications'), count: unreadCount },
    { key: 'wishlist', label: 'Wishlist', icon: Heart, onPress: () => goTo('wishlist'), count: wishlistIds.length },
    { key: 'cart', label: 'Shopping Bag', icon: ShoppingBag, onPress: () => goTo('cart'), count: itemCount }
  ];

  return (
    <View style={styles.header}>
      {/* Wordmark logo — matches the storefront signage (no glass icon) */}
      <TouchableOpacity
        onPress={() => setActiveTab('home')}
        style={styles.brandContainer}
        activeOpacity={0.8}
      >
        <View style={styles.titleColumn}>
          <Text style={styles.brandWine} numberOfLines={1}>WINES</Text>
          <Text style={styles.brandLiquor} numberOfLines={1}>& LIQUOR JOINT</Text>
          <View style={styles.statusRow}>
            <View style={styles.openDot} />
            <Text style={styles.statusText} numberOfLines={1}>Kigali Cellar • OPEN</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Single consolidated menu for call / notifications / wishlist / cart */}
      <TouchableOpacity
        style={[styles.menuBtn, menuOpen && styles.menuBtnActive]}
        onPress={() => setMenuOpen(true)}
        activeOpacity={0.75}
      >
        <Menu size={20} color={menuOpen ? '#ffffff' : colors.text} />
        {totalAlerts > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalAlerts > 99 ? '99+' : totalAlerts}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.dropdown} onPress={(e) => e.stopPropagation()}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.dropdownItem, isActive && styles.dropdownItemActive]}
                  onPress={item.onPress}
                  activeOpacity={0.75}
                >
                  <View style={styles.dropdownItemLeft}>
                    <View style={[styles.dropdownIconBox, isActive && styles.dropdownIconBoxActive]}>
                      <Icon size={18} color={isActive ? '#ffffff' : colors.primary} />
                    </View>
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </View>

                  <View style={styles.dropdownItemRight}>
                    {item.count > 0 && (
                      <View style={styles.dropdownCount}>
                        <Text style={styles.dropdownCountText}>{item.count > 99 ? '99+' : item.count}</Text>
                      </View>
                    )}
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  titleColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  brandWine: {
    color: colors.primary, // Teal Green #1b5e53 from website
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  brandLiquor: {
    color: colors.amber,   // Warm Amber #d84315 from website
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0.3,
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    marginRight: 4,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  menuBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.amber,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'flex-end',
  },
  dropdown: {
    marginTop: 64,
    marginRight: 12,
    width: 240,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  dropdownItemActive: {
    backgroundColor: colors.primaryContainer,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dropdownIconBoxActive: {
    backgroundColor: colors.primary,
  },
  dropdownItemText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownCount: {
    backgroundColor: colors.amber,
    borderRadius: 8,
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignItems: 'center',
  },
  dropdownCountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
});
