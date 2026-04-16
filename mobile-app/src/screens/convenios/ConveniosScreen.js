import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api.service';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage   from '../../components/ErrorMessage';
import { colors, spacing, radius, typography } from '../../utils/theme';

const TIPO_CONFIG = {
  AGROPECUARIO: { icon: '🌾', color: colors.primary,   bg: colors.primaryContainer },
  VETERINARIA:  { icon: '🐾', color: colors.tertiary,  bg: colors.tertiaryContainer },
  INSUMOS:      { icon: '🧪', color: '#82cfff',        bg: '#002d57' },
  OTRO:         { icon: '🤝', color: colors.onSurface, bg: colors.surfaceContainerHighest },
};

const ConvenioCard = ({ item, onPress }) => {
  const config = TIPO_CONFIG[item.tipo] || TIPO_CONFIG.OTRO;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBox, { backgroundColor: config.bg }]}>
          <Text style={styles.cardIcon}>{config.icon}</Text>
        </View>
        <View style={styles.cardMeta}>
          <View style={[styles.tipoBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.tipoBadgeText, { color: config.color }]}>{item.tipo}</Text>
          </View>
          {item.descuentoPorcentaje > 0 && (
            <View style={styles.descuentoBadge}>
              <Text style={styles.descuentoText}>{item.descuentoPorcentaje}% dto.</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.cardNombre}>{item.nombre}</Text>
      {item.descripcion ? (
        <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>
      ) : null}
      {item.telefono ? (
        <View style={styles.cardContact}>
          <Text style={styles.cardContactIcon}>📞</Text>
          <Text style={styles.cardContactText}>{item.telefono}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const ConveniosScreen = ({ navigation }) => {
  const [convenios,  setConvenios]  = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [busqueda,   setBusqueda]   = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const cargarConvenios = async () => {
    setError(null);
    try {
      const { data } = await api.get('/convenios');
      setConvenios(data.data ?? []);
      setFiltered(data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los convenios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarConvenios(); }, []);

  useEffect(() => {
    if (!busqueda.trim()) {
      setFiltered(convenios);
      return;
    }
    const q = busqueda.toLowerCase();
    setFiltered(convenios.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.tipo.toLowerCase().includes(q)
    ));
  }, [busqueda, convenios]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarConvenios();
    setRefreshing(false);
  };

  if (loading) return <LoadingSpinner message="Cargando convenios..." />;
  if (error)   return <ErrorMessage message={error} onRetry={cargarConvenios} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Convenios y Beneficios</Text>
        <Text style={styles.subtitle}>{convenios.length} aliados activos</Text>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar convenio..."
            placeholderTextColor={colors.outline}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ConvenioCard
            item={item}
            onPress={() => navigation.navigate('DetalleConvenio', { convenio: item })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Sin resultados para "{busqueda}"</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.md,
    paddingBottom:     spacing.sm,
  },
  title:    { ...typography.h1 },
  subtitle: { ...typography.small, marginTop: 4 },

  searchRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom:     spacing.md,
  },
  searchBox: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius:    radius.lg,
    paddingHorizontal: spacing.md,
    height:          48,
    gap:             spacing.sm,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, ...typography.body, color: colors.onSurface },

  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },

  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.xl,
    padding:         spacing.lg,
    gap:             spacing.sm,
  },
  cardHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  cardIconBox: {
    width:           44,
    height:          44,
    borderRadius:    radius.md,
    alignItems:      'center',
    justifyContent:  'center',
  },
  cardIcon:  { fontSize: 22 },
  cardMeta:  { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  tipoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      radius.full,
  },
  tipoBadgeText: { ...typography.label },
  descuentoBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      radius.full,
  },
  descuentoText: { ...typography.label, color: colors.primary },
  cardNombre:    { ...typography.h3 },
  cardDesc:      { ...typography.body, lineHeight: 20 },
  cardContact: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.xs,
    marginTop:     spacing.xs,
  },
  cardContactIcon: { fontSize: 14 },
  cardContactText: { ...typography.small },

  empty:     { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyIcon: { fontSize: 40 },
  emptyText: { ...typography.body },
});

export default ConveniosScreen;
