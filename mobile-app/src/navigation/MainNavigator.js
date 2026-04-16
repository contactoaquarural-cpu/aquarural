import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, spacing } from '../utils/theme';

// Screens
import HomeScreen                from '../screens/home/HomeScreen';
import EstadoFinancieroScreen    from '../screens/pagos/EstadoFinancieroScreen';
import HistorialPagosScreen      from '../screens/pagos/HistorialPagosScreen';
import PagoScreen                from '../screens/pagos/PagoScreen';
import MiCarneScreen             from '../screens/qr/MiCarneScreen';
import ConveniosScreen           from '../screens/convenios/ConveniosScreen';
import DetalleConvenioScreen     from '../screens/convenios/DetalleConvenioScreen';
import PerfilScreen              from '../screens/perfil/PerfilScreen';
import EditarPerfilScreen        from '../screens/perfil/EditarPerfilScreen';
import DatosFincaScreen          from '../screens/perfil/DatosFincaScreen';
import NotificacionesScreen      from '../screens/notificaciones/NotificacionesScreen';
import NoticiasScreen           from '../screens/noticias/NoticiasScreen';
import DetalleNoticiaScreen     from '../screens/noticias/DetalleNoticiaScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// Icono de tab personalizado (texto + símbolo)
const TabIcon = ({ symbol, label, focused }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <Text style={[styles.tabSymbol, focused && styles.tabSymbolFocused]}>
      {symbol}
    </Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  </View>
);

// Stack de Pagos (anidado dentro del tab)
const PagosStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="EstadoFinanciero" component={EstadoFinancieroScreen} />
    <Stack.Screen name="HistorialPagos"   component={HistorialPagosScreen} />
    <Stack.Screen name="Pago"             component={PagoScreen} />
  </Stack.Navigator>
);

// Stack de Noticias
const NoticiasStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="NoticiasList"    component={NoticiasScreen} />
    <Stack.Screen name="DetalleNoticia"  component={DetalleNoticiaScreen} />
  </Stack.Navigator>
);

// Stack de Convenios
const ConveniosStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ConveniosList"  component={ConveniosScreen} />
    <Stack.Screen name="DetalleConvenio" component={DetalleConvenioScreen} />
  </Stack.Navigator>
);

// Stack de Perfil
const PerfilStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PerfilMain"    component={PerfilScreen} />
    <Stack.Screen name="EditarPerfil"  component={EditarPerfilScreen} />
    <Stack.Screen name="DatosFinca"    component={DatosFincaScreen} />
    <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
  </Stack.Navigator>
);

const MainNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
    }}
  >
    <Tab.Screen
      name="Inicio"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon symbol="home" label="Inicio" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Pagos"
      component={PagosStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon symbol="payments" label="Pagos" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="MiCarne"
      component={MiCarneScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon symbol="qr_code_2" label="Carné" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Beneficios"
      component={ConveniosStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon symbol="storefront" label="Beneficios" focused={focused} />
        ),
      }}
    />
    <Tab.Screen
      name="Noticias"
      component={NoticiasStack}
      options={{
        tabBarIcon: ({ focused }) => (
          <TabIcon symbol="newspaper" label="Noticias" focused={focused} />
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

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor:  colors.surfaceContainerHigh,
    borderTopWidth:   0,
    height:           72,
    paddingBottom:    spacing.sm,
    paddingTop:       spacing.sm,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIconFocused: {},
  tabSymbol: {
    fontFamily: 'material-symbols',
    fontSize: 22,
    color: colors.onSurfaceVariant,
  },
  tabSymbolFocused: {
    color: colors.primary,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.3,
  },
  tabLabelFocused: {
    color: colors.primary,
  },
});

export default MainNavigator;
