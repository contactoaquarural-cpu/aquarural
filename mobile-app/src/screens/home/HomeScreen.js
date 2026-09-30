import { useCallback, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useFacturasStore } from '../../store/facturas.store';
import { useEventosStore } from '../../store/eventos.store';
import { useNotificacionesStore } from '../../store/notificaciones.store';
import FacturaCard from '../../components/FacturaCard';
import { colors, radii, fonts } from '../../theme/tokens';

const formatMonto = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor || 0);

const formatFechaCorta = (fecha) => {
  if (!fecha) return '';
  const d = new Date(fecha);
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
};

const formatPeriodo = (periodo) => {
  if (!periodo) return '';
  const [anio, mes] = periodo.split('-');
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${MESES[Number(mes) - 1] || mes} ${anio}`;
};

const ESTADO_SERVICIO_LABEL = {
  ACTIVO: 'Activo',
  SUSPENDIDO: 'Suspendido',
  CORTE_PROGRAMADO: 'Corte programado',
};

// Color semántico por estado — el suscriptor debe reconocer "algo anda mal"
// de un vistazo, sin tener que leer el texto (ACTIVO = todo bien, verde;
// SUSPENDIDO = urgente, rojo; CORTE_PROGRAMADO = advertencia, ámbar).
const ESTADO_SERVICIO_COLOR = {
  ACTIVO: { bg: colors.emeraldBg, borde: colors.emeraldBorde, texto: colors.emerald },
  SUSPENDIDO: { bg: colors.rojoBg, borde: colors.rojoBorde, texto: colors.rojo },
  CORTE_PROGRAMADO: { bg: colors.amberBg, borde: colors.amber, texto: colors.amber },
};

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const formatMesCorto = (periodo) => {
  if (!periodo) return '';
  const [, mes] = periodo.split('-');
  return MESES_CORTOS[Number(mes) - 1] || periodo;
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, refrescarUsuario } = useAuthStore();
  const { facturas, isLoading, cargarFacturas, historialConsumo, cargarHistorialConsumo } = useFacturasStore();
  const { eventos, cargarEventos } = useEventosStore();
  const { notificaciones, cargarNotificaciones } = useNotificacionesStore();
  const [refrescando, setRefrescando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarFacturas();
      cargarEventos();
      cargarNotificaciones();
      refrescarUsuario();
      // Sin medidor (Tarifa Fija) nunca hay LecturaHistorica que traer.
      const tieneMedidorAlEnfocar = Boolean(user?.numeroMedidor) && user.numeroMedidor !== 'S/N';
      if (user?._id && tieneMedidorAlEnfocar) cargarHistorialConsumo(user._id);
    }, [user?._id, user?.numeroMedidor])
  );

  const eventosSinResponder = eventos.filter((e) => e.estado === 'PROGRAMADO' && !e.miRespuesta).length;
  const notificacionesSinLeer = notificaciones.filter((n) => !n.leida).length;

  const pendientes = facturas.filter((f) => f.estado === 'PENDIENTE' || f.estado === 'VENCIDA');
  const deudaTotal = pendientes.reduce((acc, f) => acc + (f.montoTotal || 0), 0);
  const alDia = pendientes.length === 0;
  const ultimaFactura = facturas[0];

  const proximaAVencer = [...pendientes].sort(
    (a, b) => new Date(a.fechaVencimiento) - new Date(b.fechaVencimiento)
  )[0];

  const estadoServicioKey = user?.estadoServicio || 'ACTIVO';
  const estadoServicioLabel = ESTADO_SERVICIO_LABEL[estadoServicioKey] || 'Activo';
  const estadoServicioColor = ESTADO_SERVICIO_COLOR[estadoServicioKey] || ESTADO_SERVICIO_COLOR.ACTIVO;

  // Un suscriptor de Tarifa Fija no tiene medidor, así que nunca tendrá
  // LecturaHistorica — mismo criterio que ya usa web-admin en el expediente
  // (ExpedientePage.jsx) para ocultar por completo la sección de consumo.
  const tieneMedidor = Boolean(user?.numeroMedidor) && user.numeroMedidor !== 'S/N';

  // El backend devuelve el historial más reciente primero (-periodo); el
  // gráfico necesita orden cronológico ascendente (izquierda = más viejo).
  const ultimosMeses = [...historialConsumo].slice(0, 6).reverse();
  const consumoMax = Math.max(1, ...ultimosMeses.map((m) => m.consumoM3));

  const handleRefrescar = async () => {
    setRefrescando(true);
    await cargarFacturas();
    setRefrescando(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contenido}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={handleRefrescar} tintColor={colors.azulMarca} />}
    >
      <View style={styles.header}>
        <View style={styles.headerTexto}>
          <Text style={styles.saludo}>Hola,</Text>
          <Text style={styles.nombre} numberOfLines={1}>
            {user?.nombres} {user?.apellidos}
          </Text>
        </View>
        <View style={styles.headerAcciones}>
          <TouchableOpacity
            style={styles.headerIcono}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Eventos')}
          >
            <MaterialIcons name="event" size={22} color={colors.textoSecundario} />
            {eventosSinResponder > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeTexto}>{eventosSinResponder > 9 ? '9+' : eventosSinResponder}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIcono}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notificaciones')}
          >
            <MaterialIcons name="notifications-none" size={22} color={colors.textoSecundario} />
            {notificacionesSinLeer > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeTexto}>{notificacionesSinLeer > 9 ? '9+' : notificacionesSinLeer}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isLoading && !refrescando ? (
        <ActivityIndicator style={styles.spacer} color={colors.azulMarca} />
      ) : (
        <>
          {/* Hero: único bloque protagonista de la pantalla. Con deuda, fondo
              sólido azul de marca (con personalidad propia, no un badge
              pastel genérico) y el botón Pagar integrado. Al día, se aplana
              a una franja verde mínima — el verde es un acento breve, no el
              centro de atención de toda la tarjeta. */}
          {alDia ? (
            <View style={styles.heroAlDia}>
              <View style={styles.heroAlDiaIcono}>
                <MaterialIcons name="check" size={18} color={colors.blanco} />
              </View>
              <Text style={styles.heroAlDiaTexto}>Estás al día con tu acueducto</Text>
            </View>
          ) : (
            <View style={styles.heroDeuda}>
              <Text style={styles.heroLabel}>DEUDA ACTUAL</Text>
              <Text style={styles.heroMonto}>{formatMonto(deudaTotal)}</Text>
              <Text style={styles.heroDetalle}>
                {pendientes.length} {pendientes.length === 1 ? 'factura pendiente' : 'facturas pendientes'}
                {proximaAVencer && ` · vence ${formatFechaCorta(proximaAVencer.fechaVencimiento)}`}
              </Text>
              <TouchableOpacity
                style={styles.botonPagar}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Pagar')}
              >
                <Text style={styles.botonPagarTexto}>Pagar ahora</Text>
                <MaterialIcons name="arrow-forward" size={16} color={colors.azulMarca} />
              </TouchableOpacity>
            </View>
          )}

          {/* Datos de apoyo como tarjetas — el estado del servicio es el
              único con color semántico (verde/ámbar/rojo): es el dato que
              más le importa saber al suscriptor de un vistazo. Consumo y
              matrícula quedan neutros, son informativos, no de alerta. */}
          <View style={styles.datosApoyo}>
            <View style={styles.datoApoyoCard}>
              <MaterialIcons name="water-drop" size={16} color={colors.textoSecundario} />
              <Text style={styles.datoApoyoValor} numberOfLines={1}>
                {tieneMedidor ? (ultimaFactura?.consumoM3 != null ? `${ultimaFactura.consumoM3} m³` : '—') : 'Tarifa Fija'}
              </Text>
              <Text style={styles.datoApoyoLabel}>{tieneMedidor ? 'Este mes' : 'Sin medidor'}</Text>
            </View>
            <View
              style={[
                styles.datoApoyoCard,
                { backgroundColor: estadoServicioColor.bg, borderColor: estadoServicioColor.borde },
              ]}
            >
              <MaterialIcons name="bolt" size={16} color={estadoServicioColor.texto} />
              <Text style={[styles.datoApoyoValor, { color: estadoServicioColor.texto }]} numberOfLines={1}>
                {estadoServicioLabel}
              </Text>
              <Text style={[styles.datoApoyoLabel, { color: estadoServicioColor.texto }]}>Servicio</Text>
            </View>
            <View style={styles.datoApoyoCard}>
              <MaterialIcons name="pin" size={16} color={colors.textoSecundario} />
              <Text style={styles.datoApoyoValor} numberOfLines={1}>
                {user?.matricula}
              </Text>
              <Text style={styles.datoApoyoLabel}>Matrícula</Text>
            </View>
          </View>

          {ultimaFactura && (
            <View style={styles.seccion}>
              <View style={styles.seccionEncabezado}>
                <Text style={styles.seccionTitulo}>Última factura</Text>
                {ultimaFactura.periodo && <Text style={styles.seccionPeriodo}>{formatPeriodo(ultimaFactura.periodo)}</Text>}
              </View>
              <FacturaCard factura={ultimaFactura} onPress={() => navigation.navigate('Facturas')} />
            </View>
          )}

          {tieneMedidor && ultimosMeses.length > 1 && (
            <View style={[styles.seccion, styles.seccionConsumo]}>
              <View style={styles.seccionEncabezado}>
                <Text style={styles.seccionTitulo}>Consumo de agua</Text>
                <Text style={styles.seccionPeriodo}>Últimos {ultimosMeses.length} meses</Text>
              </View>
              <View style={styles.graficoCard}>
                <View style={styles.graficoBarras}>
                  {ultimosMeses.map((mes) => (
                    <View key={mes._id} style={styles.graficoColumna}>
                      <Text style={styles.graficoValor}>{mes.consumoM3}</Text>
                      <View style={styles.graficoBarraFondo}>
                        <View
                          style={[
                            styles.graficoBarra,
                            { height: `${Math.max(6, (mes.consumoM3 / consumoMax) * 100)}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.graficoMes}>{formatMesCorto(mes.periodo)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.superficieSutil },
  contenido: { paddingBottom: 110 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTexto: { flex: 1 },
  headerAcciones: { flexDirection: 'row', gap: 8 },
  headerIcono: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: radii.full,
    backgroundColor: colors.rojo,
    borderWidth: 2,
    borderColor: colors.superficieSutil,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeTexto: {
    fontFamily: fonts.headlineBold,
    fontSize: 9,
    color: colors.blanco,
  },
  saludo: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textoSecundario },
  nombre: { fontFamily: fonts.headlineExtraBold, fontSize: 22, color: colors.textoPrincipal, marginTop: 2 },
  spacer: { marginVertical: 40 },

  heroDeuda: {
    marginHorizontal: 20,
    backgroundColor: colors.azulMarca,
    borderRadius: radii['3xl'],
    padding: 24,
    marginBottom: 20,
    shadowColor: colors.azulMarca,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },
  heroLabel: {
    fontFamily: fonts.headlineBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  heroMonto: { fontFamily: fonts.headlineExtraBold, fontSize: 34, color: colors.blanco },
  heroDetalle: { fontFamily: fonts.bodyRegular, fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  botonPagar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.blanco,
    borderRadius: radii.full,
    paddingVertical: 13,
    marginTop: 18,
  },
  botonPagarTexto: { fontFamily: fonts.headlineSemiBold, fontSize: 14, color: colors.azulMarca },

  heroAlDia: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: colors.emerald,
    borderRadius: radii.full,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 10,
  },
  heroAlDiaIcono: {
    width: 26,
    height: 26,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAlDiaTexto: { fontFamily: fonts.headlineSemiBold, fontSize: 13, color: colors.blanco },

  datosApoyo: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  datoApoyoCard: {
    flex: 1,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radii.xl,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
    gap: 4,
  },
  datoApoyoValor: { fontFamily: fonts.headlineSemiBold, fontSize: 13, color: colors.textoPrincipal },
  datoApoyoLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textoTenue },

  seccionConsumo: { marginTop: 24 },
  graficoCard: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radii['2xl'],
    padding: 20,
  },
  graficoBarras: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
  },
  graficoColumna: { flex: 1, alignItems: 'center', gap: 6 },
  graficoValor: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textoSecundario },
  graficoBarraFondo: {
    width: 18,
    flex: 1,
    justifyContent: 'flex-end',
  },
  graficoBarra: {
    width: '100%',
    backgroundColor: colors.azulMarca,
    borderRadius: radii.xl,
    minHeight: 4,
  },
  graficoMes: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textoTenue,
    textTransform: 'capitalize',
  },

  seccion: { paddingHorizontal: 20 },
  seccionEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seccionTitulo: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: colors.textoPrincipal,
  },
  seccionPeriodo: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textoTenue,
    textTransform: 'capitalize',
  },
});

export default HomeScreen;
