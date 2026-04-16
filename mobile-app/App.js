import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/index';
import OfflineBanner from './src/components/OfflineBanner';
import { View } from 'react-native';
import { colors } from './src/utils/theme';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <OfflineBanner />
      <RootNavigator />
    </View>
  );
}
