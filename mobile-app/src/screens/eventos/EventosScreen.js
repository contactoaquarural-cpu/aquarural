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
  const [eventos,     setEventos]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [respondiendo, setRespondiendo] = useState(null);

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

  const responder = async (evento, respuesta) => {
    if (evento.respondida) return;
    setRespondiendo(evento._id);
    try {
      await api.post(`/eventos/${evento._id}/confirmar`, { respuesta });
      const msg = respuesta === 'ASISTIRE'
        ? '¡Genial! Tu asistencia fue registrada.'
        : 'Gracias por responder. Tu ausencia fue registrada.';
      show('success', respuesta === 'ASISTIRE' ? '¡Asistiré! ✅' : 'No podré asistir ❌', msg);
      cargar();
    } catch {
      show('error', 'Error', 'No se pudo registrar tu respuesta. Intenta de nuevo.');
    } finally {
      setRespondiendo(null);
    }
  };

  const styles = makeStyles(colors, typography);

  const renderEvento = ({ item }) => {
    const cfg = TIPO_CONFIG[item.tipo] || TIPO_CONFIG.OTRO;
    const fecha = new Date(item.fecha);
    const pasado = fecha < new Date();
    const cargando = respondiendo === item._id;

    return (
      <View style={[styles.card, item.respondida && styles.cardRespondida, pasado && styles.cardPasada]}>
        {/* Header tipo + badge respuesta */}
        <View style={styles.cardHeader}>
          <View style={[styles.tipoBadge, { backgroundColor: cfg.color + '22' }]}>
            <Text style={styles.tipoIcon}>{cfg.icon}</Text>
            <Text style={[styles.tipoLabel, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          {item.respondida && item.respuesta === 'ASISTIRE' && (
            <View style={styles.asistireBadge}>
              <MaterialIcons name="check-circle" size={14} color={colors.primary} />
              <Text style={styles.asistireText}>Asistiré</Text>
            </View>
          )}
          {item.respondida && item.respuesta === 'NO_ASISTIRE' && (
            <View style={styles.noAsistireBadge}>
              <MaterialIcons name="cancel" size={14} color={colors.error} />
              <Text style={styles.noAsistireText}>No asistiré</Text>
            </View>
          )}
          {!item.respondida && !pasado && (
            <View style={styles.pendienteBadge}>
              <MaterialIcons name="notifications-active" size={14} color="#f59e0b" />
              <Text style={styles.pendienteText}>Sin responder</Text>
            </View>
          )}
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

        {/* Botones de respuesta */}
        {!item.respondida && !pasado && (
          <View style={styles.botonesRow}>
            <TouchableOpacity
              style={[styles.btnAsistire, cargando && styles.btnDisabled]}
              onPress={() => responder(item, 'ASISTIRE')}
              disabled={cargando}
              activeOpacity={0.8}
            >
              <MaterialIcons name="check-circle-outline" size={18} color="#fff" />
              <Text style={styles.btnAsistireText}>
                {cargando ? 'Enviando...' : 'Sí, asistiré'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnNoAsistire, cargando && styles.btnDisabled]}
              onPress={() => responder(item, 'NO_ASISTIRE')}
              disabled={cargando}
              activeOpacity={0.8}
            >
              <MaterialIcons name="cancel" size={18} color={colors.error} />
              <Text style={styles.btnNoAsistireText}>No puedo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ya respondió */}
        {item.respondida && (
          <View style={styles.leidaRow}>
            <MaterialIcons
              name={item.respuesta === 'ASISTIRE' ? 'check-circle' : 'cancel'}
              size={16}
              color={item.respuesta === 'ASISTIRE' ? colors.primary : colors.error}
            />
            <Text style={[styles.leidaText, { color: item.respuesta === 'ASISTIRE' ? colors.primary : colors.error }]}>
              {item.respuesta === 'ASISTIRE' ? 'Confirmaste asistencia' : 'Registraste que no asistirás'}
            </Text>
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
  cardRespondida: { opacity: 0.85 },
  cardPasada:     { opacity: 0.65 },

  cardHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipoBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  tipoIcon:      { fontSize: 13 },
  tipoLabel:     { ...typography.small, fontWeight: '700' },

  asistireBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryContainer + '44', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  asistireText:    { ...typography.small, color: colors.primary, fontWeight: '700' },
  noAsistireBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.errorContainer + '44', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  noAsistireText:  { ...typography.small, color: colors.error, fontWeight: '700' },
  pendienteBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f59e0b22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  pendienteText:   { ...typography.small, color: '#f59e0b', fontWeight: '700' },

  titulo:      { ...typography.bodyBold },
  descripcion: { ...typography.body, color: colors.onSurfaceVariant },

  metaRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { ...typography.small, color: colors.outline, flex: 1 },

  botonesRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  btnAsistire: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             spacing.xs,
    backgroundColor: colors.primary,
    borderRadius:    radius.lg,
    paddingVertical: spacing.sm,
  },
  btnAsistireText:  { ...typography.bodyBold, color: colors.onPrimary, fontSize: 13 },
  btnNoAsistire: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             spacing.xs,
    backgroundColor: colors.errorContainer + '33',
    borderRadius:    radius.lg,
    paddingVertical: spacing.sm,
    borderWidth:     1,
    borderColor:     colors.error + '55',
  },
  btnNoAsistireText: { ...typography.bodyBold, color: colors.error, fontSize: 13 },
  btnDisabled:       { opacity: 0.6 },

  leidaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, justifyContent: 'center', marginTop: spacing.xs },
  leidaText: { ...typography.small, fontWeight: '600' },

  empty:      { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl },
  emptyIcon:  { fontSize: 52, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, marginBottom: spacing.xs, textAlign: 'center' },
  emptyDesc:  { ...typography.body, color: colors.onSurfaceVariant, textAlign: 'center' },
});

export default EventosScreen;
