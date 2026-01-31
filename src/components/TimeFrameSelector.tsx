import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import type { TimeFrame } from '../types/stock';

const TIME_FRAMES: TimeFrame[] = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '2Y', '5Y', '10Y', 'ALL'];

interface TimeFrameSelectorProps {
  selected: TimeFrame;
  onSelect: (timeFrame: TimeFrame) => void;
}

export function TimeFrameSelector({ selected, onSelect }: TimeFrameSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {TIME_FRAMES.map((tf) => (
        <TouchableOpacity
          key={tf}
          style={[styles.button, selected === tf && styles.buttonSelected]}
          onPress={() => onSelect(tf)}
        >
          <Text style={[styles.buttonText, selected === tf && styles.buttonTextSelected]}>
            {tf}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
  },
  buttonSelected: {
    backgroundColor: colors.surfaceLight,
  },
  buttonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  buttonTextSelected: {
    color: colors.primary,
  },
});
