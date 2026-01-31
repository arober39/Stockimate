import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { formatCurrency, formatPercent } from '../utils/formatters';
import type { Stock, StockQuote } from '../types/stock';

interface StockInfoProps {
  stock: Stock;
  quote: StockQuote | null;
  isLoading?: boolean;
}

export function StockInfo({ stock, quote, isLoading }: StockInfoProps) {
  const isPositive = (quote?.change ?? 0) >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text style={styles.symbol}>{stock.symbol}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{stock.type.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.name} numberOfLines={1}>{stock.name}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quote...</Text>
        </View>
      ) : quote ? (
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatCurrency(quote.price)}</Text>
          <View style={[styles.changeBadge, isPositive ? styles.positive : styles.negative]}>
            <Ionicons
              name={isPositive ? 'caret-up' : 'caret-down'}
              size={14}
              color={isPositive ? colors.success : colors.error}
            />
            <Text style={[styles.changeText, isPositive ? styles.positiveText : styles.negativeText]}>
              {formatCurrency(Math.abs(quote.change))} ({formatPercent(quote.changePercent)})
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No quote available</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  symbol: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  typeBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  name: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  loadingContainer: {
    paddingVertical: spacing.sm,
  },
  loadingText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  positive: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  negative: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  changeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  positiveText: {
    color: colors.success,
  },
  negativeText: {
    color: colors.error,
  },
});
