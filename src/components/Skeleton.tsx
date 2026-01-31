import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../constants/theme';

interface SkeletonProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width,
  height,
  borderRadius: radius = borderRadius.sm,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function StockInfoSkeleton() {
  return (
    <View style={styles.stockInfoContainer}>
      <View style={styles.stockInfoHeader}>
        <Skeleton width={80} height={24} />
        <Skeleton width={50} height={20} style={{ marginLeft: 8 }} />
      </View>
      <Skeleton width={150} height={16} style={{ marginTop: 4 }} />
      <View style={styles.stockInfoPrice}>
        <Skeleton width={100} height={32} />
        <Skeleton width={80} height={24} />
      </View>
    </View>
  );
}

export function ChartSkeleton() {
  return (
    <View style={styles.chartContainer}>
      <Skeleton width={100} height={24} style={{ alignSelf: 'center' }} />
      <Skeleton width="100%" height={180} style={{ marginTop: 12 }} borderRadius={8} />
      <View style={styles.chartRange}>
        <Skeleton width={60} height={14} />
        <Skeleton width={60} height={14} />
      </View>
    </View>
  );
}

export function WishlistItemSkeleton() {
  return (
    <View style={styles.wishlistItem}>
      <View style={styles.wishlistLeft}>
        <Skeleton width={60} height={18} />
        <Skeleton width={100} height={14} style={{ marginTop: 4 }} />
      </View>
      <Skeleton width={70} height={28} />
      <View style={styles.wishlistRight}>
        <Skeleton width={70} height={18} />
        <Skeleton width={50} height={20} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceLight,
  },
  stockInfoContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    marginBottom: 12,
  },
  stockInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockInfoPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  chartRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 16,
    marginBottom: 8,
  },
  wishlistLeft: {
    flex: 1,
  },
  wishlistRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
});
