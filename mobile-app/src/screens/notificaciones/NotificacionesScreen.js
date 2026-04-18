import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import api from '../../services/api.service';
import { useAuthStore } from '../../store/auth.store';
import LoadingSpinner from '../../components/LoadingSpinner';
import { colors, spacing, radius, typography } from '../../utils/theme';

const TIPO_CONFIG = {
  MORA:        { icon: '⚠️', color: colors.tertiary },
  NOTICIA:     { icon: '📰', color: colors.primary },
  CONVENIO:    { icon: '🤝', color: '#82cfff' },
  SISTEMA:     { icon: '⚙️', color: colors.onSurfaceVariant },
};

const NotifItem = ({ item }) => {
  const config = TIPO_CONFIG[item.tipo] || TIPO_CONFIG.SISTEMA;
  return (
    <View style={[styles.item, !item.leido && styles.itemUnread]}>
      <View style={[styles.iconBox, { backgroundColor: config.color + '22' }]}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitulo} numberOfLines={1}>{item.titulo}</Text>
          {!item.leido && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.itemMensaje} numberOfLines={2}>{item.mensaje}</Text>
        <Text style={styles.itemFecha}>
          {new Date(item.createdAt).toLocaleDateString('es-CO', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </Text>
      </View>
    </View>
  );
};

const NotificacionesScreen = () => {
  const navigation   = useNavigation();
  const user         = useAuthStore((s) => s.user);
  const [notifs,     setNotifs]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarNotifs = async () => {
    try {
      const { data } = await api.get(`/asociados/${user?._id}/notificaciones`);
      setNotifs(data.data ?? []);
    } catch {
      // Sin notificaciones o error silencioso
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarNotifs(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarNotifs();
    setRefreshing(false);
  };

  if (loading) return <LoadingSpinner />;

  const sinLeer = notifs.filter((n) => !n.leido).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Notificaciones</Text>
          {sinLeer > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{sinLeer}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={notifs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <NotifItem item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>Sin notificaciones por ahora.</Text>
            <Text style={styles.emptySub}>Te avisaremos cuando haya novedades.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.md,
  },
  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
  backText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title:        { ...typography.h2 },
  badge: {
    backgroundColor: colors.tertiary,
    borderRadius:    radius.full,
    minWidth:        20,
    height:          20,
    alignItems:      'center',
    justifyContent:  'center',
    paddingHorizontal: 5,
  },
  badgeText: { ...typography.label, color: colors.tertiaryContainer, fontSize: 10 },

  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },

  item: {
    flexDirection:   'row',
    gap:             spacing.md,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.xl,
    padding:         spacing.md,
    alignItems:      'flex-start',
  },
  itemUnread: { backgroundColor: colors.primaryContainer + '22' },
  iconBox: {
    width:           40,
    height:          40,
    borderRadius:    radius.md,
    alignItems:      'center',
    justifyContent:  'center',
  },
  icon:        { fontSize: 20 },
  itemContent: { flex: 1, gap: 4 },
  itemHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitulo:  { ...typography.bodyBold, flex: 1 },
  unreadDot: {
    width:           8,
    height:          8,
    borderRadius:    4,
    backgroundColor: colors.primary,
    marginLeft:      spacing.sm,
  },
  itemMensaje: { ...typography.body, lineHeight: 18 },
  itemFecha:   { ...typography.small, marginTop: 2 },

  empty:    { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { ...typography.h3, textAlign: 'center' },
  emptySub:  { ...typography.body, textAlign: 'center' },
});

export default NotificacionesScreen;
