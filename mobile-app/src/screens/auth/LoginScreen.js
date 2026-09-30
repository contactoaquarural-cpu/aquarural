import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAcueductosStore } from '../../store/acueductos.store';
import { useAuthStore } from '../../store/auth.store';
import { colors, radii, fonts } from '../../theme/tokens';

const LoginScreen = () => {
  const { acueductos, isLoading: cargandoAcueductos, error: errorAcueductos, cargarAcueductos } =
    useAcueductosStore();
  const { login, error: errorLogin } = useAuthStore();

  const [acueductoSeleccionado, setAcueductoSeleccionado] = useState(null);
  const [busquedaAcueducto, setBusquedaAcueducto] = useState('');
  const [cedula, setCedula] = useState('');
  const [cedulaEnfocada, setCedulaEnfocada] = useState(false);
  const [ingresando, setIngresando] = useState(false);

  useEffect(() => {
    cargarAcueductos();
  }, []);

  const handleIngresar = async () => {
    if (!acueductoSeleccionado || !cedula.trim()) return;
    setIngresando(true);
    await login(acueductoSeleccionado._id, cedula);
    setIngresando(false);
  };

  const puedeIngresar = Boolean(cedula.trim()) && !ingresando;

  // Buscador solo aparece con suficientes acueductos para justificarlo — con
  // pocos (el caso típico hoy), un buscador encima de 2-3 tarjetas es ruido.
  const mostrarBuscador = acueductos.length > 6;
  const query = busquedaAcueducto.trim().toLowerCase();
  const acueductosFiltrados =
    mostrarBuscador && query
      ? acueductos.filter(
          (a) =>
            a.nombre?.toLowerCase().includes(query) ||
            a.municipio?.toLowerCase().includes(query) ||
            a.vereda?.toLowerCase().includes(query)
        )
      : acueductos;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.marca}>
        <View style={styles.marcaIcono}>
          <MaterialIcons name="water-drop" size={26} color={colors.blanco} />
        </View>
        <Text style={styles.titulo}>
          <Text style={styles.tituloAqua}>Aqua</Text>
          <Text style={styles.tituloRural}>Rural</Text>
        </Text>
        <Text style={styles.subtitulo}>Consulta y paga tu acueducto veredal</Text>
      </View>

      <View style={styles.paso}>
        <View style={styles.pasoEncabezado}>
          <View style={styles.pasoNumero}>
            <Text style={styles.pasoNumeroTexto}>1</Text>
          </View>
          <Text style={styles.pasoTitulo}>Selecciona tu acueducto</Text>
        </View>

        {cargandoAcueductos ? (
          <ActivityIndicator style={styles.spacer} color={colors.azulMarca} />
        ) : errorAcueductos ? (
          <View style={styles.bannerError}>
            <MaterialIcons name="error-outline" size={18} color={colors.rojo} />
            <Text style={styles.bannerErrorTexto}>{errorAcueductos}</Text>
          </View>
        ) : (
          <>
            {mostrarBuscador && (
              <View style={styles.buscador}>
                <MaterialIcons name="search" size={18} color={colors.textoTenue} />
                <TextInput
                  style={styles.buscadorInput}
                  placeholder="Buscar por nombre o municipio..."
                  placeholderTextColor={colors.textoTenue}
                  value={busquedaAcueducto}
                  onChangeText={setBusquedaAcueducto}
                />
              </View>
            )}
            <FlatList
              data={acueductosFiltrados}
              keyExtractor={(item) => item._id}
              style={styles.lista}
              scrollEnabled={acueductosFiltrados.length > 4}
              renderItem={({ item }) => {
              const seleccionado = acueductoSeleccionado?._id === item._id;
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.acueductoItem, seleccionado && styles.acueductoItemSeleccionado]}
                  onPress={() => setAcueductoSeleccionado(item)}
                >
                  {item.logoUrl ? (
                    <Image source={{ uri: item.logoUrl }} style={styles.logo} />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <MaterialIcons name="water-drop" size={18} color={colors.textoTenue} />
                    </View>
                  )}
                  <View style={styles.acueductoInfo}>
                    <Text style={styles.acueductoNombre} numberOfLines={1}>
                      {item.nombre}
                    </Text>
                    <Text style={styles.acueductoUbicacion} numberOfLines={1}>
                      {item.vereda ? `${item.vereda}, ` : ''}
                      {item.municipio}
                    </Text>
                  </View>
                  <View style={[styles.check, seleccionado && styles.checkActivo]}>
                    {seleccionado && <MaterialIcons name="check" size={14} color={colors.blanco} />}
                  </View>
                </TouchableOpacity>
              );
            }}
              ListEmptyComponent={
                <View style={styles.vacioContenedor}>
                  <MaterialIcons name="location-off" size={20} color={colors.textoTenue} />
                  <Text style={styles.vacio}>
                    {query ? 'Ningún acueducto coincide con la búsqueda.' : 'No hay acueductos disponibles.'}
                  </Text>
                </View>
              }
            />
          </>
        )}
      </View>

      {acueductoSeleccionado && (
        <View style={styles.paso}>
          <View style={styles.pasoEncabezado}>
            <View style={styles.pasoNumero}>
              <Text style={styles.pasoNumeroTexto}>2</Text>
            </View>
            <Text style={styles.pasoTitulo}>Ingresa tu cédula</Text>
          </View>

          <TextInput
            style={[styles.input, cedulaEnfocada && styles.inputEnfocado]}
            placeholder="Número de cédula"
            placeholderTextColor={colors.textoTenue}
            keyboardType="number-pad"
            value={cedula}
            onChangeText={setCedula}
            onFocus={() => setCedulaEnfocada(true)}
            onBlur={() => setCedulaEnfocada(false)}
          />

          {errorLogin ? (
            <View style={styles.bannerError}>
              <MaterialIcons name="error-outline" size={18} color={colors.rojo} />
              <Text style={styles.bannerErrorTexto}>{errorLogin}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.boton, !puedeIngresar && styles.botonDeshabilitado]}
            onPress={handleIngresar}
            disabled={!puedeIngresar}
          >
            {ingresando ? (
              <ActivityIndicator color={colors.blanco} />
            ) : (
              <>
                <Text style={styles.botonTexto}>Ingresar</Text>
                <MaterialIcons name="arrow-forward" size={18} color={colors.blanco} />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.superficieSutil,
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  marca: {
    alignItems: 'center',
    marginBottom: 40,
  },
  marcaIcono: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.azulMarca,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.azulMarca,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  titulo: {
    fontFamily: fonts.headlineExtraBold,
    fontSize: 26,
    letterSpacing: -0.3,
  },
  tituloAqua: {
    color: colors.textoPrincipal,
  },
  tituloRural: {
    color: colors.azulMarca,
  },
  subtitulo: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textoSecundario,
    marginTop: 6,
    textAlign: 'center',
  },
  paso: {
    marginBottom: 28,
  },
  pasoEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  pasoNumero: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    backgroundColor: colors.azulMarca,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pasoNumeroTexto: {
    fontFamily: fonts.headlineBold,
    fontSize: 11,
    color: colors.blanco,
  },
  pasoTitulo: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 15,
    color: colors.textoPrincipal,
  },
  spacer: { marginVertical: 20 },
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radii.xl,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  buscadorInput: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textoPrincipal,
    paddingVertical: 12,
  },
  vacioContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  vacio: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textoTenue,
  },
  lista: { maxHeight: 280 },
  acueductoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blanco,
    padding: 14,
    borderRadius: radii['2xl'],
    borderWidth: 1,
    borderColor: colors.borde,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  acueductoItemSeleccionado: {
    borderColor: colors.azulMarca,
    backgroundColor: '#EFF6FF',
  },
  logo: { width: 40, height: 40, borderRadius: radii.xl, marginRight: 12 },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: radii.xl,
    marginRight: 12,
    backgroundColor: colors.superficieSutil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acueductoInfo: { flex: 1 },
  acueductoNombre: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: colors.textoPrincipal,
  },
  acueductoUbicacion: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textoSecundario,
    marginTop: 2,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActivo: {
    backgroundColor: colors.azulMarca,
    borderColor: colors.azulMarca,
  },
  input: {
    fontFamily: fonts.bodyMedium,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radii.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textoPrincipal,
    marginBottom: 12,
  },
  inputEnfocado: {
    borderColor: colors.azulMarca,
    borderWidth: 1.5,
  },
  bannerError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.rojoBg,
    borderWidth: 1,
    borderColor: colors.rojoBorde,
    borderRadius: radii['2xl'],
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  bannerErrorTexto: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.rojo,
    flex: 1,
  },
  boton: {
    flexDirection: 'row',
    backgroundColor: colors.azulMarca,
    borderRadius: radii['2xl'],
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.azulMarca,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  botonDeshabilitado: {
    backgroundColor: colors.textoTenue,
    shadowOpacity: 0,
    elevation: 0,
  },
  botonTexto: {
    fontFamily: fonts.headlineSemiBold,
    color: colors.blanco,
    fontSize: 15,
  },
});

export default LoginScreen;
