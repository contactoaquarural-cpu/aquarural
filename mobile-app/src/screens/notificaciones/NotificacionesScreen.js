import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal, Pressable,
  StyleSheet, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import api from '../../services/api.service';
import { useAuthStore } from '../../store/auth.store';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';

const getTipoConfig = (colors) => ({
  MORA:        { icon: '⚠️', color: colors.tertiary },
  NOTICIA:     { icon: '📰', color: colors.primary },
  CONVENIO:    { icon: '🤝', color: '#82cfff' },
  GANADERO_TV: { icon: '📺', color: '#a78bfa' },
  PRECIO:      { icon: '💰', color: '#34d399' },
  MERCADO:     { icon: '🐄', color: '#fb923c' },
  SISTEMA:     { icon: '⚙️', color: colors.onSurfaceVariant },
});

const NotifItem = ({ item, onLongPress }) => {
  const { colors, typography } = useTheme();
  const config = getTipoConfig(colors)[item.tipo] || getTipoConfig(colors).SISTEMA;
  const styles = makeStyles(colors, typography);

  return (
    <TouchableOpacity
      style={[styles.item, !item.leido && styles.itemUnread]}
      onLongPress={() => onLongPress(item)}
      delayLongPress={400}
      activeOpacity={0.75}
    >
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
    </TouchableOpacity>
  );
};

const NotificacionesScreen = () => {
  const { colors, typography } = useTheme();
  const styles     = makeStyles(colors, typography);
  const navigation = useNavigation();
  const user       = useAuthStore((s) => s.user);

  const [notifs,          setNotifs]          = useState([]);
  const [eventosPendientes, setEventosPendientes] = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [refreshing,      setRefreshing]      = useState(false);
  const [selected,        setSelected]        = useState(null);

  const cargarNotifs = async () => {
    try {
      const [notifRes, eventosRes] = await Promise.all([
        api.get(`/asociados/${user?._id}/notificaciones`),
        api.get('/eventos/pendientes'),
      ]);
      setNotifs(notifRes.data.data ?? []);
      setEventosPendientes(eventosRes.data?.data?.length ?? 0);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { cargarNotifs(); }, []));

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarNotifs();
    setRefreshing(false);
  };

  const marcarLeida = async (notif) => {
    setSelected(null);
    if (notif.leido) return;
    try {
      await api.patch(`/asociados/${user?._id}/notificaciones/${notif._id}/leer`);
      setNotifs((prev) => prev.map((n) => n._id === notif._id ? { ...n, leido: true } : n));
    } catch {
      // silencioso
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await api.patch(`/asociados/${user?._id}/notificaciones/leer-todas`);
      setNotifs((prev) => prev.map((n) => ({ ...n, leido: true })));
    } catch {
      // silencioso
    }
  };

  if (loading) return <LoadingSpinner />;

  const sinLeer = notifs.filter((n) => !n.leido).length;

  return (
    <SafeAreaView style={styles.safe}>

      {/* Menú contextual por long press */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
          <View style={styles.menu}>
            <Text style={styles.menuTitulo} numberOfLines={1}>{selected?.titulo}</Text>
            <TouchableOpacity
              style={[styles.menuItem, selected?.leido && styles.menuItemDisabled]}
              onPress={() => marcarLeida(selected)}
              disabled={selected?.leido}
            >
              <MaterialIcons name="mark-email-read" size={20} color={selected?.leido ? colors.outline : colors.primary} />
              <Text style={[styles.menuItemText, selected?.leido && styles.menuItemTextDisabled]}>
                {selected?.leido ? 'Ya está leída' : 'Marcar como leída'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItemCancel} onPress={() => setSelected(null)}>
              <Text style={styles.menuItemCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Header */}
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
        {sinLeer > 0 ? (
          <TouchableOpacity style={styles.leerTodas} onPress={marcarTodasLeidas}>
            <Text style={styles.leerTodasText}>Leer todas</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 72 }} />
        )}
      </View>

      {/* Banner eventos pendientes de confirmar */}
      {eventosPendientes > 0 && (
        <TouchableOpacity
          style={styles.eventoBanner}
          onPress={() => navigation.navigate('Eventos')}
          activeOpacity={0.85}
        >
          <View style={styles.eventoBannerLeft}>
            <Text style={styles.eventoBannerIcon}>📅</Text>
            <View>
              <Text style={styles.eventoBannerTitle}>
                {eventosPendientes} convocatoria{eventosPendientes > 1 ? 's' : ''} pendiente{eventosPendientes > 1 ? 's' : ''}
              </Text>
              <Text style={styles.eventoBannerSub}>Toca para confirmar lectura</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.primary} />
        </TouchableOpacity>
      )}

      {sinLeer > 0 && (
        <Text style={styles.hint}>Mantén presionada una notificación para marcarla como leída</Text>
      )}

      <FlatList
        data={notifs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <NotifItem item={item} onLongPress={setSelected} />}
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

const makeStyles = (colors, typography) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.md,
  },
  backBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
  backText:     { ...typography.body, color: colors.primary, fontWeight: '600' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title:        { ...typography.h2 },
  badge: {
    backgroundColor:   colors.tertiary,
    borderRadius:      radius.full,
    minWidth:          20,
    height:            20,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: 5,
  },
  badgeText:      { ...typography.label, color: colors.tertiaryContainer, fontSize: 10 },
  leerTodas:      { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  leerTodasText:  { ...typography.label, color: colors.primary, fontWeight: '700' },

  eventoBanner: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   colors.primaryContainer + '33',
    borderWidth:       1,
    borderColor:       colors.primary + '44',
    marginHorizontal:  spacing.lg,
    marginBottom:      spacing.sm,
    borderRadius:      radius.xl,
    padding:           spacing.md,
  },
  eventoBannerLeft:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  eventoBannerIcon:  { fontSize: 24 },
  eventoBannerTitle: { ...typography.bodyBold, color: colors.primary },
  eventoBannerSub:   { ...typography.small, color: colors.onSurfaceVariant, marginTop: 2 },

  hint: {
    ...typography.small,
    textAlign:         'center',
    color:             colors.onSurfaceVariant,
    paddingHorizontal: spacing.lg,
    paddingBottom:     spacing.sm,
  },

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
    width:          40,
    height:         40,
    borderRadius:   radius.md,
    alignItems:     'center',
    justifyContent: 'center',
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

  empty:     { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { ...typography.h3, textAlign: 'center' },
  emptySub:  { ...typography.body, textAlign: 'center' },

  // Modal menú contextual
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'flex-end',
  },
  menu: {
    backgroundColor: colors.surfaceContainerHigh,
    borderTopLeftRadius:  radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop:      spacing.md,
    paddingBottom:   spacing.xxl,
    paddingHorizontal: spacing.lg,
    gap:             spacing.sm,
  },
  menuTitulo: {
    ...typography.label,
    color:         colors.onSurfaceVariant,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
  },
  menuItem: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius:    radius.md,
  },
  menuItemDisabled:     { opacity: 0.4 },
  menuItemText:         { ...typography.bodyBold, color: colors.primary },
  menuItemTextDisabled: { color: colors.outline },
  menuItemCancel: {
    alignItems:      'center',
    paddingVertical: spacing.md,
    marginTop:       spacing.xs,
    backgroundColor: colors.surfaceContainerHighest,
    borderRadius:    radius.md,
  },
  menuItemCancelText: { ...typography.bodyBold, color: colors.onSurfaceVariant },
});

export default NotificacionesScreen;
