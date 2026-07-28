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
import MiCarneScreen             from '../screens/qr/MiCarneScreen';
import ConveniosScreen           from '../screens/convenios/ConveniosScreen';
import DetalleConvenioScreen     from '../screens/convenios/DetalleConvenioScreen';
import PerfilScreen              from '../screens/perfil/PerfilScreen';
import EditarPerfilScreen        from '../screens/perfil/EditarPerfilScreen';
import DatosFincaScreen          from '../screens/perfil/DatosFincaScreen';
import UbicacionFincaScreen      from '../screens/perfil/UbicacionFincaScreen';
import NotificacionesScreen      from '../screens/notificaciones/NotificacionesScreen';
import EventosScreen            from '../screens/eventos/EventosScreen';
import MisDocumentosScreen       from '../screens/perfil/MisDocumentosScreen';
import NoticiasScreen            from '../screens/noticias/NoticiasScreen';
import DetalleNoticiaScreen      from '../screens/noticias/DetalleNoticiaScreen';

// Nuevas pantallas — Mercado Ganadero
import MercadoScreen             from '../screens/mercado/MercadoScreen';
import DetallePublicacionScreen  from '../screens/mercado/DetallePublicacionScreen';
import CrearPublicacionScreen    from '../screens/mercado/CrearPublicacionScreen';
import MisPublicacionesScreen    from '../screens/mercado/MisPublicacionesScreen';

// Explorar (Noticias + Ganadero TV + Convenios agrupados)
import ExplorarScreen            from '../screens/explorar/ExplorarScreen';
import ReproductorScreen         from '../screens/ganaderoTV/ReproductorScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ symbol, label, focused }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <MaterialIcons
      name={symbol}
      size={22}
      color={focused ? colors.primary : colors.onSurfaceVariant}
    />
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  </View>
);

const stackOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: colors.background },
  cardOverlayEnabled: false,
  cardShadowEnabled: false,
  animationEnabled: true,
};

// ─── Stacks ───────────────────────────────────────────────────────────────────

const HomeStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="HomeMain"         component={HomeScreen} />
    <Stack.Screen name="EstadoFinanciero" component={EstadoFinancieroScreen} />
    <Stack.Screen name="HistorialPagos"   component={HistorialPagosScreen} />
    <Stack.Screen name="Notificaciones"   component={NotificacionesScreen} />
    <Stack.Screen name="Eventos"          component={EventosScreen} />
  </Stack.Navigator>
);

const MercadoStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="MercadoList"         component={MercadoScreen} />
    <Stack.Screen name="DetallePublicacion"  component={DetallePublicacionScreen} />
    <Stack.Screen name="CrearPublicacion"    component={CrearPublicacionScreen} />
    <Stack.Screen name="MisPublicaciones"    component={MisPublicacionesScreen} />
  </Stack.Navigator>
);

const ExplorarStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="ExplorarMain"    component={ExplorarScreen} />
    <Stack.Screen name="DetalleNoticia"  component={DetalleNoticiaScreen} />
    <Stack.Screen name="DetalleConvenio" component={DetalleConvenioScreen} />
    <Stack.Screen name="Reproductor"     component={ReproductorScreen} />
  </Stack.Navigator>
);

const PerfilStack = () => (
  <Stack.Navigator screenOptions={stackOptions}>
    <Stack.Screen name="PerfilMain"       component={PerfilScreen} />
    <Stack.Screen name="EditarPerfil"     component={EditarPerfilScreen} />
    <Stack.Screen name="DatosFinca"       component={DatosFincaScreen} />
    <Stack.Screen name="UbicacionFinca"   component={UbicacionFincaScreen} />
    <Stack.Screen name="Notificaciones"   component={NotificacionesScreen} />
    <Stack.Screen name="Eventos"          component={EventosScreen} />
    <Stack.Screen name="MisPublicaciones" component={MisPublicacionesScreen} />
    <Stack.Screen name="MisDocumentos"    component={MisDocumentosScreen} />
  </Stack.Navigator>
);

// ─── Navegador principal (5 tabs) ─────────────────────────────────────────────

const MainNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: insets.bottom || spacing.sm, height: 56 + (insets.bottom || 0) },
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
        name="Mercado"
        component={MercadoStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="storefront" label="Mercado" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MiCarne"
        component={MiCarneScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="qr-code-2" label="Mi ID" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Explorar"
        component={ExplorarStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon symbol="explore" label="Explorar" focused={focused} />
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
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('Perfil', { screen: 'PerfilMain' });
          },
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surfaceContainerHigh,
    borderTopWidth:  0,
    paddingTop:      spacing.sm,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIconFocused: {},
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
