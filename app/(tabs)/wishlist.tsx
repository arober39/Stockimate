import { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize } from '../../src/constants/theme';
import { SearchBar, WishlistItem, WishlistItemSkeleton, EmptyState } from '../../src/components';
import { useWishlist } from '../../src/context/WishlistContext';
import type { SearchResult } from '../../src/types/stock';

// Memoize WishlistItem for performance
const MemoizedWishlistItem = memo(WishlistItem);

export default function WishlistScreen() {
  const router = useRouter();
  const { items, isLoading, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddStock = useCallback(async (stock: SearchResult) => {
    if (isInWishlist(stock.symbol)) {
      Alert.alert('Already Added', `${stock.symbol} is already in your wishlist.`);
      return;
    }
    await addToWishlist(stock);
  }, [addToWishlist, isInWishlist]);

  const handleRemoveStock = useCallback((symbol: string) => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove ${symbol} from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromWishlist(symbol),
        },
      ]
    );
  }, [removeFromWishlist]);

  const handleStockPress = useCallback((symbol: string) => {
    router.push('/');
  }, [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
        <Text style={styles.subtitle}>
          {items.length} {items.length === 1 ? 'asset' : 'assets'} tracked
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          onSelectStock={handleAddStock}
          placeholder="Search to add stocks..."
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          items.length === 0 && !isLoading && styles.scrollContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {isLoading ? (
          // Loading skeletons
          <>
            <WishlistItemSkeleton />
            <WishlistItemSkeleton />
            <WishlistItemSkeleton />
          </>
        ) : items.length > 0 ? (
          items.map((item) => (
            <MemoizedWishlistItem
              key={`${item.stock.symbol}-${refreshKey}`}
              stock={item.stock}
              onRemove={() => handleRemoveStock(item.stock.symbol)}
              onPress={() => handleStockPress(item.stock.symbol)}
            />
          ))
        ) : (
          <EmptyState
            icon="heart-outline"
            title="Your wishlist is empty"
            subtitle="Search for stocks, ETFs, or crypto above to add them to your watchlist"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    zIndex: 100,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  scrollContentEmpty: {
    flex: 1,
  },
});
