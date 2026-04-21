import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore }     from '../../store/auth.store';
import { useAsociadoStore } from '../../store/asociado.store';
import { usePagosStore }    from '../../store/pagos.store';
import EstadoBadge    from '../../components/EstadoBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme }   from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';


const CATEGORIA_LABELS = {
  GANADO_CARNE: 'Ganado Carne',
  GANADO_LECHE: 'Ganado Leche',
  INSUMOS:      'Insumos',
};

const CATEGORIA_ICONS = {
  GANADO_CARNE: 'lunch-dining',
  GANADO_LECHE: 'water-drop',
  INSUMOS:      'agriculture',
};

const HomeScreen = () => {
  const { colors, typography } = useTheme();
  const navigation    = useNavigation();
  const user          = useAuthStore((s) => s.user);
  const { asociado, finca, isLoading, cargarDatos } = useAsociadoStore();
  const { aportes, mesesPendientes, cargarHistorial } = usePagosStore();
  const [precios,      setPrecios]      = useState([]);
  const [fechaPrecios, setFechaPrecios] = useState(null);

  useEffect(() => {
    cargarDatos();
    cargarHistorial();
    cargarPrecios();
  }, []);

  const cargarPrecios = async () => {
    try {
      const { data } = await api.get('/precios');
      setPrecios(data.data || []);
      if (data.data?.length > 0) {
        setFechaPrecios(new Date(data.data[0].updatedAt));
      }
    } catch {
      // Widget se oculta si no hay precios
    }
  };

  if (isLoading && !asociado) return <LoadingSpinner message="Cargando tu información..." />;

  const styles = makeStyles(colors, typography);
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
            onRefresh={() => { cargarDatos(); cargarHistorial(); cargarPrecios(); }}
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

        {/* Widget ubicación de finca */}
        {finca && !finca.latitud && (
          <TouchableOpacity
            style={styles.ubicacionWidget}
            onPress={() => navigation.navigate('Perfil', { screen: 'UbicacionFinca' })}
            activeOpacity={0.85}
          >
            <View style={styles.ubicacionLeft}>
              <View style={styles.ubicacionIconBox}>
                <MaterialIcons name="location-off" size={22} color={colors.tertiary} />
              </View>
              <View style={styles.ubicacionTexts}>
                <Text style={styles.ubicacionTitle}>Registra la ubicación de tu finca</Text>
                <Text style={styles.ubicacionSub}>Toma las coordenadas GPS estando en tu predio</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.tertiary} />
          </TouchableOpacity>
        )}

        {/* Widget precios de referencia */}
        {precios.length > 0 && (
          <View style={styles.preciosCard}>
            <View style={styles.preciosHeader}>
              <View style={styles.preciosTitleRow}>
                <MaterialIcons name="trending-up" size={18} color={colors.primary} />
                <Text style={styles.preciosTitle}>Precios de Referencia</Text>
              </View>
              {fechaPrecios && (
                <Text style={styles.preciosFecha}>
                  Act. {fechaPrecios.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                </Text>
              )}
            </View>
            {Object.keys(CATEGORIA_LABELS).map((cat) => {
              const items = precios.filter((p) => p.categoria === cat);
              if (!items.length) return null;
              return (
                <View key={cat} style={styles.preciosCat}>
                  <View style={styles.preciosCatHeader}>
                    <MaterialIcons name={CATEGORIA_ICONS[cat]} size={14} color={colors.onSurfaceVariant} />
                    <Text style={styles.preciosCatLabel}>{CATEGORIA_LABELS[cat]}</Text>
                  </View>
                  {items.map((p) => (
                    <View key={p._id} style={styles.precioRow}>
                      <Text style={styles.precioProducto}>{p.producto}</Text>
                      <View style={styles.precioRight}>
                        <Text style={styles.precioValor}>${p.precio.toLocaleString('es-CO')}</Text>
                        <Text style={styles.precioUnidad}>/{p.unidad}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {/* Próximo aporte */}
        {mesesPendientes.length > 0 && (
          <TouchableOpacity
            style={styles.proximoCard}
            onPress={() => navigation.navigate('Pagos', { screen: 'Pago', params: { meses: mesesPendientes } })}
            activeOpacity={0.85}
          >
            <View style={styles.proximoLeft}>
              <MaterialIcons name="calendar-today" size={20} color={colors.tertiary} />
              <View>
                <Text style={styles.proximoLabel}>Próximo aporte pendiente</Text>
                <Text style={styles.proximoMes}>
                  {MESES[mesesPendientes[0].mes - 1]} {mesesPendientes[0].año}
                  {mesesPendientes.length > 1 ? ` (+${mesesPendientes.length - 1} más)` : ''}
                </Text>
                {mesesPendientes[0].fechaVencimiento && (
                  <Text style={styles.proximoVence}>
                    Vence: {new Date(mesesPendientes[0].fechaVencimiento).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
                  </Text>
                )}
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.tertiary} />
          </TouchableOpacity>
        )}

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

const makeStyles = (colors, typography) => StyleSheet.create({
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

  ubicacionWidget: {
    marginHorizontal: spacing.lg,
    marginBottom:     spacing.lg,
    backgroundColor:  colors.tertiaryContainer + '22',
    borderRadius:     radius.xl,
    padding:          spacing.md,
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    borderWidth:      1,
    borderColor:      colors.tertiary + '33',
  },
  ubicacionLeft:   { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  ubicacionIconBox: {
    width:           40,
    height:          40,
    borderRadius:    radius.lg,
    backgroundColor: colors.tertiaryContainer,
    alignItems:      'center',
    justifyContent:  'center',
  },
  ubicacionTexts:  { flex: 1, gap: 2 },
  ubicacionTitle:  { ...typography.bodyBold, color: colors.tertiary },
  ubicacionSub:    { ...typography.small, color: colors.tertiary, opacity: 0.8 },

  sectionTitle: { ...typography.h3, marginHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginHorizontal: spacing.lg,
    marginBottom:    spacing.md,
  },
  sectionLink: { ...typography.small, color: colors.primary, fontWeight: '600' },

  proximoCard: {
    marginHorizontal: spacing.lg,
    marginBottom:     spacing.lg,
    backgroundColor:  colors.tertiaryContainer + '33',
    borderRadius:     radius.xl,
    padding:          spacing.lg,
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    borderWidth:      1,
    borderColor:      colors.tertiary + '44',
  },
  proximoLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  proximoLabel: { ...typography.label, color: colors.tertiary, marginBottom: 2 },
  proximoMes:   { ...typography.bodyBold, color: colors.tertiary },
  proximoVence: { ...typography.small, color: colors.tertiary, marginTop: 2, opacity: 0.8 },


  preciosCard: {
    marginHorizontal: spacing.lg,
    marginBottom:     spacing.lg,
    backgroundColor:  colors.surfaceContainerLow,
    borderRadius:     radius.xl,
    padding:          spacing.lg,
  },
  preciosHeader: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    marginBottom:    spacing.md,
  },
  preciosTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  preciosTitle:    { ...typography.bodyBold, color: colors.onSurface },
  preciosFecha:    { ...typography.small, color: colors.onSurfaceVariant },
  preciosCat: { marginBottom: spacing.sm },
  preciosCatHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            4,
    marginBottom:   spacing.xs,
  },
  preciosCatLabel: { ...typography.label, color: colors.onSurfaceVariant },
  precioRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingVertical:   spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  precioProducto: { ...typography.body, flex: 1 },
  precioRight:    { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  precioValor:    { ...typography.bodyBold, color: colors.primary },
  precioUnidad:   { ...typography.small, color: colors.onSurfaceVariant },

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
