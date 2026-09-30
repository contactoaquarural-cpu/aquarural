import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radii, fonts } from '../theme/tokens';

// Mismo patrón de badge de estado usado en web-admin (fondo pastel + borde +
// texto saturado del color semántico) — ver DESIGN.md, sección Badges.
const ESTADO_CONFIG = {
  PENDIENTE: { label: 'Pendiente', bg: colors.amberBg, borde: '#FDE68A', texto: colors.amber, icono: 'schedule' },
  VENCIDA: { label: 'Vencida', bg: colors.rojoBg, borde: colors.rojoBorde, texto: colors.rojo, icono: 'error-outline' },
  PAGADA: { label: 'Pagada', bg: colors.emeraldBg, borde: colors.emeraldBorde, texto: colors.emerald, icono: 'check-circle' },
  ANULADA: { label: 'Anulada', bg: '#F1F5F9', borde: colors.borde, texto: colors.textoSecundario, icono: 'block' },
};

const formatMonto = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor || 0);

const formatPeriodo = (periodo) => {
  if (!periodo) return '';
  const [anio, mes] = periodo.split('-');
  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${MESES[Number(mes) - 1] || mes} ${anio}`;
};

const FacturaCard = ({ factura, onPress, onDescargar, descargando, avisoComisionWompi }) => {
  const estado = ESTADO_CONFIG[factura.estado] || ESTADO_CONFIG.PENDIENTE;
  const Wrapper = onPress ? TouchableOpacity : View;
  // Solo tiene sentido en facturas aún no pagadas — pasada esa fecha ya no
  // hay decisión de método de pago que tomar.
  const mostrarAviso = avisoComisionWompi && factura.estado !== 'PAGADA';

  return (
    <Wrapper
      style={styles.card}
      {...(onPress ? { activeOpacity: 0.7, onPress: () => onPress(factura) } : {})}
    >
      <View style={styles.filaSuperior}>
        <Text style={styles.periodo}>{formatPeriodo(factura.periodo)}</Text>
        <View style={[styles.badge, { backgroundColor: estado.bg, borderColor: estado.borde }]}>
          <MaterialIcons name={estado.icono} size={12} color={estado.texto} />
          <Text style={[styles.badgeTexto, { color: estado.texto }]}>{estado.label}</Text>
        </View>
      </View>
      <View style={styles.filaInferior}>
        <Text style={styles.codigo}>{factura.codigoFactura}</Text>
        <View style={styles.montoFila}>
          <Text style={styles.monto}>{formatMonto(factura.montoTotal)}</Text>
          {onPress && <MaterialIcons name="chevron-right" size={20} color={colors.textoTenue} />}
        </View>
      </View>
      {mostrarAviso && (
        <View style={styles.avisoComision}>
          <MaterialIcons name="info-outline" size={13} color={colors.textoTenue} />
          <Text style={styles.avisoComisionTexto}>Pagando por Wompi se suma la comisión de la pasarela</Text>
        </View>
      )}
      {onDescargar && (
        <TouchableOpacity
          style={styles.botonDescargar}
          activeOpacity={0.7}
          disabled={descargando}
          onPress={() => onDescargar(factura)}
        >
          {descargando ? (
            <ActivityIndicator size="small" color={colors.azulMarca} />
          ) : (
            <>
              <MaterialIcons name="file-download" size={16} color={colors.azulMarca} />
              <Text style={styles.botonDescargarTexto}>
                {factura.estado === 'PAGADA' ? 'Descargar recibo' : 'Descargar factura'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radii['2xl'],
    padding: 16,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  periodo: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 14,
    color: colors.textoPrincipal,
    textTransform: 'capitalize',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeTexto: {
    fontFamily: fonts.headlineBold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  filaInferior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  codigo: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.textoTenue,
  },
  montoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  monto: {
    fontFamily: fonts.headlineBold,
    fontSize: 18,
    color: colors.azulMarca,
  },
  avisoComision: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  avisoComisionTexto: {
    fontFamily: fonts.bodyRegular,
    fontSize: 10.5,
    color: colors.textoTenue,
    flex: 1,
  },
  botonDescargar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
  },
  botonDescargarTexto: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.azulMarca,
  },
});

export default FacturaCard;
