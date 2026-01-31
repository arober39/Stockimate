import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { MiniChart } from './MiniChart';
import { finnhubApi } from '../services/finnhubApi';
import { yahooFinance } from '../services/yahooFinance';
import type { Stock, StockQuote, ChartDataPoint } from '../types/stock';

interface WishlistItemProps {
  stock: Stock;
  onRemove: () => void;
  onPress: () => void;
}

export function WishlistItem({ stock, onRemove, onPress }: WishlistItemProps) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [stock.symbol]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [quoteData, historicalData] = await Promise.all([
        finnhubApi.getQuote(stock.symbol),
        yahooFinance.getHistoricalData(stock.symbol, '1W'),
      ]);
      setQuote(quoteData);
      setChartData(historicalData);
    } catch (error) {
      console.error('Failed to load wishlist item data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isPositive = (quote?.changePercent ?? 0) >= 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftSection}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text style={styles.name} numberOfLines={1}>{stock.name}</Text>
      </View>

      <View style={styles.chartSection}>
        <MiniChart data={chartData} width={70} height={28} />
      </View>

      <View style={styles.rightSection}>
        {isLoading ? (
          <Text style={styles.loadingText}>...</Text>
        ) : quote ? (
          <>
            <Text style={styles.price}>{formatCurrency(quote.price)}</Text>
            <View style={[styles.changeBadge, isPositive ? styles.positive : styles.negative]}>
              <Text style={[styles.changeText, isPositive ? styles.positiveText : styles.negativeText]}>
                {formatPercent(quote.changePercent)}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>N/A</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close-circle" size={22} color={colors.textTertiary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  leftSection: {
    flex: 1,
    marginRight: spacing.sm,
  },
  symbol: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  name: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chartSection: {
    marginHorizontal: spacing.sm,
  },
  rightSection: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  price: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  changeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 4,
  },
  positive: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  negative: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  changeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.error,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  errorText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  removeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});
