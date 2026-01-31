import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize } from '../constants/theme';
import { formatCurrency } from '../utils/formatters';

interface AmountSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function AmountSlider({
  value,
  onChange,
  min = 100,
  max = 100000,
  step = 100,
}: AmountSliderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState(value.toString());

  const handleSliderChange = (newValue: number) => {
    const steppedValue = Math.round(newValue / step) * step;
    onChange(steppedValue);
  };

  const handleSlidingComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTextSubmit = () => {
    const numValue = parseInt(textValue.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue));
      const steppedValue = Math.round(clampedValue / step) * step;
      onChange(steppedValue);
      setTextValue(steppedValue.toString());
    }
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Investment Amount</Text>

      <Pressable onPress={() => setIsEditing(true)} style={styles.valueContainer}>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={textValue}
            onChangeText={setTextValue}
            onBlur={handleTextSubmit}
            onSubmitEditing={handleTextSubmit}
            keyboardType="numeric"
            autoFocus
            selectTextOnFocus
          />
        ) : (
          <Text style={styles.value}>{formatCurrency(value)}</Text>
        )}
      </Pressable>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          value={value}
          onValueChange={handleSliderChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.surfaceLight}
          thumbTintColor={colors.primary}
          step={step}
        />
      </View>

      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{formatCurrency(min)}</Text>
        <Text style={styles.rangeLabel}>{formatCurrency(max)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  value: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  input: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    minWidth: 150,
    padding: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  sliderContainer: {
    paddingHorizontal: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  rangeLabel: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
});
