import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../../utils/ThemeContext';
import api from '../../services/api.service';

const ESTADO_MAP = {
  PENDIENTE: { label: 'En revisión', color: '#f59e0b', icon: 'schedule' },
  APROBADO:  { label: 'Publicado',   color: '#10b981', icon: 'check-circle' },
  RECHAZADO: { label: 'Rechazado',   color: '#ef4444', icon: 'cancel' },
};

const MisPublicacionesScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const s = styles(colors);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargar = async () => {
    try {
      const res = await api.get('/publicaciones/me/mis-publicaciones');
      setPublicaciones(res.data.data ?? []);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { cargar(); }, []));

  const eliminar = (id) => {
    Alert.alert(
      'Eliminar publicación',
      '¿Seguro que quieres eliminar este aviso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/publicaciones/${id}`);
              setPublicaciones((prev) => prev.filter((p) => p._id !== id));
            } catch {
              Alert.alert('Error', 'No se pudo eliminar. Intenta de nuevo.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const estado = ESTADO_MAP[item.estado] ?? ESTADO_MAP.PENDIENTE;
    return (
      <View style={s.card}>
        {item.fotos?.length > 0 ? (
          <Image source={{ uri: item.fotos[0] }} style={s.foto} />
        ) : (
          <View style={[s.foto, s.fotoPlaceholder]}>
            <MaterialIcons name="image-not-supported" size={24} color={colors.onSurfaceVariant} />
          </View>
        )}
        <View style={s.cardBody}>
          <Text style={s.titulo} numberOfLines={2}>{item.titulo}</Text>

          {/* Badge de estado */}
          <View style={[s.estadoBadge, { backgroundColor: estado.color + '22' }]}>
            <MaterialIcons name={estado.icon} size={12} color={estado.color} />
            <Text style={[s.estadoLabel, { color: estado.color }]}>{estado.label}</Text>
          </View>

          {item.estado === 'RECHAZADO' && item.motivoRechazo && (
            <Text style={s.motivoRechazo} numberOfLines={2}>
              Motivo: {item.motivoRechazo}
            </Text>
          )}

          {item.precio && (
            <Text style={s.precio}>${item.precio.toLocaleString('es-CO')} COP</Text>
          )}
          <Text style={s.fecha}>{new Date(item.createdAt).toLocaleDateString('es-CO')}</Text>
        </View>
        <TouchableOpacity style={s.btnEliminar} onPress={() => eliminar(item._id)}>
          <MaterialIcons name="delete-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mis publicaciones</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CrearPublicacion')}>
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={publicaciones}
          keyExtractor={(i) => i._id}
          contentContainerStyle={s.lista}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <MaterialIcons name="post-add" size={48} color={colors.onSurfaceVariant} />
              <Text style={s.emptyText}>Aún no tienes publicaciones</Text>
              <TouchableOpacity style={s.btnCrear} onPress={() => navigation.navigate('CrearPublicacion')}>
                <Text style={s.btnCrearText}>Crear mi primer aviso</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = (c) => StyleSheet.create({
  container:      { flex: 1, backgroundColor: c.background },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: c.onSurface },
  lista:          { padding: 16, gap: 12 },
  card:           { flexDirection: 'row', backgroundColor: c.surfaceContainer, borderRadius: 16, overflow: 'hidden', alignItems: 'flex-start' },
  foto:           { width: 90, height: 90 },
  fotoPlaceholder:{ backgroundColor: c.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  cardBody:       { flex: 1, padding: 12, gap: 4 },
  titulo:         { fontSize: 14, fontWeight: '600', color: c.onSurface },
  estadoBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 4 },
  estadoLabel:    { fontSize: 11, fontWeight: '700' },
  motivoRechazo:  { fontSize: 11, color: c.error, lineHeight: 16 },
  precio:         { fontSize: 13, fontWeight: '700', color: c.primary },
  fecha:          { fontSize: 11, color: c.onSurfaceVariant },
  btnEliminar:    { padding: 12 },
  loader:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty:          { alignItems: 'center', paddingTop: 64, gap: 12 },
  emptyText:      { fontSize: 14, color: c.onSurfaceVariant },
  btnCrear:       { backgroundColor: c.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, marginTop: 8 },
  btnCrearText:   { color: c.onPrimary, fontWeight: '700', fontSize: 14 },
});

export default MisPublicacionesScreen;
