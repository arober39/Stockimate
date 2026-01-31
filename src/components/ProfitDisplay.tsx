import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface ProfitDisplayProps {
  investmentAmount: number;
  currentValue: number;
  purchasePrice: number;
  currentPrice: number;
  isLoading?: boolean;
}

export function ProfitDisplay({
  investmentAmount,
  currentValue,
  purchasePrice,
  currentPrice,
  isLoading = false,
}: ProfitDisplayProps) {
  const profit = currentValue - investmentAmount;
  const percentChange = investmentAmount > 0 ? ((currentValue - investmentAmount) / investmentAmount) * 100 : 0;
  const isPositive = profit >= 0;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Calculating...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainResult}>
        <Text style={styles.label}>Estimated Value Today</Text>
        <Text style={[styles.value, isPositive ? styles.positive : styles.negative]}>
          {formatCurrency(currentValue)}
        </Text>
      </View>

      <View style={styles.profitRow}>
        <View style={[styles.profitBadge, isPositive ? styles.profitBadgePositive : styles.profitBadgeNegative]}>
          <Ionicons
            name={isPositive ? 'arrow-up' : 'arrow-down'}
            size={16}
            color={isPositive ? colors.success : colors.error}
          />
          <Text style={[styles.profitText, isPositive ? styles.positive : styles.negative]}>
            {formatCurrency(Math.abs(profit))} ({formatPercent(percentChange)})
          </Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Invested</Text>
          <Text style={styles.detailValue}>{formatCurrency(investmentAmount)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Buy Price</Text>
          <Text style={styles.detailValue}>{formatCurrency(purchasePrice)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Current Price</Text>
          <Text style={styles.detailValue}>{formatCurrency(currentPrice)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Shares</Text>
          <Text style={styles.detailValue}>
            {purchasePrice > 0 ? (investmentAmount / purchasePrice).toFixed(4) : '0'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  loadingBox: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  mainResult: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.error,
  },
  profitRow: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  profitBadgePositive: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  profitBadgeNegative: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  profitText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  detailItem: {
    width: '50%',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
});
