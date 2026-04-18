import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api.service';
import { useAuthStore }     from '../../store/auth.store';
import { useAsociadoStore } from '../../store/asociado.store';
import EstadoBadge    from '../../components/EstadoBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Toast, useToast } from '../../components/AppToast';
import { colors, spacing, radius, typography } from '../../utils/theme';

const MiCarneScreen = ({ navigation }) => {
  const user     = useAuthStore((s) => s.user);
  const { asociado, cargarDatos } = useAsociadoStore();
  const { show, toastProps } = useToast();

  const [qrBase64,  setQrBase64]  = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const estado = asociado?.estado || user?.estado || 'AL_DIA';
  const nombre = asociado?.nombre || user?.nombre || '';
  const cedula = asociado?.cedula || user?.cedula || '';

  const cargarQR = async () => {
    const userId = user?._id;
    if (!userId || estado !== 'AL_DIA') return;
    setQrLoading(true);
    try {
      const { data } = await api.get(`/asociados/${userId}/qr`);
      setQrBase64(data.data.qrBase64);
    } catch (err) {
      show('error', 'Error al cargar carné', err.response?.data?.message || 'No se pudo generar el código QR.');
    } finally {
      setQrLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarQR();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    await cargarQR();
    setRefreshing(false);
  };

  if (qrLoading && !qrBase64) return <LoadingSpinner message="Generando carné..." />;

  const isMora = estado !== 'AL_DIA';

  return (
    <SafeAreaView style={styles.safe}>
      <Toast {...toastProps} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi Carné Digital</Text>
          <EstadoBadge estado={estado} />
        </View>

        {/* Carné */}
        <LinearGradient
          colors={isMora
            ? [colors.tertiaryContainer, colors.background]
            : [colors.primaryContainer, colors.surfaceContainerLow]
          }
          style={styles.carneCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Logo y organización */}
          <View style={styles.carneHeader}>
            <Text style={styles.carneLogoIcon}>🐄</Text>
            <View>
              <Text style={styles.carneOrgName}>ASOGACENTRO</Text>
              <Text style={styles.carneOrgSub}>Asociación de Ganaderos del Centro</Text>
            </View>
          </View>

          {/* Nombre y cédula */}
          <View style={styles.carneInfo}>
            <Text style={styles.carneNombre}>{nombre}</Text>
            <Text style={styles.carneCedula}>C.C. {cedula}</Text>
          </View>

          {/* QR o mensaje de mora */}
          {isMora ? (
            <View style={styles.moraBlock}>
              <Text style={styles.moraIcon}>⚠️</Text>
              <Text style={styles.moraTitle}>Carné suspendido</Text>
              <Text style={styles.moraSub}>
                Tu carné no está disponible por{'\n'}aporte{estado === 'EN_MORA' ? 's en mora' : 's vencidos'}.
              </Text>
              <TouchableOpacity
                style={styles.moraBtn}
                onPress={() => navigation.navigate('Pagos')}
                activeOpacity={0.85}
              >
                <Text style={styles.moraBtnText}>Ponerse al día →</Text>
              </TouchableOpacity>
            </View>
          ) : qrBase64 ? (
            <View style={styles.qrContainer}>
              <View style={styles.qrFrame}>
                <Image
                  source={{ uri: qrBase64 }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.qrCaption}>Presenta este código en comercios aliados</Text>
            </View>
          ) : null}

          {/* Footer del carné */}
          <View style={styles.carneFoot}>
            <Text style={styles.carneFootText}>Válido · Garzón, Huila · Colombia</Text>
          </View>
        </LinearGradient>

        {/* Instrucciones */}
        {!isMora && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>¿Cómo usar tu carné?</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoNum}>1</Text>
              <Text style={styles.infoText}>Muestra el código QR al cajero del comercio aliado.</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoNum}>2</Text>
              <Text style={styles.infoText}>El comercio escaneará el código para verificar tu membresía.</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoNum}>3</Text>
              <Text style={styles.infoText}>Recibirás el descuento o beneficio según el convenio.</Text>
            </View>
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginBottom:    spacing.lg,
  },
  title: { ...typography.h1 },

  carneCard: {
    borderRadius: radius.xxl,
    padding:      spacing.xl,
    marginBottom: spacing.lg,
    gap:          spacing.lg,
  },
  carneHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.md,
  },
  carneLogoIcon: { fontSize: 32 },
  carneOrgName:  { ...typography.h3, color: colors.primary, letterSpacing: 1 },
  carneOrgSub:   { ...typography.small, marginTop: 2 },

  carneInfo:   { gap: 4 },
  carneNombre: { ...typography.displayMd, color: colors.onSurface },
  carneCedula: { ...typography.body, color: colors.onSurfaceVariant },

  qrContainer: { alignItems: 'center', gap: spacing.md },
  qrFrame: {
    backgroundColor: colors.white,
    padding:         spacing.md,
    borderRadius:    radius.lg,
  },
  qrImage:   { width: 200, height: 200 },
  qrCaption: { ...typography.small, textAlign: 'center', color: colors.onSurfaceVariant },

  moraBlock: {
    alignItems:      'center',
    backgroundColor: colors.tertiaryContainer + '88',
    borderRadius:    radius.lg,
    padding:         spacing.xl,
    gap:             spacing.sm,
  },
  moraIcon:    { fontSize: 36 },
  moraTitle:   { ...typography.h2, color: colors.tertiary, textAlign: 'center' },
  moraSub:     { ...typography.body, color: colors.onTertiaryContainer, textAlign: 'center' },
  moraBtn: {
    backgroundColor: colors.tertiary,
    borderRadius:    radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical:   spacing.sm + 2,
    marginTop:         spacing.sm,
  },
  moraBtnText: { ...typography.bodyBold, color: colors.tertiaryContainer },

  carneFoot:     { borderTopWidth: 1, borderTopColor: colors.outlineVariant + '44', paddingTop: spacing.md },
  carneFootText: { ...typography.label, textAlign: 'center' },

  infoCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.xl,
    padding:         spacing.lg,
    gap:             spacing.md,
  },
  infoTitle: { ...typography.h3, marginBottom: spacing.xs },
  infoRow:   { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  infoNum: {
    width:           24,
    height:          24,
    borderRadius:    12,
    backgroundColor: colors.primaryContainer,
    textAlign:       'center',
    lineHeight:      24,
    ...typography.smallBold,
    color:           colors.primary,
  },
  infoText: { ...typography.body, flex: 1, lineHeight: 20 },
});

export default MiCarneScreen;
