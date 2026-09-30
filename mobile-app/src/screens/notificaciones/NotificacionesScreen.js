import { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotificacionesStore } from '../../store/notificaciones.store';
import { colors, radii, fonts } from '../../theme/tokens';

const TIPO_CONFIG = {
  PAGO_CONFIRMADO: { icono: 'check-circle', color: colors.emerald, bg: colors.emeraldBg },
  FACTURA_VENCIDA: { icono: 'error-outline', color: colors.rojo, bg: colors.rojoBg },
  PROXIMO_VENCIMIENTO: { icono: 'schedule', color: colors.amber, bg: colors.amberBg },
  EN_MORA: { icono: 'warning', color: colors.amber, bg: colors.amberBg },
  EVENTO: { icono: 'event', color: colors.azulMarca, bg: '#EFF6FF' },
};

const formatFechaRelativa = (fecha) => {
  const diff = Date.now() - new Date(fecha).getTime();
  const minutos = Math.floor(diff / 60000);
  if (minutos < 1) return 'Ahora';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  if (dias < 7) return `Hace ${dias} d`;
  return new Date(fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const NotificacionCard = ({ notificacion, onPress }) => {
  const tipo = TIPO_CONFIG[notificacion.tipo] || TIPO_CONFIG.EVENTO;

  return (
    <TouchableOpacity
      style={[styles.card, !notificacion.leida && styles.cardNoLeida]}
      activeOpacity={0.7}
      onPress={() => onPress(notificacion)}
    >
      <View style={[styles.icono, { backgroundColor: tipo.bg }]}>
        <MaterialIcons name={tipo.icono} size={18} color={tipo.color} />
      </View>
      <View style={styles.contenido}>
        <View style={styles.filaSuperior}>
          <Text style={styles.cardTitulo} numberOfLines={1}>
            {notificacion.titulo}
          </Text>
          {!notificacion.leida && <View style={styles.puntoNoLeida} />}
        </View>
        <Text style={styles.cuerpo} numberOfLines={2}>
          {notificacion.cuerpo}
        </Text>
        <Text style={styles.fecha}>{formatFechaRelativa(notificacion.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const NotificacionesScreen = () => {
  const navigation = useNavigation();
  const { notificaciones, isLoading, error, cargarNotificaciones, marcarLeida, marcarTodasLeidas } =
    useNotificacionesStore();
  const [refrescando, setRefrescando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarNotificaciones();
    }, [])
  );

  const handleRefrescar = async () => {
    setRefrescando(true);
    await cargarNotificaciones();
    setRefrescando(false);
  };

  const handlePress = (notificacion) => {
    if (!notificacion.leida) marcarLeida(notificacion._id);
  };

  const hayNoLeidas = notificaciones.some((n) => !n.leida);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.botonAtras}>
          <MaterialIcons name="arrow-back" size={22} color={colors.textoPrincipal} />
        </TouchableOpacity>
        <View style={styles.headerTexto}>
          <Text style={styles.titulo}>Notificaciones</Text>
          <Text style={styles.subtitulo}>Pagos, mora y convocatorias</Text>
        </View>
        {hayNoLeidas && (
          <TouchableOpacity onPress={marcarTodasLeidas} activeOpacity={0.7}>
            <Text style={styles.marcarTodas}>Marcar todas</Text>
          </TouchableOpacity>
        )}
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
          data={notificaciones}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={handleRefrescar} tintColor={colors.azulMarca} />}
          renderItem={({ item }) => <NotificacionCard notificacion={item} onPress={handlePress} />}
          ListEmptyComponent={
            <View style={styles.vacioContenedor}>
              <MaterialIcons name="notifications-none" size={32} color={colors.textoTenue} />
              <Text style={styles.vacio}>No tienes notificaciones todavía.</Text>
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
  headerTexto: { flex: 1 },
  titulo: { fontFamily: fonts.headlineBold, fontSize: 18, color: colors.textoPrincipal },
  subtitulo: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textoSecundario, marginTop: 2 },
  marcarTodas: { fontFamily: fonts.headlineSemiBold, fontSize: 12, color: colors.azulMarca },
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
    flexDirection: 'row',
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radii['2xl'],
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  cardNoLeida: { borderColor: colors.azulMarca, backgroundColor: '#EFF6FF' },
  icono: {
    width: 38,
    height: 38,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contenido: { flex: 1 },
  filaSuperior: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitulo: { fontFamily: fonts.headlineSemiBold, fontSize: 14, color: colors.textoPrincipal, flexShrink: 1 },
  puntoNoLeida: { width: 6, height: 6, borderRadius: radii.full, backgroundColor: colors.azulMarca },
  cuerpo: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textoSecundario, marginTop: 3 },
  fecha: { fontFamily: fonts.bodyRegular, fontSize: 10, color: colors.textoTenue, marginTop: 6 },
});

export default NotificacionesScreen;
