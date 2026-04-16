import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../utils/theme';

const CONFIG = {
  AL_DIA:   { label: 'Al Día',   bg: colors.primaryContainer,  text: colors.primary },
  EN_MORA:  { label: 'En Mora',  bg: colors.tertiaryContainer, text: colors.tertiary },
  INACTIVO: { label: 'Inactivo', bg: colors.errorContainer,    text: colors.error },
};

const EstadoBadge = ({ estado, size = 'md' }) => {
  const config = CONFIG[estado] || CONFIG.INACTIVO;
  const isLarge = size === 'lg';

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, isLarge && styles.badgeLg]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.text, { color: config.text }, isLarge && styles.textLg]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            5,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderRadius:   radius.full,
    alignSelf:      'flex-start',
  },
  badgeLg: {
    paddingHorizontal: 14,
    paddingVertical:   7,
  },
  dot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  text: {
    fontSize:   11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textLg: {
    fontSize: 13,
  },
});

export default EstadoBadge;
