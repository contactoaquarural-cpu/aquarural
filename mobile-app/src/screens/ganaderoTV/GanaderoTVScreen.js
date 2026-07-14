import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../utils/ThemeContext';
import api from '../../services/api.service';

const formatDuracion = (seg) => {
  if (!seg) return null;
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const GanaderoTVScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const s = styles(colors);

  const [capitulos, setCapitulos]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const res = await api.get('/capitulos');
      setCapitulos(res.data.data ?? []);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => { cargar(); }, []);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('Reproductor', { capitulo: item })}
    >
      {/* Thumbnail */}
      <View style={s.thumbnailWrapper}>
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={s.thumbnail} />
        ) : (
          <View style={[s.thumbnail, s.thumbnailPlaceholder]}>
            <MaterialIcons name="play-circle-outline" size={40} color={colors.primary} />
          </View>
        )}
        {/* Overlay play */}
        <View style={s.playOverlay}>
          <MaterialIcons name="play-circle-filled" size={48} color="rgba(255,255,255,0.9)" />
        </View>
        {/* Duración */}
        {item.duracion && (
          <View style={s.duracionBadge}>
            <Text style={s.duracionText}>{formatDuracion(item.duracion)}</Text>
          </View>
        )}
        {/* Número capítulo */}
        <View style={s.numeroBadge}>
          <Text style={s.numeroText}>CAP. {item.numero}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={s.info}>
        <Text style={s.titulo} numberOfLines={2}>{item.titulo}</Text>
        {item.descripcion ? (
          <Text style={s.descripcion} numberOfLines={2}>{item.descripcion}</Text>
        ) : null}
        {item.fechaPublicacion && (
          <Text style={s.fecha}>
            {new Date(item.fechaPublicacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerBrand}>
          <MaterialIcons name="live-tv" size={24} color={colors.primary} />
          <Text style={s.headerTitle}>Ganadero TV</Text>
        </View>
        <Text style={s.headerSub}>Serie documental ganadera</Text>
      </View>

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={capitulos}
          keyExtractor={(i) => i._id}
          contentContainerStyle={s.lista}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); cargar(); }}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <MaterialIcons name="live-tv" size={52} color={colors.onSurfaceVariant} />
              <Text style={s.emptyTitle}>Próximamente</Text>
              <Text style={s.emptyText}>Los capítulos aparecerán aquí cuando el administrador los publique.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = (c) => StyleSheet.create({
  container:          { flex: 1, backgroundColor: c.background },
  header:             { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 },
  headerBrand:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle:        { fontSize: 24, fontWeight: '700', color: c.onSurface },
  headerSub:          { fontSize: 13, color: c.onSurfaceVariant, marginTop: 2 },
  lista:              { padding: 16, gap: 20, paddingBottom: 40 },
  card:               { backgroundColor: c.surfaceContainer, borderRadius: 20, overflow: 'hidden' },
  thumbnailWrapper:   { position: 'relative', width: '100%', aspectRatio: 1 },
  thumbnail:          { width: '100%', height: '100%' },
  thumbnailPlaceholder:{ backgroundColor: c.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  playOverlay:        { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  duracionBadge:      { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  duracionText:       { color: '#fff', fontSize: 12, fontWeight: '700' },
  numeroBadge:        { position: 'absolute', top: 10, left: 10, backgroundColor: c.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  numeroText:         { color: c.onPrimary, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  info:               { padding: 16 },
  titulo:             { fontSize: 17, fontWeight: '700', color: c.onSurface, lineHeight: 23 },
  descripcion:        { fontSize: 13, color: c.onSurfaceVariant, marginTop: 6, lineHeight: 18 },
  fecha:              { fontSize: 11, color: c.onSurfaceVariant, marginTop: 8 },
  loader:             { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty:              { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32, gap: 12 },
  emptyTitle:         { fontSize: 18, fontWeight: '700', color: c.onSurface },
  emptyText:          { fontSize: 14, color: c.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
});

export default GanaderoTVScreen;
