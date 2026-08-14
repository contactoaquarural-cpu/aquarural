import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '../utils/theme';

// Screens
import HomeScreen                from '../screens/home/HomeScreen';
import EstadoFinancieroScreen    from '../screens/pagos/EstadoFinancieroScreen';
import HistorialPagosScreen      from '../screens/pagos/HistorialPagosScreen';
import MiPredioScreen            from '../screens/qr/MiPredioScreen';
import PerfilScreen              from '../screens/perfil/PerfilScreen';
import UbicacionFincaScreen      from '../screens/perfil/UbicacionFincaScreen';
import NotificacionesScreen      from '../screens/notificaciones/NotificacionesScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ symbol, label, focused }) => (
  <View style={styles.tabIcon}>
    <MaterialIcons
      name={symbol}
      size={22}
      color={focused ? '#06b6d4' : '#64748b'}
    />
    <Text style={[styles.tabLabel, { color: focused ? '#06b6d4' : '#64748b', fontWeight: focused ? '800' : '600' }]}>
      {label}
    </Text>
  </View>
);

const stackOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: colors.background },
  animationEnabled: true,
};

// ─── Stacks ───────────────────────────────────────────────────────────────────

const HomeStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="HomeMain"         component={HomeScreen} />
    <Stack.Screen name="EstadoFinanciero" component={EstadoFinancieroScreen} />
    <Stack.Screen name="HistorialPagos"   component={HistorialPagosScreen} />
    <Stack.Screen name="Notificaciones"   component={NotificacionesScreen} />
    <Stack.Screen name="MiCarne"          component={MiPredioScreen} />
    <Stack.Screen name="UbicacionFinca"   component={UbicacionFincaScreen} />
  </Stack.Navigator>
);

const PerfilStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="PerfilMain"       component={PerfilScreen} />
    <Stack.Screen name="UbicacionFinca"   component={UbicacionFincaScreen} />
    <Stack.Screen name="HistorialPagos"   component={HistorialPagosScreen} />
    <Stack.Screen name="Notificaciones"   component={NotificacionesScreen} />
  </Stack.Navigator>
);

// ─── Navegador principal AquaRural (5 tabs) ────────────────────────────────────

const MainNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: insets.bottom || spacing.xs, height: 58 + (insets.bottom || 0) },
        ],
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="home" label="Inicio" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="MiPredio"
        component={MiPredioScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="water-drop" label="Predio/QR" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="UbicacionGPS"
        component={UbicacionFincaScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="location-on" label="Ubicación" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Facturas"
        component={EstadoFinancieroScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="receipt-long" label="Facturas" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Perfil"
        component={PerfilStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="person" label="Perfil" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: spacing.xs,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
});

export default MainNavigator;
