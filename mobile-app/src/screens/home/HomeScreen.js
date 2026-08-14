import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../utils/ThemeContext';
import { spacing } from '../../utils/theme';
import { useConfigStore } from '../../store/config.store';

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'Acueducto Veredal La Argentina');
  const user = useAuthStore((s) => s.user);

  const [refreshing, setRefreshing] = useState(false);

  const nombre = user?.nombres || user?.nombre || 'José Donaldo Gómez';
  const primerNombre = nombre.split(' ')[0];
  const matricula = user?.matricula || 'ACU-0101';
  const estadoMoratorio = user?.estadoMoratorio || 'AL_DIA';
  const totalDeuda = estadoMoratorio === 'EN_MORA' ? 50000 : 25000;

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#06b6d4" />
        }
      >
        {/* Top Header with Notification Bell 🔔 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>¡Hola, {primerNombre}! 👋</Text>
            <Text style={styles.subGreeting}>{nombreAcueducto}</Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Notificaciones')}
            style={styles.bellBtn}
          >
            <MaterialIcons name="notifications" size={24} color="#38bdf8" />
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </View>

        {/* Tarjeta de Estado de Cartera / Wompi */}
        <LinearGradient
          colors={totalDeuda > 0 ? ['#0284c7', '#0f172a'] : ['#059669', '#0f172a']}
          style={styles.facturaCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.facturaTop}>
            <View>
              <Text style={styles.facturaLabel}>CUENTA DE COBRO — AGOSTO 2026</Text>
              <Text style={styles.facturaMonto}>${totalDeuda.toLocaleString()} <Text style={{ fontSize: 16 }}>COP</Text></Text>
            </View>
            <View style={styles.periodoBadge}>
              <Text style={styles.periodoText}>Vence: 30 Ago</Text>
            </View>
          </View>

          <View style={styles.facturaDivider} />

          <TouchableOpacity
            onPress={() => navigation.navigate('EstadoFinanciero')}
            style={styles.btnWompi}
          >
            <MaterialIcons name="payment" size={20} color="#0f172a" />
            <Text style={styles.btnWompiText}>Pagar Recibo en Línea (Wompi)</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Access Grid */}
        <View style={styles.grid}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MiCarne')}
            style={[styles.gridCard, { backgroundColor: '#0f172a', borderColor: '#1e293b' }]}
          >
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
              <MaterialIcons name="water-drop" size={24} color="#06b6d4" />
            </View>
            <Text style={styles.gridTitle}>Mi Predio / QR</Text>
            <Text style={styles.gridSub}>{matricula}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('UbicacionFinca')}
            style={[styles.gridCard, { backgroundColor: '#0f172a', borderColor: '#1e293b' }]}
          >
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <MaterialIcons name="location-on" size={24} color="#10b981" />
            </View>
            <Text style={styles.gridTitle}>Ubicación GPS</Text>
            <Text style={styles.gridSub}>Fijar vivienda</Text>
          </TouchableOpacity>
        </View>

        {/* Banner Avisos de la Junta Veredal 🔔 */}
        <View style={[styles.avisoCard, { backgroundColor: '#0f172a', borderColor: '#1e293b' }]}>
          <View style={styles.avisoHeader}>
            <MaterialIcons name="campaign" size={24} color="#f59e0b" />
            <Text style={styles.avisoTitle}>Aviso de la Junta Veredal</Text>
          </View>
          <Text style={styles.avisoContent}>
            Mantenimiento preventivo en el desarenador central el día Sábado 22 de Agosto de 8:00 AM a 1:00 PM. Se recomienda almacenar agua.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greetingText: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  subGreeting: { fontSize: 12, fontWeight: '600', color: '#94a3b8', marginTop: 2 },
  bellBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1e293b' },
  bellBadge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#06b6d4' },
  facturaCard: { borderRadius: 24, padding: spacing.lg, elevation: 6 },
  facturaTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  facturaLabel: { fontSize: 10, fontWeight: '700', color: '#38bdf8', letterSpacing: 0.8 },
  facturaMonto: { fontSize: 32, fontWeight: '800', color: '#ffffff', marginTop: 4 },
  periodoBadge: { backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  periodoText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
  facturaDivider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.15)', marginVertical: 14 },
  btnWompi: { flexDirection: 'row', height: 48, borderRadius: 16, backgroundColor: '#38bdf8', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnWompiText: { fontSize: 13, fontWeight: '800', color: '#0f172a' },
  grid: { flexDirection: 'row', gap: 12 },
  gridCard: { flex: 1, padding: spacing.md, borderRadius: 20, borderWidth: 1 },
  gridIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  gridTitle: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  gridSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  avisoCard: { padding: spacing.md, borderRadius: 20, borderWidth: 1, gap: 8 },
  avisoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avisoTitle: { fontSize: 14, fontWeight: '700', color: '#f59e0b' },
  avisoContent: { fontSize: 12, color: '#cbd5e1', lineHeight: 18 },
});

export default HomeScreen;
