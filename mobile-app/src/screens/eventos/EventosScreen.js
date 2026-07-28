import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api.service';
import { useTheme } from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';
import { Toast, useToast } from '../../components/AppToast';

const TIPO_CONFIG = {
  COMITE:       { icon: '🏛️', label: 'Comité',       color: '#60a5fa' },
  REUNION:      { icon: '🤝', label: 'Reunión',      color: '#5BB893' },
  CAPACITACION: { icon: '📚', label: 'Capacitación', color: '#fbbf24' },
  OTRO:         { icon: '📅', label: 'Evento',       color: '#a78bfa' },
};

const EventosScreen = ({ navigation }) => {
  const { colors, typography } = useTheme();
  const { show, toastProps } = useToast();
  const [eventos,    setEventos]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmando, setConfirmando] = useState(null);

  const cargar = async () => {
    try {
      const r = await api.get('/eventos/mis-eventos');
      setEventos(r.data.data ?? []);
    } catch {
      show('error', 'Error', 'No se pudieron cargar los eventos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { cargar(); }, []));

  const confirmarLectura = async (evento) => {
    if (evento.confirmada) return;
    Alert.alert(
      'Confirmar lectura',
      `¿Confirmas que leíste la convocatoria para "${evento.titulo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setConfirmando(evento._id);
            try {
              await api.post(`/eventos/${evento._id}/confirmar`);
              show('success', '¡Lectura confirmada!', 'Tu confirmación fue registrada.');
              cargar();
            } catch {
              show('error', 'Error', 'No se pudo confirmar. Intenta de nuevo.');
            } finally {
              setConfirmando(null);
            }
          },
        },
      ]
    );
  };

  const styles = makeStyles(colors, typography);

  const renderEvento = ({ item }) => {
    const cfg = TIPO_CONFIG[item.tipo] || TIPO_CONFIG.OTRO;
    const fecha = new Date(item.fecha);
    const pasado = fecha < new Date();

    return (
      <View style={[styles.card, item.confirmada && styles.cardConfirmada, pasado && styles.cardPasada]}>
        {/* Header tipo + badge */}
        <View style={styles.cardHeader}>
          <View style={[styles.tipoBadge, { backgroundColor: cfg.color + '22' }]}>
            <Text style={styles.tipoIcon}>{cfg.icon}</Text>
            <Text style={[styles.tipoLabel, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          {item.confirmada ? (
            <View style={styles.confirmadaBadge}>
              <MaterialIcons name="check-circle" size={14} color={colors.primary} />
              <Text style={styles.confirmadaText}>Leída</Text>
            </View>
          ) : !pasado ? (
            <View style={styles.pendienteBadge}>
              <MaterialIcons name="notifications-active" size={14} color={colors.error} />
              <Text style={styles.pendienteText}>Pendiente</Text>
            </View>
          ) : null}
        </View>

        {/* Título */}
        <Text style={styles.titulo}>{item.titulo}</Text>

        {/* Descripción */}
        {!!item.descripcion && (
          <Text style={styles.descripcion}>{item.descripcion}</Text>
        )}

        {/* Fecha y lugar */}
        <View style={styles.metaRow}>
          <MaterialIcons name="event" size={14} color={colors.outline} />
          <Text style={styles.metaText}>
            {fecha.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' · '}
            {fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {!!item.lugar && (
          <View style={styles.metaRow}>
            <MaterialIcons name="location-on" size={14} color={colors.outline} />
            <Text style={styles.metaText}>{item.lugar}</Text>
          </View>
        )}

        {/* Botón confirmar */}
        {!item.confirmada && !pasado && (
          <TouchableOpacity
            style={[styles.btnConfirmar, confirmando === item._id && styles.btnDisabled]}
            onPress={() => confirmarLectura(item)}
            disabled={confirmando === item._id}
            activeOpacity={0.8}
          >
            <MaterialIcons name="check-circle-outline" size={18} color="#fff" />
            <Text style={styles.btnConfirmarText}>
              {confirmando === item._id ? 'Confirmando...' : 'Confirmar lectura'}
            </Text>
          </TouchableOpacity>
        )}

        {item.confirmada && (
          <View style={styles.leidaRow}>
            <MaterialIcons name="check-circle" size={16} color={colors.primary} />
            <Text style={styles.leidaText}>Lectura confirmada</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Toast {...toastProps} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Eventos y Convocatorias</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item._id}
        renderItem={renderEvento}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={colors.primary} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>Sin eventos por ahora</Text>
              <Text style={styles.emptyDesc}>Cuando la asociación convoque una reunión o comité aparecerá aquí.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors, typography) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  backBtn:     { padding: spacing.xs },
  headerTitle: { ...typography.h3, flex: 1, textAlign: 'center' },

  list: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },

  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.xl,
    padding:         spacing.md,
    gap:             spacing.sm,
  },
  cardConfirmada: { opacity: 0.85 },
  cardPasada:     { opacity: 0.65 },

  cardHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipoBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  tipoIcon:      { fontSize: 13 },
  tipoLabel:     { ...typography.small, fontWeight: '700' },

  confirmadaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryContainer + '44', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  confirmadaText:  { ...typography.small, color: colors.primary, fontWeight: '700' },
  pendienteBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.errorContainer + '44', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  pendienteText:   { ...typography.small, color: colors.error, fontWeight: '700' },

  titulo:      { ...typography.bodyBold },
  descripcion: { ...typography.body, color: colors.onSurfaceVariant },

  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { ...typography.small, color: colors.outline, flex: 1 },

  btnConfirmar: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             spacing.xs,
    backgroundColor: colors.primary,
    borderRadius:    radius.lg,
    paddingVertical: spacing.sm,
    marginTop:       spacing.xs,
  },
  btnDisabled:      { opacity: 0.6 },
  btnConfirmarText: { ...typography.bodyBold, color: colors.onPrimary },

  leidaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.xs },
  leidaText: { ...typography.small, color: colors.primary, fontWeight: '600' },

  empty:      { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl },
  emptyIcon:  { fontSize: 52, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, marginBottom: spacing.xs, textAlign: 'center' },
  emptyDesc:  { ...typography.body, color: colors.onSurfaceVariant, textAlign: 'center' },
});

export default EventosScreen;
