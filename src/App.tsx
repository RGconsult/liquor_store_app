import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { hydrateStorage } from './services/storage';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';

import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';

import { HomeScreen } from './screens/HomeScreen';
import { CatalogScreen } from './screens/CatalogScreen';
import { CartScreen } from './screens/CartScreen';
import { CheckoutScreen } from './screens/CheckoutScreen';
import { AccountScreen } from './screens/AccountScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { WishlistScreen } from './screens/WishlistScreen';

import { fetchProducts, fetchCategories } from './services/api';
import { Product, LiquorCategory } from './types';
import { colors } from './theme';

export const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [catalogInitialSearch, setCatalogInitialSearch] = useState<string | undefined>(undefined);
  const [catalogInitialCategory, setCatalogInitialCategory] = useState<LiquorCategory | undefined>(undefined);

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchCategories().then(setCategories);
  }, []);

  // Plain tab navigation (bottom nav, header menu, "view all") clears any pending
  // search/category redirect so a fresh visit to Catalog isn't filtered by accident.
  const goToTab = (tab: string) => {
    setCatalogInitialSearch(undefined);
    setCatalogInitialCategory(undefined);
    setActiveTab(tab);
  };

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
      <ExpoStatusBar style="dark" />
      <View style={styles.container}>
        {/* 18+ Mandatory Age Modal */}
        <AgeVerificationModal />

        {/* Sticky Header */}
        <Header activeTab={activeTab} setActiveTab={goToTab} />

        {/* Screen View */}
        <View style={styles.content}>
          {activeTab === 'home' && (
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
  },
});

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
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <NotificationProvider>
            <MainApp />
          </NotificationProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
