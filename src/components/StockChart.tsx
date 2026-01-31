import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize } from '../constants/theme';
import { formatCurrency, formatDate, formatTime } from '../utils/formatters';
import type { ChartDataPoint, TimeFrame } from '../types/stock';

interface StockChartProps {
  data: ChartDataPoint[];
  timeFrame: TimeFrame;
  onScrub?: (point: ChartDataPoint | null) => void;
  isLoading?: boolean;
}

const CHART_HEIGHT = 180;
const PADDING = { top: 10, bottom: 20, left: 10, right: 10 };

export function StockChart({ data, timeFrame, onScrub, isLoading }: StockChartProps) {
  const screenWidth = Dimensions.get('window').width - 32; // Account for parent padding
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartWidth = screenWidth - PADDING.left - PADDING.right;
  const chartHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  // Reset cursor when data changes (new stock or timeframe)
  useEffect(() => {
    setActiveIndex(null);
  }, [data]);

  const { path, minPrice, maxPrice } = useMemo(() => {
    if (data.length < 2) {
      return { path: '', minPrice: 0, maxPrice: 0 };
    }

    const prices = data.map(d => d.value);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = data.map((point, i) => {
      const x = PADDING.left + (i / (data.length - 1)) * chartWidth;
      const y = PADDING.top + chartHeight - ((point.value - min) / range) * chartHeight;
      return { x, y };
    });

    const pathData = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');

    return { path: pathData, minPrice: min, maxPrice: max };
  }, [data, chartWidth, chartHeight]);

  const priceRange = maxPrice - minPrice || 1;

  const isPositive = useMemo(() => {
    if (data.length < 2) return true;
    return data[data.length - 1].value >= data[0].value;
  }, [data]);

  const chartColor = isPositive ? colors.chartGreen : colors.chartRed;

  const getIndexFromX = useCallback((x: number): number => {
    const relativeX = Math.max(0, Math.min(x - PADDING.left, chartWidth));
    const index = Math.round((relativeX / chartWidth) * (data.length - 1));
    return Math.max(0, Math.min(data.length - 1, index));
  }, [data.length, chartWidth]);

  const getPointPosition = useCallback((index: number) => {
    if (data.length === 0 || index < 0 || index >= data.length) return null;

    const x = PADDING.left + (index / (data.length - 1)) * chartWidth;
    const y = PADDING.top + chartHeight - ((data[index].value - minPrice) / priceRange) * chartHeight;

    return { x, y };
  }, [data, chartWidth, chartHeight, minPrice, priceRange]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false, // Don't let other responders take over
    onPanResponderGrant: (evt) => {
      if (data.length === 0) return;
      const x = evt.nativeEvent.locationX;
      const index = getIndexFromX(x);
      setActiveIndex(index);
      onScrub?.(data[index]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onPanResponderMove: (evt) => {
      if (data.length === 0) return;
      // Only track horizontal position - ignore vertical drift
      const x = evt.nativeEvent.locationX;
      const index = getIndexFromX(x);
      if (index !== activeIndex) {
        setActiveIndex(index);
        onScrub?.(data[index]);
        Haptics.selectionAsync();
      }
    },
    onPanResponderRelease: () => {
      // Keep the cursor where it is - don't clear
      // User can tap elsewhere or select a new stock to reset
    },
    onPanResponderTerminate: () => {
      // Keep the cursor where it is
    },
  }), [data, getIndexFromX, activeIndex, onScrub]);

  const activePoint = activeIndex !== null ? getPointPosition(activeIndex) : null;
  const activeData = activeIndex !== null && data[activeIndex] ? data[activeIndex] : null;

  const formatLabel = (timestamp: number) => {
    if (timeFrame === '1D') {
      return formatTime(timestamp);
    }
    return formatDate(timestamp, 'long');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chart...</Text>
        </View>
      </View>
    );
  }

  if (data.length < 2) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No chart data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Price display */}
      <View style={styles.infoContainer}>
        {activeData ? (
          <>
            <Text style={[styles.price, { color: chartColor }]}>
              {formatCurrency(activeData.value)}
            </Text>
            <Text style={styles.date}>{formatLabel(activeData.timestamp)}</Text>
          </>
        ) : (
          <>
            <Text style={[styles.price, { color: chartColor }]}>
              {formatCurrency(data[data.length - 1].value)}
            </Text>
            <Text style={styles.date}>Current</Text>
          </>
        )}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper} {...panResponder.panHandlers}>
        <Svg width={screenWidth} height={CHART_HEIGHT}>
          {/* Chart line */}
          <Path
            d={path}
            stroke={chartColor}
            strokeWidth={2}
            fill="none"
          />

          {/* Active point indicator */}
          {activePoint && (
            <>
              <Line
                x1={activePoint.x}
                y1={PADDING.top}
                x2={activePoint.x}
                y2={CHART_HEIGHT - PADDING.bottom}
                stroke={colors.textSecondary}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              <Circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={6}
                fill={chartColor}
              />
              <Circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={3}
                fill={colors.background}
              />
            </>
          )}
        </Svg>
      </View>

      {/* Price range */}
      <View style={styles.priceRange}>
        <Text style={styles.rangeText}>H: {formatCurrency(maxPrice)}</Text>
        <Text style={styles.rangeText}>L: {formatCurrency(minPrice)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    overflow: 'hidden',
  },
  loadingContainer: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  price: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chartWrapper: {
    height: CHART_HEIGHT,
    overflow: 'hidden',
  },
  priceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  rangeText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
});
