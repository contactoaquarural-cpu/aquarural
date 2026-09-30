import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radii, fonts } from '../theme/tokens';

const TAB_ICONOS = {
  Inicio: 'home',
  Ubicacion: 'location-on',
  Facturas: 'receipt-long',
  Perfil: 'person',
};

const TAB_LABELS = {
  Inicio: 'Inicio',
  Ubicacion: 'Ubicación',
  Facturas: 'Facturas',
  Perfil: 'Perfil',
};

// Barra flotante con el tab "Pagar" elevado al centro como botón circular —
// es la acción central del proyecto ("el objetivo es que los suscriptores
// paguen por la app"), así que se le da tratamiento visual distinto al
// resto en vez de competir en igualdad de peso con Inicio/Ubicación/etc.
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const rutas = state.routes.filter((r) => r.name !== 'Pagar');
  const rutaPagar = state.routes.find((r) => r.name === 'Pagar');
  const pagarActivo = state.index === state.routes.findIndex((r) => r.name === 'Pagar');

  const irA = (nombre, esFocused) => {
    const evento = navigation.emit({ type: 'tabPress', target: rutaPagar?.key, canPreventDefault: true });
    if (!esFocused && !evento.defaultPrevented) navigation.navigate(nombre);
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 20 : 8) }]}>
      <View style={styles.barra}>
        {rutas.slice(0, 2).map((route) => {
          const { options } = descriptors[route.key];
          const focused = state.index === state.routes.findIndex((r) => r.key === route.key);
          return (
            <TabBoton
              key={route.key}
              nombre={route.name}
              focused={focused}
              onPress={() => irA(route.name, focused)}
            />
          );
        })}

        <TouchableOpacity
          style={styles.botonCentral}
          activeOpacity={0.85}
          onPress={() => irA('Pagar', pagarActivo)}
        >
          <View style={[styles.botonCentralCirculo, pagarActivo && styles.botonCentralCirculoActivo]}>
            <MaterialIcons name="payments" size={24} color={colors.blanco} />
          </View>
          <Text style={styles.botonCentralLabel}>Pagar</Text>
        </TouchableOpacity>

        {rutas.slice(2, 4).map((route) => {
          const focused = state.index === state.routes.findIndex((r) => r.key === route.key);
          return (
            <TabBoton
              key={route.key}
              nombre={route.name}
              focused={focused}
              onPress={() => irA(route.name, focused)}
            />
          );
        })}
      </View>
    </View>
  );
};

const TabBoton = ({ nombre, focused, onPress }) => (
  <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={onPress}>
    <MaterialIcons
      name={TAB_ICONOS[nombre]}
      size={22}
      color={focused ? colors.azulMarca : colors.textoTenue}
    />
    <Text style={[styles.tabLabel, { color: focused ? colors.azulMarca : colors.textoTenue }]}>
      {TAB_LABELS[nombre]}
    </Text>
    {focused && <View style={styles.puntoActivo} />}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  barra: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.blanco,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  tabLabel: { fontFamily: fonts.headlineSemiBold, fontSize: 10 },
  puntoActivo: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.azulMarca,
  },
  botonCentral: {
    flex: 1,
    alignItems: 'center',
    marginTop: -28,
  },
  botonCentralCirculo: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.azulMarca,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.superficieSutil,
    shadowColor: colors.azulMarca,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  botonCentralCirculoActivo: {
    backgroundColor: colors.azulMarcaHover,
  },
  botonCentralLabel: {
    fontFamily: fonts.headlineBold,
    fontSize: 10,
    color: colors.azulMarca,
    marginTop: 4,
  },
});

export default CustomTabBar;
