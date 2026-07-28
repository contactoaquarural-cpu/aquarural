import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import RootNavigator from './src/navigation/index';
import OfflineBanner from './src/components/OfflineBanner';
import { ThemeProvider, useTheme } from './src/utils/ThemeContext';
import { useConfigStore } from './src/store/config.store';

const AppContent = () => {
  const { isDark, colors } = useTheme();
  const cargarConfig = useConfigStore((s) => s.cargarConfig);

  useEffect(() => { cargarConfig(); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
      <OfflineBanner />
      <RootNavigator />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
