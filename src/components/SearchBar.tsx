import { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../constants/theme';
import { useStockSearch } from '../hooks';
import type { SearchResult } from '../types/stock';

interface SearchBarProps {
  onSelectStock: (stock: SearchResult) => void;
  placeholder?: string;
}

export function SearchBar({ onSelectStock, placeholder = 'Search stocks, ETFs, crypto...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { results, isLoading, search, clearResults } = useStockSearch();

  const handleChangeText = (text: string) => {
    setQuery(text);
    search(text);
  };

  const handleSelectStock = (stock: SearchResult) => {
    setQuery('');
    clearResults();
    Keyboard.dismiss();
    setIsFocused(false);
    onSelectStock(stock);
  };

  const handleClear = () => {
    setQuery('');
    clearResults();
    inputRef.current?.focus();
  };

  const showResults = isFocused && (results.length > 0 || isLoading);

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
        />
        {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {results.length > 0 ? (
              results.map((item) => (
                <TouchableOpacity
                  key={item.symbol}
                  style={styles.resultItem}
                  onPress={() => handleSelectStock(item)}
                >
                  <View style={styles.resultLeft}>
                    <Text style={styles.symbol}>{item.symbol}</Text>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : !isLoading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 50,
    gap: spacing.sm,
  },
  inputFocused: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  resultsContainer: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    maxHeight: 300,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  resultLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  symbol: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  name: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
