import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { LiquorCategory } from '../types';
import { BOTTLE_IMAGES } from '../constants/bottleImages';
import { ColorPalette } from '../theme';
import { useThemedStyles } from '../context/ThemeContext';

interface CategoryShowcaseProps {
  onSelectCategory: (category: LiquorCategory) => void;
}

const SHOWCASE_ITEMS: { id: LiquorCategory; label: string; image: string }[] = [
  { id: 'Whiskey', label: 'Whiskey', image: BOTTLE_IMAGES.Whiskey },
  { id: 'Tequila', label: 'Tequila', image: BOTTLE_IMAGES.Tequila },
  { id: 'Brandy', label: 'Brandy', image: BOTTLE_IMAGES.Brandy },
  { id: 'Gin', label: 'Gin', image: BOTTLE_IMAGES.Gin },
  { id: 'Rum', label: 'Rum', image: BOTTLE_IMAGES.Rum },
  { id: 'Vodka', label: 'Vodka', image: BOTTLE_IMAGES.Vodka },
  { id: 'Wine', label: 'Wine', image: BOTTLE_IMAGES.Wine },
];

// Pixels the strip travels per second. Lower = slower, more relaxed slide.
const SLIDE_SPEED_PX_PER_SEC = 34;

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ onSelectCategory }) => {
  const styles = useThemedStyles(createStyles);
  const translateX = useRef(new Animated.Value(0)).current;
  const [setWidth, setSetWidth] = useState(0);

  useEffect(() => {
    if (setWidth === 0) return;

    translateX.setValue(0);
    const duration = (setWidth / SLIDE_SPEED_PX_PER_SEC) * 1000;
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -setWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [setWidth, translateX]);

  const renderSet = (keyPrefix: string) => (
    <View style={styles.row}>
      {SHOWCASE_ITEMS.map((item) => (
        <TouchableOpacity
          key={`${keyPrefix}-${item.id}`}
          style={styles.item}
          activeOpacity={0.85}
          onPress={() => onSelectCategory(item.id)}
        >
          <View style={styles.imageWrap}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
          </View>
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>EXPLORE BY TYPE</Text>
        <View style={styles.dot} />
        <Text style={styles.subtitle}>Tap a bottle to filter</Text>
      </View>

      <View style={styles.track}>
        <Animated.View
          style={[styles.strip, { transform: [{ translateX }] }]}
          onLayout={(e) => {
            if (setWidth === 0) setSetWidth(e.nativeEvent.layout.width / 2);
          }}
        >
          {renderSet('a')}
          {renderSet('b')}
        </Animated.View>
      </View>
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
    marginBottom: 12,
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
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  strip: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
  },
  item: {
    width: 96,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  imageWrap: {
    width: 96,
    height: 118,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    marginTop: 8,
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
