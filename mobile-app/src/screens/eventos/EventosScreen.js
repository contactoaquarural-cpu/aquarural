import { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEventosStore } from '../../store/eventos.store';
import { colors, radii, fonts } from '../../theme/tokens';

const TIPO_CONFIG = {
  ASAMBLEA_GENERAL: { label: 'Asamblea General', icono: 'groups' },
  MANTENIMIENTO_BOCATOMA: { label: 'Mantenimiento Bocatoma', icono: 'plumbing' },
  REUNION_JUNTA: { label: 'Reunión de Junta', icono: 'meeting-room' },
};

const ESTADO_CONFIG = {
  PROGRAMADO: { label: 'Programado', bg: '#EFF6FF', texto: colors.azulMarca },
  REALIZADO: { label: 'Realizado', bg: colors.emeraldBg, texto: colors.emerald },
  CANCELADO: { label: 'Cancelado', bg: colors.rojoBg, texto: colors.rojo },
};

const formatFecha = (fecha) => {
  if (!fecha) return '';
  const [anio, mes, dia] = fecha.split('-');
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${anio}`;
};

const EventoCard = ({ evento, confirmando, onConfirmar }) => {
  const tipo = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.ASAMBLEA_GENERAL;
  const estado = ESTADO_CONFIG[evento.estado] || ESTADO_CONFIG.PROGRAMADO;
  const puedeResponder = evento.estado === 'PROGRAMADO';

  return (
    <View style={styles.card}>
      <View style={styles.filaSuperior}>
        <View style={styles.tipoIcono}>
          <MaterialIcons name={tipo.icono} size={18} color={colors.azulMarca} />
        </View>
        <View style={styles.filaSuperiorTexto}>
          <Text style={styles.titulo} numberOfLines={2}>
            {evento.titulo}
          </Text>
          <Text style={styles.tipoLabel}>{tipo.label}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: estado.bg }]}>
          <Text style={[styles.badgeTexto, { color: estado.texto }]}>{estado.label}</Text>
        </View>
      </View>

      <View style={styles.detalles}>
        <View style={styles.detalleFila}>
          <MaterialIcons name="event" size={14} color={colors.textoTenue} />
          <Text style={styles.detalleTexto}>{formatFecha(evento.fecha)} · {evento.hora}</Text>
        </View>
        <View style={styles.detalleFila}>
          <MaterialIcons name="location-on" size={14} color={colors.textoTenue} />
          <Text style={styles.detalleTexto}>{evento.lugar}</Text>
        </View>
      </View>

      {evento.descripcion ? <Text style={styles.descripcion}>{evento.descripcion}</Text> : null}

      {puedeResponder && (
        <View style={styles.rsvpContenedor}>
          <Text style={styles.rsvpLabel}>¿Asistirás?</Text>
          <View style={styles.rsvpBotones}>
            <TouchableOpacity
              style={[styles.rsvpBoton, evento.miRespuesta === 'SI' && styles.rsvpBotonSiActivo]}
              activeOpacity={0.7}
              disabled={confirmando}
              onPress={() => onConfirmar(evento._id, 'SI')}
            >
              <MaterialIcons name="check" size={16} color={evento.miRespuesta === 'SI' ? colors.blanco : colors.emerald} />
              <Text style={[styles.rsvpBotonTexto, evento.miRespuesta === 'SI' && styles.rsvpBotonTextoActivo]}>
                Sí, asistiré
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rsvpBoton, evento.miRespuesta === 'NO' && styles.rsvpBotonNoActivo]}
              activeOpacity={0.7}
              disabled={confirmando}
              onPress={() => onConfirmar(evento._id, 'NO')}
            >
              <MaterialIcons name="close" size={16} color={evento.miRespuesta === 'NO' ? colors.blanco : colors.rojo} />
              <Text style={[styles.rsvpBotonTexto, evento.miRespuesta === 'NO' && styles.rsvpBotonTextoActivo]}>
                No asistiré
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const EventosScreen = () => {
  const navigation = useNavigation();
  const { eventos, isLoading, error, confirmandoId, cargarEventos, confirmarAsistencia } = useEventosStore();
  const [refrescando, setRefrescando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarEventos();
    }, [])
  );

  const handleRefrescar = async () => {
    setRefrescando(true);
    await cargarEventos();
    setRefrescando(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.botonAtras}>
          <MaterialIcons name="arrow-back" size={22} color={colors.textoPrincipal} />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Eventos y Convocatorias</Text>
          <Text style={styles.subtitulo}>Reuniones y actividades de tu acueducto</Text>
        </View>
      </View>

      {isLoading && !refrescando ? (
        <ActivityIndicator style={styles.spacer} color={colors.azulMarca} />
      ) : error ? (
        <View style={styles.bannerError}>
          <MaterialIcons name="error-outline" size={18} color={colors.rojo} />
          <Text style={styles.bannerErrorTexto}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={handleRefrescar} tintColor={colors.azulMarca} />}
          renderItem={({ item }) => (
            <EventoCard evento={item} confirmando={confirmandoId === item._id} onConfirmar={confirmarAsistencia} />
          )}
          ListEmptyComponent={
            <View style={styles.vacioContenedor}>
              <MaterialIcons name="event-busy" size={32} color={colors.textoTenue} />
              <Text style={styles.vacio}>No hay eventos convocados por ahora.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.superficieSutil },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  botonAtras: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontFamily: fonts.headlineBold, fontSize: 18, color: colors.textoPrincipal },
  subtitulo: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textoSecundario, marginTop: 2 },
  spacer: { marginVertical: 24 },
  lista: { paddingHorizontal: 20, paddingBottom: 40, flexGrow: 1 },
  bannerError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.rojoBg,
    borderWidth: 1,
    borderColor: colors.rojoBorde,
    borderRadius: radii['2xl'],
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerErrorTexto: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.rojo, flex: 1 },
  vacioContenedor: { alignItems: 'center', paddingTop: 60, gap: 8 },
  vacio: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textoSecundario },

  card: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radii['2xl'],
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  filaSuperior: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  tipoIcono: {
    width: 34,
    height: 34,
    borderRadius: radii.xl,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  filaSuperiorTexto: { flex: 1 },
  tipoLabel: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.textoTenue, marginTop: 2 },
  badge: { borderRadius: radii.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTexto: { fontFamily: fonts.headlineBold, fontSize: 9, textTransform: 'uppercase' },
  detalles: { gap: 6, marginBottom: 8 },
  detalleFila: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detalleTexto: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textoSecundario },
  descripcion: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textoSecundario, marginBottom: 4 },
  rsvpContenedor: { borderTopWidth: 1, borderTopColor: colors.borde, marginTop: 8, paddingTop: 12 },
  rsvpLabel: { fontFamily: fonts.headlineSemiBold, fontSize: 12, color: colors.textoPrincipal, marginBottom: 8 },
  rsvpBotones: { flexDirection: 'row', gap: 8 },
  rsvpBoton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radii.xl,
    paddingVertical: 10,
  },
  rsvpBotonSiActivo: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  rsvpBotonNoActivo: { backgroundColor: colors.rojo, borderColor: colors.rojo },
  rsvpBotonTexto: { fontFamily: fonts.headlineSemiBold, fontSize: 12, color: colors.textoPrincipal },
  rsvpBotonTextoActivo: { color: colors.blanco },
});

export default EventosScreen;
