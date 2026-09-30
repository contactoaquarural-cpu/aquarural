import { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useUbicacionStore } from '../../store/ubicacion.store';
import { colors, radii, fonts } from '../../theme/tokens';

const UbicacionScreen = () => {
  const { user, actualizarUsuario } = useAuthStore();
  const { guardando, error, guardarUbicacion } = useUbicacionStore();
  const [capturando, setCapturando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorLocal, setErrorLocal] = useState('');

  const tieneUbicacion = typeof user?.latitud === 'number' && typeof user?.longitud === 'number';

  const handleCapturar = async () => {
    setErrorLocal('');
    setMensajeExito('');
    setCapturando(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorLocal('Permiso de ubicación denegado. Actívalo en los ajustes de tu celular para registrar tu predio.');
        return;
      }

      const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = posicion.coords;

      const exito = await guardarUbicacion(user._id, latitude, longitude);
      if (exito) {
        actualizarUsuario({ latitud: latitude, longitud: longitude });
        setMensajeExito('Ubicación de tu predio guardada correctamente.');
      }
    } catch (e) {
      setErrorLocal('No se pudo obtener tu ubicación. Verifica que el GPS esté activado e intenta de nuevo.');
    } finally {
      setCapturando(false);
    }
  };

  const abrirEnMapa = () => {
    if (!tieneUbicacion) return;
    Linking.openURL(`https://www.google.com/maps?q=${user.latitud},${user.longitud}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Ubicación</Text>
        <Text style={styles.subtitulo}>La ubicación GPS de tu predio</Text>
      </View>

      <View style={styles.contenido}>
        <View style={styles.mapaIcono}>
          <MaterialIcons name={tieneUbicacion ? 'location-on' : 'location-off'} size={40} color={colors.azulMarca} />
        </View>

        {tieneUbicacion ? (
          <>
            <Text style={styles.coordenadas}>
              {user.latitud.toFixed(6)}, {user.longitud.toFixed(6)}
            </Text>
            <TouchableOpacity style={styles.verEnMapa} onPress={abrirEnMapa} activeOpacity={0.7}>
              <MaterialIcons name="map" size={16} color={colors.azulMarca} />
              <Text style={styles.verEnMapaTexto}>Ver en Google Maps</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.sinUbicacion}>Aún no has registrado la ubicación de tu predio.</Text>
        )}

        {(errorLocal || error) && (
          <View style={styles.bannerError}>
            <MaterialIcons name="error-outline" size={18} color={colors.rojo} />
            <Text style={styles.bannerErrorTexto}>{errorLocal || error}</Text>
          </View>
        )}

        {mensajeExito ? (
          <View style={styles.bannerExito}>
            <MaterialIcons name="check-circle" size={18} color={colors.emerald} />
            <Text style={styles.bannerExitoTexto}>{mensajeExito}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.boton, capturando && styles.botonDeshabilitado]}
          onPress={handleCapturar}
          disabled={capturando || guardando}
          activeOpacity={0.85}
        >
          {capturando || guardando ? (
            <ActivityIndicator color={colors.blanco} />
          ) : (
            <>
              <MaterialIcons name="my-location" size={18} color={colors.blanco} />
              <Text style={styles.botonTexto}>
                {tieneUbicacion ? 'Actualizar mi ubicación' : 'Capturar mi ubicación'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.superficieSutil },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  titulo: { fontFamily: fonts.headlineExtraBold, fontSize: 24, color: colors.textoPrincipal },
  subtitulo: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textoSecundario, marginTop: 4 },
  contenido: { paddingHorizontal: 20, alignItems: 'center', paddingTop: 32, paddingBottom: 100 },
  mapaIcono: {
    width: 88,
    height: 88,
    borderRadius: radii.full,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  coordenadas: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textoPrincipal,
    marginBottom: 10,
  },
  verEnMapa: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 28 },
  verEnMapaTexto: { fontFamily: fonts.headlineSemiBold, fontSize: 13, color: colors.azulMarca },
  sinUbicacion: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textoSecundario,
    textAlign: 'center',
    marginBottom: 28,
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
    marginBottom: 16,
    width: '100%',
  },
  bannerErrorTexto: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.rojo, flex: 1 },
  bannerExito: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.emeraldBg,
    borderWidth: 1,
    borderColor: colors.emeraldBorde,
    borderRadius: radii['2xl'],
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    width: '100%',
  },
  bannerExitoTexto: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.emerald, flex: 1 },
  boton: {
    flexDirection: 'row',
    backgroundColor: colors.azulMarca,
    borderRadius: radii['2xl'],
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { fontFamily: fonts.headlineSemiBold, color: colors.blanco, fontSize: 14 },
});

export default UbicacionScreen;
