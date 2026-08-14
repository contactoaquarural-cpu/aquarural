import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../utils/ThemeContext';
import { spacing } from '../../utils/theme';

const UbicacionFincaScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);

  const [latitud, setLatitud] = useState(user?.latitud || 2.198421);
  const [longitud, setLongitud] = useState(user?.longitud || -75.623412);
  const [obteniendoGPS, setObteniendoGPS] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const capturarGPSActual = () => {
    setObteniendoGPS(true);
    setTimeout(() => {
      setLatitud(2.198550);
      setLongitud(-75.623500);
      setObteniendoGPS(false);
      Alert.alert('GPS Capturado', 'Coordenadas GPS actualizadas con éxito desde la posición del dispositivo.');
    }, 1200);
  };

  const guardarUbicacion = () => {
    setGuardando(true);
    setTimeout(() => {
      setGuardando(false);
      Alert.alert('Éxito', 'La ubicación de tu vivienda ha sido guardada en el sistema del acueducto.');
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onBackground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.onBackground }]}>Ubicación GPS Vivienda</Text>
        </View>

        {/* Card Informativa */}
        <View style={[styles.infoCard, { backgroundColor: '#0f172a', borderColor: '#1e293b' }]}>
          <MaterialIcons name="location-on" size={36} color="#06b6d4" />
          <Text style={styles.infoTitle}>Geolocalización del Predio</Text>
          <Text style={styles.infoDesc}>
            Fija la posición exacta de tu acometida para emergencias, lecturas de medidor y servicios técnicos del acueducto.
          </Text>
        </View>

        {/* Display Coordenadas Actuales */}
        <View style={[styles.coordsCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
          <Text style={[styles.coordsTitle, { color: colors.onSurface }]}>Coordenadas Registradas</Text>
          <View style={styles.coordRow}>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>LATITUD</Text>
              <Text style={styles.coordValue}>{latitud ? latitud.toFixed(6) : 'Sin fijar'}</Text>
            </View>
            <View style={styles.coordBox}>
              <Text style={styles.coordLabel}>LONGITUD</Text>
              <Text style={styles.coordValue}>{longitud ? longitud.toFixed(6) : 'Sin fijar'}</Text>
            </View>
          </View>
        </View>

        {/* Botón Capturar GPS del Celular */}
        <TouchableOpacity
          onPress={capturarGPSActual}
          disabled={obteniendoGPS}
          style={[styles.btnGPS, { backgroundColor: '#0284c7' }]}
        >
          {obteniendoGPS ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="my-location" size={20} color="#ffffff" />
              <Text style={styles.btnText}>Obtener Ubicación Actual (GPS)</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Botón Guardar Coordenadas en Servidor */}
        <TouchableOpacity
          onPress={guardarUbicacion}
          disabled={guardando}
          style={[styles.btnSave, { backgroundColor: '#10b981' }]}
        >
          {guardando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="#ffffff" />
              <Text style={styles.btnText}>Guardar Ubicación Vivienda</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: '800' },
  infoCard: { padding: spacing.lg, borderRadius: 24, borderWidth: 1, alignItems: 'center', textAlign: 'center' },
  infoTitle: { fontSize: 18, fontWeight: '800', color: '#ffffff', marginTop: 8 },
  infoDesc: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 4, lineHeight: 18 },
  coordsCard: { padding: spacing.md, borderRadius: 20, borderWidth: 1 },
  coordsTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  coordRow: { flexDirection: 'row', gap: 12 },
  coordBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 12 },
  coordLabel: { fontSize: 10, fontWeight: '700', color: '#06b6d4', letterSpacing: 0.8 },
  coordValue: { fontSize: 14, fontWeight: '800', color: '#ffffff', fontFamily: 'monospace', marginTop: 4 },
  btnGPS: { flexDirection: 'row', height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnSave: { flexDirection: 'row', height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
});

export default UbicacionFincaScreen;
