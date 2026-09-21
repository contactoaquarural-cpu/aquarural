import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth.store';
import LoginScreen from '../screens/auth/LoginScreen';

const Stack = createNativeStackNavigator();

// Placeholder temporal — se reemplaza por el stack de tabs (Inicio, Pagar,
// Ubicación, Facturas, Perfil) en las siguientes fases del plan.
const InicioPlaceholder = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderTexto}>Sesión iniciada. Próximo: Inicio.</Text>
  </View>
);

const RootNavigator = () => {
  const { isAuthenticated, isLoading, cargarSesion } = useAuthStore();

  useEffect(() => {
    cargarSesion();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.cargando}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Inicio" component={InicioPlaceholder} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  cargando: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  placeholderTexto: { fontSize: 14, color: '#334155' },
});

export default RootNavigator;
