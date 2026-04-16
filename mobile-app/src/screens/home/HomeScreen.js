import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore }     from '../../store/auth.store';
import { useAsociadoStore } from '../../store/asociado.store';
import { usePagosStore }    from '../../store/pagos.store';
import EstadoBadge    from '../../components/EstadoBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, radius, typography } from '../../utils/theme';

// Tarjeta de acceso rápido
const QuickCard = ({ icon, label, sublabel, onPress, accent }) => (
  <TouchableOpacity style={[styles.quickCard, accent && styles.quickCardAccent]} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.quickIcon}>{icon}</Text>
    <Text style={styles.quickLabel}>{label}</Text>
    {sublabel ? <Text style={styles.quickSub}>{sublabel}</Text> : null}
  </TouchableOpacity>
);

const HomeScreen = () => {
  const navigation    = useNavigation();
  const user          = useAuthStore((s) => s.user);
  const { asociado, finca, isLoading, cargarDatos } = useAsociadoStore();
  const { aportes, mesesPendientes, cargarHistorial } = usePagosStore();

  useEffect(() => {
    cargarDatos();
    cargarHistorial();
  }, []);

  if (isLoading && !asociado) return <LoadingSpinner message="Cargando tu información..." />;

  const estado = asociado?.estado || user?.estado || 'AL_DIA';
  const nombre = asociado?.nombre || user?.nombre || '';
  const firstName = nombre.split(' ')[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => { cargarDatos(); cargarHistorial(); }}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {firstName} 👋</Text>
            <Text style={styles.headerSub}>Panel del Ganadero</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Perfil', { screen: 'Notificaciones' })}
          >
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta de estado */}
        <View style={[styles.estadoCard, estado !== 'AL_DIA' && styles.estadoCardAlert]}>
          <View style={styles.estadoRow}>
            <View style={styles.estadoInfo}>
              <Text style={styles.estadoTitle}>Estado Asociado</Text>
              <EstadoBadge estado={estado} size="lg" />
            </View>
            <View style={styles.estadoNums}>
              <Text style={styles.estadoNum}>{mesesPendientes.length}</Text>
              <Text style={styles.estadoNumLabel}>meses{'\n'}pendientes</Text>
            </View>
          </View>
          {estado !== 'AL_DIA' && (
            <TouchableOpacity
              style={styles.pagarAhoraBtn}
              onPress={() => navigation.navigate('Pagos')}
            >
              <Text style={styles.pagarAhoraText}>Pagar ahora →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Datos de la finca */}
        {finca && (
          <View style={styles.fincaCard}>
            <Text style={styles.sectionLabel}>Mi Finca</Text>
            <Text style={styles.fincaNombre}>{finca.nombre}</Text>
            <View style={styles.fincaStats}>
              <View style={styles.fincaStat}>
                <Text style={styles.fincaStatNum}>{finca.cabezasGanado ?? 0}</Text>
                <Text style={styles.fincaStatLabel}>Cabezas</Text>
              </View>
              <View style={styles.fincaDivider} />
              <View style={styles.fincaStat}>
                <Text style={styles.fincaStatNum}>{finca.hectareas ?? 0}</Text>
                <Text style={styles.fincaStatLabel}>Hectáreas</Text>
              </View>
              <View style={styles.fincaDivider} />
              <View style={styles.fincaStat}>
                <Text style={styles.fincaStatNum}>{finca.tipoProduccion}</Text>
                <Text style={styles.fincaStatLabel}>Producción</Text>
              </View>
            </View>
          </View>
        )}

        {/* Accesos rápidos */}
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <View style={styles.quickGrid}>
          <QuickCard
            icon="💳"
            label="Mi Carné"
            sublabel="Código QR"
            onPress={() => navigation.navigate('MiCarne')}
          />
          <QuickCard
            icon="💰"
            label="Pagos"
            sublabel={`${mesesPendientes.length} pendientes`}
            onPress={() => navigation.navigate('Pagos')}
            accent={mesesPendientes.length > 0}
          />
          <QuickCard
            icon="🤝"
            label="Convenios"
            sublabel="Beneficios"
            onPress={() => navigation.navigate('Beneficios')}
          />
          <QuickCard
            icon="👤"
            label="Mi Perfil"
            sublabel="Configuración"
            onPress={() => navigation.navigate('Perfil')}
          />
        </View>

        {/* Últimos aportes */}
        {aportes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimos aportes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Pagos', { screen: 'HistorialPagos' })}>
                <Text style={styles.sectionLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            {aportes.slice(0, 3).map((a) => (
              <View key={a._id} style={styles.aporteRow}>
                <View>
                  <Text style={styles.aporteLabel}>
                    {MESES[a.mes - 1]} {a.año}
                  </Text>
                  <Text style={styles.aporteMetodo}>{a.metodoPago || 'N/A'}</Text>
                </View>
                <View style={styles.aporteRight}>
                  <Text style={[
                    styles.aporteEstado,
                    a.estado === 'PAGADO' ? styles.pagado : styles.pendiente,
                  ]}>
                    {a.estado === 'PAGADO' ? 'Pagado' : 'Pendiente'}
                  </Text>
                  <Text style={styles.aporteNum}>
                    ${(a.monto || 0).toLocaleString('es-CO')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop:      spacing.md,
    paddingBottom:   spacing.lg,
  },
  greeting:   { ...typography.h1, color: colors.onSurface },
  headerSub:  { ...typography.small, marginTop: 2 },
  notifBtn: {
    width:           40,
    height:          40,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius:    radius.full,
    alignItems:      'center',
    justifyContent:  'center',
  },
  notifIcon: { fontSize: 18 },

  estadoCard: {
    marginHorizontal: spacing.lg,
    marginBottom:     spacing.lg,
    backgroundColor:  colors.surfaceContainerLow,
    borderRadius:     radius.xl,
    padding:          spacing.lg,
  },
  estadoCardAlert: { backgroundColor: colors.tertiaryContainer + '33' },
  estadoRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-start',
    marginBottom:    spacing.md,
  },
  estadoInfo:     { gap: spacing.sm },
  estadoTitle:    { ...typography.label },
  estadoNums:     { alignItems: 'flex-end' },
  estadoNum:      { ...typography.displayMd, color: colors.tertiary },
  estadoNumLabel: { ...typography.label, textAlign: 'right', lineHeight: 14 },
  pagarAhoraBtn: {
    backgroundColor: colors.tertiaryContainer,
    borderRadius:    radius.md,
    paddingVertical:   spacing.sm,
    alignItems:        'center',
  },
  pagarAhoraText: { ...typography.bodyBold, color: colors.tertiary },

  fincaCard: {
    marginHorizontal: spacing.lg,
    marginBottom:     spacing.lg,
    backgroundColor:  colors.surfaceContainerLow,
    borderRadius:     radius.xl,
    padding:          spacing.lg,
  },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm },
  fincaNombre:  { ...typography.h2, marginBottom: spacing.md },
  fincaStats:   { flexDirection: 'row', alignItems: 'center' },
  fincaStat:    { flex: 1, alignItems: 'center' },
  fincaStatNum: { ...typography.h2, color: colors.primary },
  fincaStatLabel: { ...typography.label, marginTop: 2 },
  fincaDivider: {
    width:           1,
    height:          32,
    backgroundColor: colors.outlineVariant,
  },

  sectionTitle: { ...typography.h3, marginHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginHorizontal: spacing.lg,
    marginBottom:    spacing.md,
  },
  sectionLink: { ...typography.small, color: colors.primary, fontWeight: '600' },

  quickGrid: {
    flexDirection:   'row',
    flexWrap:        'wrap',
    paddingHorizontal: spacing.lg,
    gap:             spacing.md,
    marginBottom:    spacing.xl,
  },
  quickCard: {
    width:           '46%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.xl,
    padding:         spacing.lg,
    gap:             spacing.xs,
  },
  quickCardAccent: { backgroundColor: colors.tertiaryContainer },
  quickIcon:       { fontSize: 28, marginBottom: spacing.xs },
  quickLabel:      { ...typography.bodyBold },
  quickSub:        { ...typography.small },

  section: {
    marginHorizontal: spacing.lg,
    backgroundColor:  colors.surfaceContainerLow,
    borderRadius:     radius.xl,
    padding:          spacing.lg,
    marginBottom:     spacing.lg,
  },
  aporteRow: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  aporteLabel:  { ...typography.bodyBold },
  aporteMetodo: { ...typography.small, marginTop: 2 },
  aporteRight:  { alignItems: 'flex-end', gap: 4 },
  aporteEstado: { ...typography.label },
  pagado:       { color: colors.primary },
  pendiente:    { color: colors.tertiary },
  aporteNum:    { ...typography.bodyBold },
});

export default HomeScreen;
