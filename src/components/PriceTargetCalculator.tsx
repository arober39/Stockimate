import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { formatCurrency, formatPercent } from '../utils/formatters';

interface PriceTargetCalculatorProps {
  currentPrice: number;
  investmentAmount: number;
  symbol: string;
}

export function PriceTargetCalculator({
  currentPrice,
  investmentAmount,
  symbol,
}: PriceTargetCalculatorProps) {
  const [targetPrice, setTargetPrice] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const calculations = useMemo(() => {
    const target = parseFloat(targetPrice.replace(/[^0-9.]/g, ''));

    if (!target || !currentPrice || currentPrice === 0) {
      return null;
    }

    const shares = investmentAmount / currentPrice;
    const projectedValue = shares * target;
    const projectedProfit = projectedValue - investmentAmount;
    const projectedReturn = ((target - currentPrice) / currentPrice) * 100;

    return {
      shares,
      projectedValue,
      projectedProfit,
      projectedReturn,
      targetPrice: target,
    };
  }, [targetPrice, currentPrice, investmentAmount]);

  const isPositive = (calculations?.projectedProfit ?? 0) >= 0;

  const handleTargetChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    setTargetPrice(cleaned);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="trending-up" size={20} color={colors.primary} />
          <Text style={styles.headerTitle}>Price Target Calculator</Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.content}>
          <Text style={styles.description}>
            What if {symbol} reaches your target price?
          </Text>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Target Price</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                value={targetPrice}
                onChangeText={handleTargetChange}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>
          </View>

          <View style={styles.currentPriceRow}>
            <Text style={styles.currentLabel}>Current Price:</Text>
            <Text style={styles.currentValue}>{formatCurrency(currentPrice)}</Text>
          </View>

          {calculations && (
            <View style={styles.results}>
              <View style={styles.mainResult}>
                <Text style={styles.resultLabel}>Projected Value</Text>
                <Text style={[styles.resultValue, isPositive ? styles.positive : styles.negative]}>
                  {formatCurrency(calculations.projectedValue)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <View style={[styles.badge, isPositive ? styles.badgePositive : styles.badgeNegative]}>
                  <Ionicons
                    name={isPositive ? 'arrow-up' : 'arrow-down'}
                    size={14}
                    color={isPositive ? colors.success : colors.error}
                  />
                  <Text style={[styles.badgeText, isPositive ? styles.positive : styles.negative]}>
                    {formatCurrency(Math.abs(calculations.projectedProfit))} ({formatPercent(calculations.projectedReturn)})
                  </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Investment</Text>
                  <Text style={styles.detailValue}>{formatCurrency(investmentAmount)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Shares</Text>
                  <Text style={styles.detailValue}>{calculations.shares.toFixed(4)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Price Change</Text>
                  <Text style={[styles.detailValue, isPositive ? styles.positive : styles.negative]}>
                    {formatPercent(calculations.projectedReturn)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {!calculations && targetPrice.length > 0 && (
            <Text style={styles.hint}>Enter a valid target price</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inputRow: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  currencySymbol: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '600',
  },
  currentPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  currentLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  currentValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  results: {
    alignItems: 'center',
  },
  mainResult: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  resultLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  resultValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
  },
  resultRow: {
    marginBottom: spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  badgePositive: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  badgeNegative: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.error,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
