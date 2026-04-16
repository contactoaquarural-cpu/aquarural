import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api.service';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage   from '../../components/ErrorMessage';
import { colors, spacing, radius, typography } from '../../utils/theme';

const CATEGORIA_CONFIG = {
  GOBIERNO:      { icon: '🏛️', color: '#60a5fa', bg: '#1e3a5f' },
  SANIDAD:       { icon: '🩺', color: colors.primary, bg: colors.primaryContainer },
  PRECIOS:       { icon: '📈', color: colors.tertiary, bg: colors.tertiaryContainer },
  EVENTO:        { icon: '📅', color: '#c084fc', bg: '#3b1f5e' },
  INSTITUCIONAL: { icon: '🏢', color: colors.onSurface, bg: colors.surfaceContainerHighest },
};

const NoticiaCard = ({ item, onPress }) => {
  const cat = CATEGORIA_CONFIG[item.categoria] || CATEGORIA_CONFIG.INSTITUCIONAL;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {item.imagen && (
        <Image source={{ uri: item.imagen }} style={styles.cardImage} resizeMode="cover" />
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardMeta}>
          <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catText, { color: cat.color }]}>{item.categoria}</Text>
          </View>
          {item.fechaPublicacion && (
            <Text style={styles.fecha}>
              {new Date(item.fechaPublicacion).toLocaleDateString('es-CO', {
                day: 'numeric', month: 'short',
              })}
            </Text>
          )}
        </View>
        <Text style={styles.cardTitulo} numberOfLines={2}>{item.titulo}</Text>
        <Text style={styles.cardResumen} numberOfLines={3}>{item.contenido}</Text>
      </View>
    </TouchableOpacity>
  );
};

const NoticiasScreen = ({ navigation }) => {
  const [noticias,   setNoticias]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda,   setBusqueda]   = useState('');

  const cargarNoticias = async () => {
    setError(null);
    try {
      const { data } = await api.get('/noticias?limit=30');
      setNoticias(data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las noticias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarNoticias(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarNoticias();
    setRefreshing(false);
  };

  const filtered = busqueda.trim()
    ? noticias.filter((n) =>
        n.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        n.categoria.toLowerCase().includes(busqueda.toLowerCase())
      )
    : noticias;

  if (loading) return <LoadingSpinner message="Cargando noticias..." />;
  if (error)   return <ErrorMessage message={error} onRetry={cargarNoticias} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Noticias</Text>
        <Text style={styles.subtitle}>Sector ganadero · Garzón, Huila</Text>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar noticia..."
            placeholderTextColor={colors.outline}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NoticiaCard
            item={item}
            onPress={() => navigation.navigate('DetalleNoticia', { noticia: item })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📰</Text>
            <Text style={styles.emptyText}>
              {busqueda ? `Sin resultados para "${busqueda}"` : 'No hay noticias publicadas.'}
            </Text>
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
  subtitle: { ...typography.small, marginTop: 2 },

  searchRow: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
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
    overflow:        'hidden',
  },
  cardImage: { width: '100%', height: 160 },
  cardBody:  { padding: spacing.md, gap: spacing.sm },
  cardMeta: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  catBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      radius.full,
  },
  catIcon:   { fontSize: 12 },
  catText:   { ...typography.label, fontSize: 10 },
  fecha:     { ...typography.small },
  cardTitulo:  { ...typography.h3, lineHeight: 22 },
  cardResumen: { ...typography.body, lineHeight: 20 },

  empty:     { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyIcon: { fontSize: 40 },
  emptyText: { ...typography.body, textAlign: 'center' },
});

export default NoticiasScreen;
