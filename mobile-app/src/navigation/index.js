import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/auth.store';
import SplashScreen from '../screens/splash/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import EventosScreen from '../screens/eventos/EventosScreen';
import NotificacionesScreen from '../screens/notificaciones/NotificacionesScreen';
import PagarScreen from '../screens/pagos/PagarScreen';
import UbicacionScreen from '../screens/ubicacion/UbicacionScreen';
import FacturasScreen from '../screens/facturas/FacturasScreen';
import PerfilScreen from '../screens/perfil/PerfilScreen';
import CustomTabBar from './CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Inicio" component={HomeScreen} />
    <Tab.Screen name="Ubicacion" component={UbicacionScreen} options={{ title: 'Ubicación' }} />
    <Tab.Screen name="Pagar" component={PagarScreen} />
    <Tab.Screen name="Facturas" component={FacturasScreen} />
    <Tab.Screen name="Perfil" component={PerfilScreen} />
  </Tab.Navigator>
);

const RootNavigator = () => {
  const { isAuthenticated, isLoading, cargarSesion } = useAuthStore();

  useEffect(() => {
    cargarSesion();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Eventos" component={EventosScreen} />
            <Stack.Screen name="Notificaciones" component={NotificacionesScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
