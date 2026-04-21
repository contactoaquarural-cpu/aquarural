import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { spacing } from '../utils/theme';

const LoadingSpinner = ({ message = 'Cargando...' }) => {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} size="large" />
      {message ? <Text style={[typography.body, { color: colors.onSurfaceVariant }]}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             spacing.md,
  },
});

export default LoadingSpinner;
