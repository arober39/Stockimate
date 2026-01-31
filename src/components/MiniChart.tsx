import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/theme';
import type { ChartDataPoint } from '../types/stock';

interface MiniChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export function MiniChart({
  data,
  width = 80,
  height = 32,
  strokeWidth = 1.5,
}: MiniChartProps) {
  const { path, isPositive } = useMemo(() => {
    if (data.length < 2) {
      return { path: '', isPositive: true };
    }

    const prices = data.map(d => d.value);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((point, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - min) / range) * chartHeight;
      return { x, y };
    });

    const pathData = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    const positive = data[data.length - 1].value >= data[0].value;

    return { path: pathData, isPositive: positive };
  }, [data, width, height]);

  const chartColor = isPositive ? colors.chartGreen : colors.chartRed;

  if (data.length < 2) {
    return <View style={[styles.container, { width, height }]} />;
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Path
          d={path}
          stroke={chartColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
