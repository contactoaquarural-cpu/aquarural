import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore }  from '../../store/auth.store';
import { usePagosStore } from '../../store/pagos.store';
import EstadoBadge    from '../../components/EstadoBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme }   from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';

const MESES_LABELS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const EstadoFinancieroScreen = ({ navigation }) => {
  const { colors, typography } = useTheme();
  const user       = useAuthStore((s) => s.user);
  const { aportes, mesesPendientes, isLoading, cargarHistorial } = usePagosStore();

  useEffect(() => { cargarHistorial(); }, []);

  if (isLoading && aportes.length === 0) return <LoadingSpinner />;

  const estado = user?.estado || 'AL_DIA';
  const totalPendiente = mesesPendientes.reduce((sum, a) => sum + (a.monto || 0), 0);
  const styles = makeStyles(colors, typography);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={cargarHistorial} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Estado Financiero</Text>
          <EstadoBadge estado={estado} />
        </View>

        {/* Resumen */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>{mesesPendientes.length}</Text>
              <Text style={styles.summaryLabel}>Meses{'\n'}pendientes</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, mesesPendientes.length > 0 && { color: colors.tertiary }]}>
                ${totalPendiente.toLocaleString('es-CO')}
              </Text>
              <Text style={styles.summaryLabel}>Deuda{'\n'}total</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>
                {aportes.filter((a) => a.estado === 'PAGADO').length}
              </Text>
              <Text style={styles.summaryLabel}>Meses{'\n'}pagados</Text>
            </View>
          </View>

          {mesesPendientes.length > 0 && (
            <TouchableOpacity
              style={styles.pagarBtn}
              onPress={() => navigation.navigate('Pago', { meses: mesesPendientes })}
              activeOpacity={0.85}
            >
              <Text style={styles.pagarBtnText}>💳 Pagar {mesesPendientes.length} mes{mesesPendientes.length > 1 ? 'es' : ''}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Meses pendientes */}
        {mesesPendientes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pendiente de pago</Text>
            {mesesPendientes.map((a) => (
              <View key={a._id} style={[styles.aporteRow, styles.pendienteRow]}>
                <Text style={styles.mesLabel}>{MESES_LABELS[a.mes - 1]} {a.año}</Text>
                <Text style={styles.montoTertiary}>${(a.monto || 0).toLocaleString('es-CO')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Historial */}
        <View style={styles.histSection}>
          <View style={styles.histHeader}>
            <Text style={styles.sectionTitle}>Historial de aportes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HistorialPagos')}>
              <Text style={styles.verTodosLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {aportes.filter((a) => a.estado === 'PAGADO').slice(0, 5).map((a) => (
            <View key={a._id} style={styles.aporteRow}>
              <View>
                <Text style={styles.mesLabel}>{MESES_LABELS[a.mes - 1]} {a.año}</Text>
                <Text style={styles.metodo}>{a.metodoPago || '—'}</Text>
              </View>
              <View style={styles.aporteRight}>
                <Text style={styles.montoPrimary}>${(a.monto || 0).toLocaleString('es-CO')}</Text>
                {a.fechaPago && (
                  <Text style={styles.fecha}>
                    {new Date(a.fechaPago).toLocaleDateString('es-CO')}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors, typography) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: spacing.lg,
    paddingTop:      spacing.md,
    paddingBottom:   spacing.lg,
  },
  title: { ...typography.h1 },

  summaryCard: {
    marginHorizontal: spacing.lg,
    backgroundColor:  colors.surfaceContainerLow,
    borderRadius:     radius.xl,
    padding:          spacing.lg,
    marginBottom:     spacing.lg,
    gap:              spacing.md,
  },
  summaryRow:     { flexDirection: 'row', alignItems: 'center' },
  summaryItem:    { flex: 1, alignItems: 'center', gap: 4 },
  summaryNum:     { ...typography.displayMd, color: colors.primary },
  summaryLabel:   { ...typography.label, textAlign: 'center', lineHeight: 14 },
  summaryDivider: { width: 1, height: 40, backgroundColor: colors.outlineVariant },

  pagarBtn: {
    backgroundColor: colors.tertiaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md,
    alignItems:      'center',
  },
  pagarBtnText: { ...typography.bodyBold, color: colors.tertiary },

  section: {
    marginHorizontal: spacing.lg,
    backgroundColor:  colors.surfaceContainerLow,
    borderRadius:     radius.xl,
    padding:          spacing.lg,
    marginBottom:     spacing.lg,
  },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  histSection:  {
    marginHorizontal: spacing.lg,
    backgroundColor:  colors.surfaceContainerLow,
    borderRadius:     radius.xl,
    padding:          spacing.lg,
    marginBottom:     spacing.lg,
  },
  histHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginBottom:    spacing.md,
  },
  verTodosLink: { ...typography.small, color: colors.primary, fontWeight: '600' },

  aporteRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  pendienteRow: { backgroundColor: colors.tertiaryContainer + '22', borderRadius: radius.sm, paddingHorizontal: spacing.sm },
  mesLabel:     { ...typography.bodyBold },
  metodo:       { ...typography.small, marginTop: 2 },
  aporteRight:  { alignItems: 'flex-end', gap: 2 },
  montoPrimary: { ...typography.bodyBold, color: colors.primary },
  montoTertiary:{ ...typography.bodyBold, color: colors.tertiary },
  fecha:        { ...typography.small },
});

export default EstadoFinancieroScreen;
