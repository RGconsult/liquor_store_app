import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { RefreshCw } from 'lucide-react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { hydrateStorage } from './services/storage';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider, useTheme, useThemedStyles } from './context/ThemeContext';

import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';

import { HomeScreen } from './screens/HomeScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { CartScreen } from './screens/CartScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { AccountScreen } from './screens/AccountScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { WishlistScreen } from './screens/WishlistScreen';
import { ChatScreen } from './screens/ChatScreen';
import { AuthGateScreen } from './screens/AuthGateScreen';
import { ThemeChoiceScreen } from './screens/ThemeChoiceScreen';

import { fetchProducts, fetchCategories } from './services/api';
import { Product, LiquorCategory } from './types';
import { lightColors, ColorPalette } from './theme';

export const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { registerOnAdd } = useCart();
  const { colors, resolvedScheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [catalogInitialSearch, setCatalogInitialSearch] = useState<string | undefined>(undefined);
  const [catalogInitialCategory, setCatalogInitialCategory] = useState<LiquorCategory | undefined>(undefined);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadStorefront = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const [productList, categoryList] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(productList);
      setCategories(categoryList);
    } catch (e: any) {
      setLoadError(e?.message || 'Could not reach the store. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStorefront();
  }, [loadStorefront]);

  // Plain tab navigation (bottom nav, header menu, "view all") clears any pending
  // search/category redirect so a fresh visit to Catalog isn't filtered by accident.
  const goToTab = (tab: string) => {
    setCatalogInitialSearch(undefined);
    setCatalogInitialCategory(undefined);
    setActiveTab(tab);
  };

  // Land on the cart right after anything is added, so the user can see it's there.
  useEffect(() => {
    registerOnAdd(() => goToTab('cart'));
    return () => registerOnAdd(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectCategory = (cat: LiquorCategory) => {
    setCatalogInitialSearch(undefined);
    setCatalogInitialCategory(cat);
    setActiveTab('catalog');
  };

  const handleSearchFromHome = (query: string) => {
    setCatalogInitialCategory(undefined);
    setCatalogInitialSearch(query);
    setActiveTab('catalog');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.container}>
        {/* Sticky Header */}
        <Header activeTab={activeTab} setActiveTab={goToTab} />

        {/* Screen View */}
        <View style={styles.content}>
          {isLoading && products.length === 0 && (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {!isLoading && loadError && products.length === 0 && (
            <View style={styles.centerState}>
              <Text style={styles.errorTitle}>Couldn't load the store</Text>
              <Text style={styles.errorMessage}>{loadError}</Text>
              <TouchableOpacity onPress={loadStorefront} style={styles.retryBtn} activeOpacity={0.85}>
                <RefreshCw size={16} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {(!isLoading && (products.length > 0 || !loadError)) && activeTab === 'home' && (
            <HomeScreen
              products={products}
              categories={categories}
              onSelectCategory={handleSelectCategory}
              onSearch={handleSearchFromHome}
              onQuickView={(p) => setQuickViewProduct(p)}
              onNavigateCatalog={() => goToTab('catalog')}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogScreen
              products={products}
              categories={categories}
              onQuickView={(p) => setQuickViewProduct(p)}
              initialSearch={catalogInitialSearch}
              initialCategory={catalogInitialCategory}
              autoFocusSearch={Boolean(catalogInitialSearch)}
            />
          )}

          {activeTab === 'cart' && (
            <CartScreen
              onNavigateCheckout={() => goToTab('checkout')}
              onNavigateCatalog={() => goToTab('catalog')}
            />
          )}

          {activeTab === 'checkout' && (
            <CheckoutScreen
              onNavigateHome={() => goToTab('home')}
              onNavigateAccount={() => goToTab('account')}
            />
          )}

          {activeTab === 'account' && (
            <AccountScreen
              products={products}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          )}

          {activeTab === 'notifications' && <NotificationsScreen />}

          {activeTab === 'chat' && <ChatScreen />}

          {activeTab === 'wishlist' && (
            <WishlistScreen
              products={products}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          )}
        </View>

        {/* Quick View Detail Modal */}
        <ProductQuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />

        {/* Mobile Navigation Tab Bar */}
        <BottomNavigation activeTab={activeTab} setActiveTab={goToTab} />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});

// Requires a signed-in user before any storefront content (Home, Catalog, etc.)
// is reachable — shows the sign-in/sign-up form until that's true. A brand new
// signup is then walked through a one-time appearance choice before entering.
const AuthGate: React.FC = () => {
  const { user, isLoading, justSignedUp, clearJustSignedUp } = useAuth();
  const { applyRemoteMode, systemColors } = useTheme();

  // Once we know who's signed in, adopt whatever appearance they'd already
  // chosen on file — so it follows them to a new device or after a reinstall.
  useEffect(() => {
    if (user?.themeMode) applyRemoteMode(user.themeMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.themeMode]);

  if (isLoading) {
    // We don't yet know whether anyone's signed in, so there's no account
    // preference to honor — match the phone's system appearance.
    return (
      <View style={{ flex: 1, backgroundColor: systemColors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={systemColors.primary} />
      </View>
    );
  }

  if (!user) {
    return <AuthGateScreen />;
  }

  if (justSignedUp) {
    return <ThemeChoiceScreen onDone={clearJustSignedUp} />;
  }

  return (
    <CartProvider userId={user.id}>
      <WishlistProvider>
        <NotificationProvider>
          <ChatProvider>
            <MainApp />
          </ChatProvider>
        </NotificationProvider>
      </WishlistProvider>
    </CartProvider>
  );
};

export default function App() {
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    hydrateStorage()
      .then(() => setStorageReady(true))
      .catch((err) => {
        console.warn('Storage hydration failed, continuing without cache:', err);
        setStorageReady(true); // still render the app
      });
  }, []);

  if (!storageReady) {
    // Theme preference hasn't been hydrated from storage yet — fall back to
    // the default light palette for this one brief frame.
    return (
      <View style={{ flex: 1, backgroundColor: lightColors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={lightColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
