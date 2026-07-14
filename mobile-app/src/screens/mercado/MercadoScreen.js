import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../utils/ThemeContext';

const CATEGORIAS = [
  { key: 'TODOS',   label: 'Todos',    icon: 'grid-view' },
  { key: 'ANIMAL',  label: 'Animales', icon: 'pets' },
  { key: 'TERRENO', label: 'Terrenos', icon: 'landscape' },
  { key: 'FINCA',   label: 'Fincas',   icon: 'home' },
  { key: 'INSUMO',  label: 'Insumos',  icon: 'science' },
  { key: 'OTRO',    label: 'Otro',     icon: 'category' },
];

import api from '../../services/api.service';

const MercadoScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const s = styles(colors);

  const [categoria, setCategoria] = useState('TODOS');
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const cargar = useCallback(async (cat = categoria, p = 1, reset = false) => {
    try {
      const params = `?page=${p}&limit=12${cat !== 'TODOS' ? `&categoria=${cat}` : ''}`;
      const res = await api.get(`/publicaciones${params}`);
      const { data, pagination } = res.data;
      if (reset) {
        setPublicaciones(data);
      } else {
        setPublicaciones((prev) => [...prev, ...data]);
      }
      setHasMore(p < pagination.totalPages);
      setPage(p);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoria]);

  React.useEffect(() => {
    setLoading(true);
    cargar(categoria, 1, true);
  }, [categoria]);

  const onRefresh = () => {
    setRefreshing(true);
    cargar(categoria, 1, true);
  };

  const onEndReached = () => {
    if (hasMore && !loading) cargar(categoria, page + 1, false);
  };

  const cambiarCategoria = (cat) => {
    setCategoria(cat);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('DetallePublicacion', { publicacion: item })}
    >
      {item.fotos?.length > 0 ? (
        <Image source={{ uri: item.fotos[0] }} style={s.foto} />
      ) : (
        <View style={[s.foto, s.fotoPlaceholder]}>
          <MaterialIcons name="image-not-supported" size={32} color={colors.onSurfaceVariant} />
        </View>
      )}
      <View style={s.cardBody}>
        <Text style={s.cardTitulo} numberOfLines={2}>{item.titulo}</Text>
        {item.precio ? (
          <Text style={s.cardPrecio}>
            ${item.precio.toLocaleString('es-CO')} COP
            {item.negociable && <Text style={s.negociable}> · Negociable</Text>}
          </Text>
        ) : (
          <Text style={s.negociable}>Precio a convenir</Text>
        )}
        <View style={s.cardMeta}>
          <MaterialIcons name="location-on" size={12} color={colors.onSurfaceVariant} />
          <Text style={s.cardMetaText}>{item.municipio}</Text>
          {item.vereda ? <Text style={s.cardMetaText}> · {item.vereda}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Mercado</Text>
        <TouchableOpacity
          style={s.btnPublicar}
          onPress={() => navigation.navigate('CrearPublicacion')}
        >
          <MaterialIcons name="add" size={18} color={colors.onPrimary} />
          <Text style={s.btnPublicarText}>Publicar</Text>
        </TouchableOpacity>
      </View>

      {/* Filtros de categoría */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filtros}
        style={s.filtrosWrapper}
      >
        {CATEGORIAS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[s.filtroBtn, categoria === item.key && s.filtroBtnActivo]}
            onPress={() => cambiarCategoria(item.key)}
          >
            <MaterialIcons
              name={item.icon}
              size={14}
              color={categoria === item.key ? colors.onPrimary : colors.onSurfaceVariant}
            />
            <Text style={[s.filtroLabel, categoria === item.key && s.filtroLabelActivo]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={publicaciones}
          keyExtractor={(i) => i._id}
          numColumns={2}
          columnWrapperStyle={s.columnas}
          contentContainerStyle={s.lista}
          renderItem={renderItem}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <MaterialIcons name="storefront" size={48} color={colors.onSurfaceVariant} />
              <Text style={s.emptyText}>No hay publicaciones en esta categoría</Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} /> : null
          }
        />
      )}
    </View>
  );
};

const styles = (c) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: c.background },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12 },
  headerTitle:      { fontSize: 24, fontWeight: '700', color: c.onSurface },
  btnPublicar:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  btnPublicarText:  { color: c.onPrimary, fontSize: 13, fontWeight: '700' },
  filtrosWrapper:   { flexGrow: 0 },
  filtros:          { paddingHorizontal: 12, paddingBottom: 10, paddingTop: 4, gap: 8, flexDirection: 'row', alignItems: 'center' },
  filtroBtn:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: c.surfaceContainer },
  filtroBtnActivo:  { backgroundColor: c.primary },
  filtroLabel:      { fontSize: 12, fontWeight: '600', color: c.onSurfaceVariant },
  filtroLabelActivo:{ color: c.onPrimary },
  lista:            { paddingHorizontal: 12, paddingBottom: 24 },
  columnas:         { gap: 10, marginBottom: 10 },
  card:             { flex: 1, backgroundColor: c.surfaceContainer, borderRadius: 16, overflow: 'hidden' },
  foto:             { width: '100%', aspectRatio: 1 },
  fotoPlaceholder:  { backgroundColor: c.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  cardBody:         { padding: 10 },
  cardTitulo:       { fontSize: 13, fontWeight: '600', color: c.onSurface, lineHeight: 18 },
  cardPrecio:       { fontSize: 13, fontWeight: '700', color: c.primary, marginTop: 4 },
  negociable:       { fontSize: 11, color: c.onSurfaceVariant, marginTop: 2 },
  cardMeta:         { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  cardMetaText:     { fontSize: 11, color: c.onSurfaceVariant },
  loader:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty:            { alignItems: 'center', paddingTop: 64, gap: 12 },
  emptyText:        { fontSize: 14, color: c.onSurfaceVariant, textAlign: 'center' },
});

export default MercadoScreen;
