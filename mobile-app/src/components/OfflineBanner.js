import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { colors, spacing } from '../utils/theme';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      Animated.timing(opacity, {
        toValue:         offline ? 1 : 0,
        duration:        300,
        useNativeDriver: true,
      }).start();
    });
    return unsubscribe;
  }, []);

  if (!isOffline) return null;

  return (
    <Animated.View style={[styles.banner, { opacity }]}>
      <Text style={styles.text}>Sin conexión a internet</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.tertiaryContainer,
    paddingVertical:   spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems:        'center',
  },
  text: {
    color:      colors.tertiary,
    fontSize:   12,
    fontWeight: '600',
  },
});

export default OfflineBanner;
