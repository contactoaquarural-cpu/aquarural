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
import { useAcueductosStore } from '../../store/acueductos.store';
import { useAuthStore } from '../../store/auth.store';

const LoginScreen = () => {
  const { acueductos, isLoading: cargandoAcueductos, error: errorAcueductos, cargarAcueductos } =
    useAcueductosStore();
  const { login, error: errorLogin } = useAuthStore();

  const [acueductoSeleccionado, setAcueductoSeleccionado] = useState(null);
  const [cedula, setCedula] = useState('');
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.titulo}>AquaRural</Text>
        <Text style={styles.subtitulo}>Consulta y paga tu acueducto veredal</Text>
      </View>

      {/* Paso 1: elegir acueducto */}
      <Text style={styles.label}>1. Selecciona tu acueducto</Text>
      {cargandoAcueductos ? (
        <ActivityIndicator style={styles.spacer} />
      ) : errorAcueductos ? (
        <Text style={styles.error}>{errorAcueductos}</Text>
      ) : (
        <FlatList
          data={acueductos}
          keyExtractor={(item) => item._id}
          style={styles.lista}
          renderItem={({ item }) => {
            const seleccionado = acueductoSeleccionado?._id === item._id;
            return (
              <TouchableOpacity
                style={[styles.acueductoItem, seleccionado && styles.acueductoItemSeleccionado]}
                onPress={() => setAcueductoSeleccionado(item)}
              >
                {item.logoUrl ? (
                  <Image source={{ uri: item.logoUrl }} style={styles.logo} />
                ) : (
                  <View style={styles.logoPlaceholder} />
                )}
                <View style={styles.acueductoInfo}>
                  <Text style={styles.acueductoNombre}>{item.nombre}</Text>
                  <Text style={styles.acueductoUbicacion}>
                    {item.vereda ? `${item.vereda}, ` : ''}
                    {item.municipio}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.vacio}>No hay acueductos disponibles.</Text>}
        />
      )}

      {/* Paso 2: cédula — solo se habilita tras elegir acueducto */}
      {acueductoSeleccionado && (
        <View style={styles.pasoDos}>
          <Text style={styles.label}>2. Ingresa tu cédula</Text>
          <TextInput
            style={styles.input}
            placeholder="Número de cédula"
            keyboardType="number-pad"
            value={cedula}
            onChangeText={setCedula}
          />

          {errorLogin ? <Text style={styles.error}>{errorLogin}</Text> : null}

          <TouchableOpacity
            style={[styles.boton, (!cedula.trim() || ingresando) && styles.botonDeshabilitado]}
            onPress={handleIngresar}
            disabled={!cedula.trim() || ingresando}
          >
            {ingresando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonTexto}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 60 },
  header: { marginBottom: 24 },
  titulo: { fontSize: 28, fontWeight: '800', color: '#1D4ED8' },
  subtitulo: { fontSize: 13, color: '#64748b', marginTop: 4 },
  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 10 },
  lista: { maxHeight: 220 },
  spacer: { marginVertical: 20 },
  vacio: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
  acueductoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  acueductoItemSeleccionado: { borderColor: '#1D4ED8', backgroundColor: '#eff6ff' },
  logo: { width: 36, height: 36, borderRadius: 8, marginRight: 12 },
  logoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#e2e8f0',
  },
  acueductoInfo: { flex: 1 },
  acueductoNombre: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  acueductoUbicacion: { fontSize: 12, color: '#64748b', marginTop: 2 },
  pasoDos: { marginTop: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  error: { color: '#dc2626', fontSize: 12, marginBottom: 12, fontWeight: '600' },
  boton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonDeshabilitado: { opacity: 0.5 },
  botonTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default LoginScreen;
