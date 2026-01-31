import { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize } from '../../src/constants/theme';
import {
  SearchBar,
  AmountSlider,
  DatePicker,
  ProfitDisplay,
  StockInfo,
  StockChart,
  TimeFrameSelector,
  StockInfoSkeleton,
  ChartSkeleton,
  EmptyState,
  PriceTargetCalculator,
} from '../../src/components';
import { useStockQuote, usePurchasePrice, useHistoricalData } from '../../src/hooks';
import type { SearchResult, Stock, TimeFrame, ChartDataPoint } from '../../src/types/stock';

// Memoized components for performance
const MemoizedStockChart = memo(StockChart);
const MemoizedTimeFrameSelector = memo(TimeFrameSelector);

export default function CalculatorScreen() {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [purchaseDate, setPurchaseDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date;
  });
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1Y');
  const [scrubbedPoint, setScrubbedPoint] = useState<ChartDataPoint | null>(null);

  // Finnhub for real-time quotes
  const { quote, isLoading: quoteLoading } = useStockQuote(selectedStock?.symbol ?? null);

  // Yahoo Finance for historical data
  const { price: historicalPrice, isLoading: priceLoading } = usePurchasePrice(
    selectedStock?.symbol ?? null,
    purchaseDate
  );

  // Yahoo Finance for chart data
  const { data: chartData, isLoading: chartLoading } = useHistoricalData(
    selectedStock?.symbol ?? null,
    timeFrame
  );

  // Use scrubbed price if active, otherwise use historical price from date picker
  const purchasePrice = scrubbedPoint?.value ?? historicalPrice ?? 0;
  const displayDate = scrubbedPoint ? new Date(scrubbedPoint.timestamp) : purchaseDate;

  // Calculate current value
  const currentPrice = quote?.price ?? 0;
  const shares = purchasePrice > 0 ? investmentAmount / purchasePrice : 0;
  const currentValue = shares * currentPrice;

  const handleSelectStock = useCallback((stock: SearchResult) => {
    setSelectedStock(stock);
    setScrubbedPoint(null);
  }, []);

  const handleDateChange = useCallback((date: Date) => {
    setPurchaseDate(date);
    setScrubbedPoint(null);
  }, []);

  const handleTimeFrameChange = useCallback((tf: TimeFrame) => {
    setTimeFrame(tf);
    setScrubbedPoint(null);
  }, []);

  const handleChartScrub = useCallback((point: ChartDataPoint | null) => {
    setScrubbedPoint(point);
    if (point && timeFrame !== '1D') {
      setPurchaseDate(new Date(point.timestamp));
    }
  }, [timeFrame]);

  const isCalculating = quoteLoading || priceLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Stockimate</Text>
            <Text style={styles.subtitle}>Investment Calculator</Text>
          </View>

          <View style={styles.searchContainer}>
            <SearchBar onSelectStock={handleSelectStock} />
          </View>

          {selectedStock && (
            quoteLoading && !quote ? (
              <StockInfoSkeleton />
            ) : (
              <StockInfo
                stock={selectedStock}
                quote={quote}
                isLoading={quoteLoading}
              />
            )
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Calculate Your Returns</Text>

            <AmountSlider
              value={investmentAmount}
              onChange={setInvestmentAmount}
              min={100}
              max={100000}
              step={100}
            />

            <DatePicker
              value={displayDate}
              onChange={handleDateChange}
              label={scrubbedPoint ? "Selected Date (from chart)" : "Purchase Date"}
              maxDate={new Date()}
              minDate={new Date(2000, 0, 1)}
            />

            {selectedStock && (quote || historicalPrice) ? (
              <>
                <ProfitDisplay
                  investmentAmount={investmentAmount}
                  currentValue={currentValue}
                  purchasePrice={purchasePrice}
                  currentPrice={currentPrice}
                  isLoading={isCalculating}
                />
                {currentPrice > 0 && (
                  <PriceTargetCalculator
                    currentPrice={currentPrice}
                    investmentAmount={investmentAmount}
                    symbol={selectedStock.symbol}
                  />
                )}
              </>
            ) : !selectedStock ? (
              <EmptyState
                icon="calculator-outline"
                title="Select a Stock"
                subtitle="Search and select a stock above to calculate potential returns"
              />
            ) : null}
          </View>

          {/* Interactive Chart */}
          {selectedStock && (
            <View style={styles.chartSection}>
              <MemoizedTimeFrameSelector
                selected={timeFrame}
                onSelect={handleTimeFrameChange}
              />
              {chartLoading && chartData.length === 0 ? (
                <ChartSkeleton />
              ) : (
                <MemoizedStockChart
                  data={chartData}
                  timeFrame={timeFrame}
                  onScrub={handleChartScrub}
                  isLoading={chartLoading}
                />
              )}
              <Text style={styles.chartHint}>
                Drag on chart to select a different purchase date
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
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
    marginBottom: spacing.md,
    zIndex: 100,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  chartSection: {
    marginBottom: spacing.md,
  },
  chartHint: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
