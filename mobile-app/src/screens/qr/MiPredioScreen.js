import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, RefreshControl, ScrollView, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';
import { useConfigStore } from '../../store/config.store';

const MiPredioScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'AquaRural Pro');
  const user = useAuthStore((s) => s.user);

  const [refreshing, setRefreshing] = useState(false);

  const estado = user?.estadoMoratorio || 'AL_DIA';
  const nombre = user?.nombres || user?.nombre || 'José Donaldo Gómez';
  const cedula = user?.cedula || '1075234891';
  const matricula = user?.matricula || 'ACU-0101';
  const medidor = user?.numeroMedidor || 'MED-90812';
  const vereda = user?.vereda || 'La Argentina - Sector El Mirador';

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const isMora = estado !== 'AL_DIA';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Top Header with Notification Bell */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.onBackground }]}>Mi Predio & Carné QR</Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{nombreAcueducto}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notificaciones')}
            style={[styles.bellBtn, { backgroundColor: colors.surfaceContainerHigh }]}
          >
            <MaterialIcons name="notifications" size={22} color={colors.primary} />
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </View>

        {/* Tarjeta Digital Predio / QR */}
        <LinearGradient
          colors={isMora
            ? ['#1e1b4b', '#0f172a']
            : ['#0369a1', '#0f172a']
          }
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header Card */}
          <View style={styles.cardHeader}>
            <View style={styles.waterDropIcon}>
              <MaterialIcons name="water-drop" size={24} color="#38bdf8" />
            </View>
            <View style={styles.statusPill}>
              <View style={[styles.statusDot, { backgroundColor: isMora ? '#f59e0b' : '#10b981' }]} />
              <Text style={[styles.statusText, { color: isMora ? '#fef3c7' : '#d1fae5' }]}>
                {isMora ? 'EN MORA' : 'AL DÍA / ACTIVO'}
              </Text>
            </View>
          </View>

          {/* Información del Suscriptor */}
          <View style={styles.cardBody}>
            <Text style={styles.suscriptorNombre}>{nombre}</Text>
            <Text style={styles.suscriptorCedula}>C.C. {cedula}</Text>

            <View style={styles.divider} />

            <View style={styles.infoGrid}>
              <View>
                <Text style={styles.infoLabel}>N° MATRÍCULA</Text>
                <Text style={styles.infoValueMatricula}>{matricula}</Text>
              </View>
              <View>
                <Text style={styles.infoLabel}>N° MEDIDOR</Text>
                <Text style={styles.infoValue}>{medidor}</Text>
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.infoLabel}>VEREDA / SECTOR</Text>
              <Text style={styles.infoValue}>{vereda}</Text>
            </View>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <View style={styles.qrBox}>
              <MaterialIcons name="qr-code-2" size={140} color="#0f172a" />
            </View>
            <Text style={styles.qrHelpText}>Presenta este código QR para toma de lectura o pagos presenciales</Text>
          </View>
        </LinearGradient>

        {/* Detalles Técnicos Acometida */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
          <Text style={[styles.detailsTitle, { color: colors.onSurface }]}>Detalles de la Acometida</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Tipo de Uso:</Text>
            <Text style={[styles.detailValue, { color: colors.onSurface }]}>Residencial Veredal</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.onSurfaceVariant }]}>Estado del Servicio:</Text>
            <Text style={[styles.detailValue, { color: '#10b981' }]}>Conectado y Normal</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#06b6d4',
  },
  card: {
    borderRadius: 24,
    padding: spacing.lg,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  waterDropIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  suscriptorNombre: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  suscriptorCedula: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38bdf8',
    letterSpacing: 0.8,
  },
  infoValueMatricula: {
    fontSize: 16,
    fontWeight: '800',
    color: '#38bdf8',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  qrBox: {
    backgroundColor: '#ffffff',
    padding: spacing.md,
    borderRadius: 20,
  },
  qrHelpText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
  },
  detailsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.md,
  },
  detailsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});

export default MiPredioScreen;
