import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography } from '../../utils/theme';

const TIPO_CONFIG = {
  AGROPECUARIO: { icon: '🌾', color: colors.primary,   bg: colors.primaryContainer },
  VETERINARIA:  { icon: '🐾', color: colors.tertiary,  bg: colors.tertiaryContainer },
  INSUMOS:      { icon: '🧪', color: '#82cfff',        bg: '#002d57' },
  OTRO:         { icon: '🤝', color: colors.onSurface, bg: colors.surfaceContainerHighest },
};

const DetalleConvenioScreen = ({ route, navigation }) => {
  const { convenio } = route.params;
  const config = TIPO_CONFIG[convenio.tipo] || TIPO_CONFIG.OTRO;

  const handleLlamar = () => {
    if (convenio.telefono) {
      Linking.openURL(`tel:${convenio.telefono}`);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <LinearGradient
          colors={[config.bg, colors.background]}
          style={styles.hero}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={[styles.heroIconBox, { backgroundColor: config.bg + 'aa' }]}>
            <Text style={styles.heroIcon}>{config.icon}</Text>
          </View>

          <View style={[styles.tipoBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.tipoBadgeText, { color: config.color }]}>{convenio.tipo}</Text>
          </View>
          <Text style={styles.heroNombre}>{convenio.nombre}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Descuento destacado */}
          {convenio.descuentoPorcentaje > 0 && (
            <View style={styles.descuentoCard}>
              <Text style={styles.descuentoNum}>{convenio.descuentoPorcentaje}%</Text>
              <View>
                <Text style={styles.descuentoLabel}>Descuento exclusivo</Text>
                <Text style={styles.descuentoSub}>Para socios activos de ASOGACENTRO</Text>
              </View>
            </View>
          )}

          {/* Descripción */}
          {convenio.descripcion && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.descripcion}>{convenio.descripcion}</Text>
            </View>
          )}

          {/* Información de contacto */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información de contacto</Text>

            {convenio.direccion && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>{convenio.direccion}</Text>
              </View>
            )}
            {convenio.telefono && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📞</Text>
                <Text style={styles.infoText}>{convenio.telefono}</Text>
              </View>
            )}
            {!convenio.direccion && !convenio.telefono && (
              <Text style={styles.noInfo}>Sin información de contacto disponible.</Text>
            )}
          </View>

          {/* Cómo usar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>¿Cómo obtener el beneficio?</Text>
            <View style={styles.stepRow}>
              <Text style={styles.stepNum}>1</Text>
              <Text style={styles.stepText}>Presenta tu carné QR digital en el establecimiento.</Text>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepNum}>2</Text>
              <Text style={styles.stepText}>El comercio verificará tu membresía en ASOGACENTRO.</Text>
            </View>
            <View style={styles.stepRow}>
              <Text style={styles.stepNum}>3</Text>
              <Text style={styles.stepText}>Obtendrás el descuento o beneficio automáticamente.</Text>
            </View>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Botón llamar */}
      {convenio.telefono && (
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={handleLlamar} activeOpacity={0.85}>
            <Text style={styles.fabIcon}>📞</Text>
            <Text style={styles.fabText}>Llamar ahora</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  hero: {
    paddingTop:    spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems:    'flex-start',
    gap:           spacing.md,
  },
  backBtn:     { marginBottom: spacing.sm },
  backIcon:    { ...typography.h2, color: colors.onSurface },
  heroIconBox: {
    width:           64,
    height:          64,
    borderRadius:    radius.xl,
    alignItems:      'center',
    justifyContent:  'center',
  },
  heroIcon:  { fontSize: 32 },
  tipoBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.xs,
    borderRadius:      radius.full,
  },
  tipoBadgeText: { ...typography.label },
  heroNombre:    { ...typography.displayMd },

  content: { padding: spacing.lg, gap: spacing.lg },

  descuentoCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.lg,
    backgroundColor: colors.primaryContainer + '55',
    borderRadius:    radius.xl,
    padding:         spacing.lg,
  },
  descuentoNum:   { ...typography.displayLg, color: colors.primary },
  descuentoLabel: { ...typography.h3, color: colors.primary },
  descuentoSub:   { ...typography.small, marginTop: 4 },

  section:      { gap: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.onSurface },
  descripcion:  { ...typography.body, lineHeight: 22 },

  infoRow: {
    flexDirection: 'row',
    gap:           spacing.md,
    alignItems:    'flex-start',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:  radius.lg,
    padding:       spacing.md,
  },
  infoIcon: { fontSize: 18 },
  infoText: { ...typography.body, flex: 1, lineHeight: 20 },
  noInfo:   { ...typography.small, fontStyle: 'italic' },

  stepRow: {
    flexDirection: 'row',
    gap:           spacing.md,
    alignItems:    'flex-start',
  },
  stepNum: {
    width:           24,
    height:          24,
    borderRadius:    12,
    backgroundColor: colors.primaryContainer,
    textAlign:       'center',
    lineHeight:      24,
    ...typography.smallBold,
    color:           colors.primary,
  },
  stepText: { ...typography.body, flex: 1, lineHeight: 20 },

  fabContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
  fab: {
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             spacing.sm,
  },
  fabIcon: { fontSize: 20 },
  fabText: { ...typography.h3, color: colors.primary },
});

export default DetalleConvenioScreen;
