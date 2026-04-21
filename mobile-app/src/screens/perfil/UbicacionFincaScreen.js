import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api.service';
import { useAsociadoStore } from '../../store/asociado.store';
import { Toast, useToast } from '../../components/AppToast';
import { useTheme } from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';

const PENDING_KEY = 'ubicacion_finca_pendiente';

const UbicacionFincaScreen = () => {
  const { colors, typography } = useTheme();
  const navigation = useNavigation();
  const { finca, asociado, cargarDatos, actualizarFinca } = useAsociadoStore();
  const getFinca = () => useAsociadoStore.getState().finca;
  const { show, toastProps } = useToast();

  const [loading,    setLoading]    = useState(false);
  const [syncing,    setSyncing]    = useState(false);
  const [ubicacion,  setUbicacion]  = useState(null);
  const [pendiente,  setPendiente]  = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!finca) await cargarDatos();
      const fincaActual = useAsociadoStore.getState().finca;
      if (fincaActual?.latitud) {
        setUbicacion({ latitud: fincaActual.latitud, longitud: fincaActual.longitud });
      }
      verificarPendiente();
    };
    init();
  }, []);

  const verificarPendiente = async () => {
    const stored = await AsyncStorage.getItem(PENDING_KEY);
    if (stored) setPendiente(true);
  };

  const tomarUbicacion = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        show('warning', 'Permiso requerido', 'Necesitamos acceso a tu ubicación para registrar la finca.');
        setLoading(false);
        return;
      }

      // Primero intentar posición actual, con fallback a última conocida
      let loc = null;
      try {
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          mayShowUserSettingsDialog: true,
        });
      } catch {
        loc = await Location.getLastKnownPositionAsync();
      }

      if (!loc) {
        show('error', 'Error de GPS', 'No se pudo obtener la ubicación. Asegúrate de estar al aire libre.');
        setLoading(false);
        return;
      }

      const coords = {
        latitud:  loc.coords.latitude,
        longitud: loc.coords.longitude,
      };

      setUbicacion(coords);

      // Intentar guardar en línea
      const net = await NetInfo.fetch();
      if (net.isConnected) {
        await guardarEnBackend(coords);
      } else {
        // Guardar localmente para sincronizar después
        await AsyncStorage.setItem(PENDING_KEY, JSON.stringify({
          fincaId: finca?._id,
          ...coords,
        }));
        setPendiente(true);
        show('info', 'Guardado sin conexión', 'Las coordenadas se sincronizarán cuando tengas señal.');
      }
    } catch (err) {
      console.error('GPS error:', err?.message || err);
      show('error', 'Error de GPS', err?.message || 'No se pudo obtener la ubicación.');
    } finally {
      setLoading(false);
    }
  };

  const guardarEnBackend = async (coords) => {
    const fincaActual = getFinca();
    if (!fincaActual?._id) {
      show('error', 'Error', 'No se encontró la finca. Vuelve al perfil e intenta de nuevo.');
      return;
    }
    await api.put(`/fincas/${fincaActual._id}`, coords);
    await cargarDatos();
    await AsyncStorage.removeItem(PENDING_KEY);
    setPendiente(false);
    show('success', 'Ubicación guardada', 'Las coordenadas de tu finca fueron registradas.');
  };

  const sincronizar = async () => {
    setSyncing(true);
    try {
      const stored = await AsyncStorage.getItem(PENDING_KEY);
      if (!stored) { setPendiente(false); setSyncing(false); return; }

      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        show('warning', 'Sin conexión', 'Necesitas señal para sincronizar.');
        setSyncing(false);
        return;
      }

      const data = JSON.parse(stored);
      await guardarEnBackend({ latitud: data.latitud, longitud: data.longitud });
    } catch {
      show('error', 'Error al sincronizar', 'No se pudo guardar en el servidor. Inténtalo de nuevo.');
    } finally {
      setSyncing(false);
    }
  };

  const styles = makeStyles(colors, typography);

  return (
    <SafeAreaView style={styles.safe}>
      <Toast {...toastProps} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ubicación de la Finca</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.container}>
        {/* Tarjeta de coordenadas actuales */}
        <View style={styles.coordCard}>
          <View style={styles.coordIconRow}>
            <MaterialIcons name="place" size={28} color={colors.primary} />
            <Text style={styles.coordTitle}>
              {ubicacion ? 'Coordenadas registradas' : 'Sin coordenadas aún'}
            </Text>
          </View>

          {ubicacion ? (
            <View style={styles.coordValues}>
              <View style={styles.coordRow}>
                <Text style={styles.coordLabel}>Latitud</Text>
                <Text style={styles.coordValue}>{ubicacion.latitud.toFixed(6)}</Text>
              </View>
              <View style={styles.coordRow}>
                <Text style={styles.coordLabel}>Longitud</Text>
                <Text style={styles.coordValue}>{ubicacion.longitud.toFixed(6)}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.coordEmpty}>
              Toca el botón de abajo estando en tu finca para registrar su ubicación GPS.
            </Text>
          )}
        </View>

        {/* Badge pendiente de sincronización */}
        {pendiente && (
          <View style={styles.pendienteBadge}>
            <MaterialIcons name="sync-problem" size={18} color={colors.tertiary} />
            <Text style={styles.pendienteText}>Pendiente de sincronizar</Text>
            <TouchableOpacity onPress={sincronizar} disabled={syncing}>
              {syncing
                ? <ActivityIndicator size="small" color={colors.tertiary} />
                : <Text style={styles.syncBtn}>Sincronizar</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={18} color={colors.onSurfaceVariant} />
          <Text style={styles.infoText}>
            El GPS funciona sin conexión a internet. Toma las coordenadas en tu finca y se guardarán automáticamente cuando tengas señal.
          </Text>
        </View>

        {/* Botón principal */}
        <TouchableOpacity
          style={[styles.gpsBtn, loading && { opacity: 0.6 }]}
          onPress={tomarUbicacion}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.gpsBtnText}>Obteniendo ubicación...</Text>
            </>
          ) : (
            <>
              <MaterialIcons name="my-location" size={22} color={colors.primary} />
              <Text style={styles.gpsBtnText}>
                {ubicacion ? 'Actualizar ubicación' : 'Tomar ubicación ahora'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const makeStyles = (colors, typography) => StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.md,
  },
  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
  backText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  title:    { ...typography.h2 },

  container: { flex: 1, padding: spacing.lg, gap: spacing.md },

  coordCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.xl,
    padding:         spacing.lg,
    gap:             spacing.md,
  },
  coordIconRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  coordTitle:   { ...typography.h3 },
  coordValues:  { gap: spacing.sm },
  coordRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  coordLabel: { ...typography.label },
  coordValue: { ...typography.mono, color: colors.primary },
  coordEmpty: { ...typography.body, lineHeight: 22 },

  pendienteBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.sm,
    backgroundColor: colors.tertiaryContainer + '55',
    borderRadius:    radius.lg,
    padding:         spacing.md,
  },
  pendienteText: { ...typography.small, color: colors.tertiary, flex: 1 },
  syncBtn:       { ...typography.smallBold, color: colors.tertiary },

  infoCard: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             spacing.sm,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius:    radius.lg,
    padding:         spacing.md,
  },
  infoText: { ...typography.small, flex: 1, lineHeight: 18 },

  gpsBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             spacing.sm,
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md + 4,
    marginTop:       'auto',
  },
  gpsBtnText: { ...typography.h3, color: colors.primary },
});

export default UbicacionFincaScreen;
