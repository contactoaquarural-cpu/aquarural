import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../utils/theme';

const ErrorMessage = ({ message = 'Ocurrió un error.', onRetry }) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.btn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={styles.btnText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: colors.background,
    alignItems:      'center',
    justifyContent:  'center',
    padding:         spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.xl,
    padding:         spacing.xl,
    alignItems:      'center',
    gap:             spacing.md,
    width:           '100%',
  },
  icon: {
    fontSize: 36,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    color: colors.onSurfaceVariant,
  },
  btn: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.sm + 2,
    borderRadius:      radius.md,
    marginTop:         spacing.sm,
  },
  btnText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});

export default ErrorMessage;
