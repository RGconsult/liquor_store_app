import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Sparkles, Truck, ChevronRight } from 'lucide-react-native';
import { ColorPalette } from '../theme';
import { useTheme, useThemedStyles } from '../context/ThemeContext';

interface HeroCarouselProps {
  onSelectCategory: (cat: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onSelectCategory }) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      id: 1,
      tag: 'OUR SELECTION',
      title: 'Wines & Spirits, Done Right',
      subtitle: 'A trusted range of authentic wines, whiskeys, and spirits, all in one store.',
      category: 'ALL',
      cta: 'Browse Store',
      bgImage: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 2,
      tag: 'FAST DELIVERY',
      title: 'Delivered To Your Door',
      subtitle: 'Order from your phone and get fast, reliable delivery across Kigali.',
      category: 'ALL',
      cta: 'Order Now',
      bgImage: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 3,
      tag: 'TRUSTED SERVICE',
      title: 'Genuine Bottles, Every Time',
      subtitle: 'Every order is handled with care, so what you order is what arrives.',
      category: 'ALL',
      cta: 'Start Shopping',
      bgImage: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1000&q=80'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const active = slides[slide];

  return (
    <View style={styles.cardContainer}>
      <ImageBackground
        source={{ uri: active.bgImage }}
        style={styles.bgImage}
        imageStyle={styles.imageStyle}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Top Tag & Indicator */}
          <View style={styles.topRow}>
            <View style={styles.tagBadge}>
              <Sparkles size={14} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.tagText}>{active.tag}</Text>
            </View>
            <View style={styles.indicatorBadge}>
              <Text style={styles.indicatorText}>{slide + 1} / {slides.length}</Text>
            </View>
          </View>

          {/* Title & Subtitle */}
          <View style={styles.contentSection}>
            <Text style={styles.title}>{active.title}</Text>
            <Text style={styles.subtitle}>{active.subtitle}</Text>
          </View>

          {/* Bottom Action Row */}
          <View style={styles.bottomRow}>
            <TouchableOpacity
              onPress={() => onSelectCategory(active.category)}
              style={styles.exploreBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>{active.cta}</Text>
              <ChevronRight size={16} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.deliveryRow}>
              <Truck size={15} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.deliveryText}>+250 783 523 034</Text>
            </View>
          </View>

          {/* Carousel Pagination Dots */}
          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSlide(i)}
                style={[styles.dot, i === slide ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginVertical: 14,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bgImage: {
    width: '100%',
    minHeight: 210,
  },
  imageStyle: {
    borderRadius: 22,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 16, 14, 0.82)',
    padding: 20,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryContainer,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
  },
  tagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  indicatorBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  indicatorText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  contentSection: {
    marginBottom: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 28,
  },
  subtitle: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark, // #1b5e53
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    marginRight: 6,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  deliveryText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
