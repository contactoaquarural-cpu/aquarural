import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../utils/theme';

const LoadingSpinner = ({ message = 'Cargando...' }) => (
  <View style={styles.container}>
    <ActivityIndicator color={colors.primary} size="large" />
    {message ? <Text style={styles.message}>{message}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.background,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             16,
  },
  message: {
    ...typography.body,
    color: colors.onSurfaceVariant,
  },
});

export default LoadingSpinner;
