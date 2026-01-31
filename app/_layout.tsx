import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { colors } from '../src/constants/theme';
import { WishlistProvider } from '../src/context/WishlistContext';
import { ErrorBoundary } from '../src/components';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary>
        <WishlistProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
          </Stack>
        </WishlistProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
