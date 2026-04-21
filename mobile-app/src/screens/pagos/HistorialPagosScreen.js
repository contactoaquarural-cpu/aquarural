import React, { useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { usePagosStore } from '../../store/pagos.store';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, radius, typography } from '../../utils/theme';

const MESES_LABELS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const AporteItem = ({ item }) => (
  <View style={[styles.item, item.estado === 'PENDIENTE' && styles.itemPendiente]}>
    <View style={styles.itemLeft}>
      <Text style={styles.itemMes}>{MESES_LABELS[item.mes - 1]} {item.año}</Text>
      <Text style={styles.itemMetodo}>{item.metodoPago || '—'}</Text>
      {item.referenciaPago && (
        <Text style={styles.itemRef}>Ref: {item.referenciaPago}</Text>
      )}
    </View>
    <View style={styles.itemRight}>
      <View style={[
        styles.estadoChip,
        item.estado === 'PAGADO' ? styles.chipPagado : styles.chipPendiente,
      ]}>
        <Text style={[
          styles.chipText,
          item.estado === 'PAGADO' ? styles.chipTextPagado : styles.chipTextPendiente,
        ]}>
          {item.estado === 'PAGADO' ? 'Pagado' : 'Pendiente'}
        </Text>
      </View>
      <Text style={styles.itemMonto}>
        ${(item.monto || 0).toLocaleString('es-CO')}
      </Text>
      {item.fechaPago && (
        <Text style={styles.itemFecha}>
          {new Date(item.fechaPago).toLocaleDateString('es-CO')}
        </Text>
      )}
    </View>
  </View>
);

const HistorialPagosScreen = ({ navigation }) => {
  const { aportes, isLoading, cargarHistorial } = usePagosStore();

  useEffect(() => { cargarHistorial(); }, []);

  if (isLoading && aportes.length === 0) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historial de Pagos</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={aportes}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <AporteItem item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={cargarHistorial} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Sin historial de aportes.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.md,
  },
  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
  backText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  title:    { ...typography.h2 },

  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },

  item: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'flex-start',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.lg,
    padding:         spacing.md + 2,
  },
  itemPendiente: { backgroundColor: colors.tertiaryContainer + '33' },
  itemLeft:      { flex: 1, gap: 4 },
  itemMes:       { ...typography.bodyBold },
  itemMetodo:    { ...typography.small },
  itemRef:       { ...typography.small, fontFamily: 'monospace', marginTop: 2 },
  itemRight:     { alignItems: 'flex-end', gap: 4 },
  estadoChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical:   2,
    borderRadius:      radius.full,
  },
  chipPagado:        { backgroundColor: colors.primaryContainer },
  chipPendiente:     { backgroundColor: colors.tertiaryContainer },
  chipText:          { ...typography.label },
  chipTextPagado:    { color: colors.primary },
  chipTextPendiente: { color: colors.tertiary },
  itemMonto:         { ...typography.bodyBold, color: colors.onSurface },
  itemFecha:         { ...typography.small },

  empty:     { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyIcon: { fontSize: 40 },
  emptyText: { ...typography.body },
});

export default HistorialPagosScreen;
