import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFacturasStore } from '../../store/facturas.store';
import FacturaCard from '../../components/FacturaCard';
import { colors, radii, fonts } from '../../theme/tokens';
import CheckoutWompiModal from './CheckoutWompiModal';

const formatMonto = (valor) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor || 0);

const PagarScreen = () => {
  const { facturas, isLoading, error, cargarFacturas, iniciarPago, trasladaComisionWompi, cargarConfigPublica } = useFacturasStore();
  const [refrescando, setRefrescando] = useState(false);
  const [facturaEnPago, setFacturaEnPago] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [errorPago, setErrorPago] = useState('');
  const [cargandoCheckout, setCargandoCheckout] = useState(false);
  // Solo se llena cuando el acueducto activó el traslado de la comisión
  // Wompi al suscriptor — sin esto el checkout abriría directo, sin que el
  // suscriptor sepa por qué el monto en Wompi es mayor al de su factura.
  const [desglosePago, setDesglosePago] = useState(null);

  // Se recarga cada vez que la pestaña vuelve a estar en foco — así, si el
  // usuario pagó y volvió del checkout, la lista refleja el estado real sin
  // que tenga que recordar refrescar manualmente.
  useFocusEffect(
    useCallback(() => {
      cargarFacturas();
      cargarConfigPublica();
    }, [])
  );

  const pendientes = facturas.filter((f) => f.estado === 'PENDIENTE' || f.estado === 'VENCIDA');

  const handleRefrescar = async () => {
    setRefrescando(true);
    await cargarFacturas();
    setRefrescando(false);
  };

  const handlePagar = async (factura) => {
    setErrorPago('');
    setFacturaEnPago(factura);
    setCargandoCheckout(true);
    try {
      const { wompiUrl, montoFactura, montoComision, montoTotal } = await iniciarPago(factura._id);
      if (montoComision > 0) {
        // Con comisión: se detiene aquí y se muestra el desglose; el
        // checkout solo se abre cuando el suscriptor confirma "Continuar".
        setDesglosePago({ wompiUrl, montoFactura, montoComision, montoTotal });
      } else {
        setCheckoutUrl(wompiUrl);
      }
    } catch (e) {
      setErrorPago(e.response?.data?.message || 'No se pudo iniciar el pago. Intenta de nuevo.');
      setFacturaEnPago(null);
    } finally {
      setCargandoCheckout(false);
    }
  };

  const confirmarDesglose = () => {
    setCheckoutUrl(desglosePago.wompiUrl);
    setDesglosePago(null);
  };

  const cancelarDesglose = () => {
    setDesglosePago(null);
    setFacturaEnPago(null);
  };

  const cerrarCheckout = () => {
    setCheckoutUrl(null);
    setFacturaEnPago(null);
    cargarFacturas();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Pagar</Text>
        <Text style={styles.subtitulo}>Selecciona la factura que quieres pagar</Text>
      </View>

      {errorPago ? (
        <View style={styles.bannerError}>
          <MaterialIcons name="error-outline" size={18} color={colors.rojo} />
          <Text style={styles.bannerErrorTexto}>{errorPago}</Text>
        </View>
      ) : null}

      {isLoading && !refrescando ? (
        <ActivityIndicator style={styles.spacer} color={colors.azulMarca} />
      ) : error ? (
        <View style={styles.bannerError}>
          <MaterialIcons name="error-outline" size={18} color={colors.rojo} />
          <Text style={styles.bannerErrorTexto}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={pendientes}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={handleRefrescar} tintColor={colors.azulMarca} />}
          renderItem={({ item }) => (
            <FacturaCard
              factura={item}
              onPress={cargandoCheckout && facturaEnPago?._id === item._id ? undefined : handlePagar}
              avisoComisionWompi={trasladaComisionWompi}
            />
          )}
          ListEmptyComponent={
            <View style={styles.vacioContenedor}>
              <MaterialIcons name="check-circle" size={32} color={colors.emerald} />
              <Text style={styles.vacioTitulo}>¡Estás al día!</Text>
              <Text style={styles.vacio}>No tienes facturas pendientes por pagar.</Text>
            </View>
          }
        />
      )}

      {cargandoCheckout && (
        <View style={styles.overlayCargando}>
          <ActivityIndicator size="large" color={colors.azulMarca} />
          <Text style={styles.overlayTexto}>Preparando pasarela de pago...</Text>
        </View>
      )}

      {checkoutUrl && (
        <CheckoutWompiModal url={checkoutUrl} onClose={cerrarCheckout} />
      )}

      {desglosePago && (
        <Modal transparent animationType="fade" onRequestClose={cancelarDesglose}>
          <View style={styles.modalFondo}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitulo}>Comisión de la pasarela de pago</Text>
              <Text style={styles.modalSubtitulo}>
                Al pagar por Wompi (Nequi, PSE, tarjeta o Bancolombia), se suma la comisión que cobra la pasarela.
              </Text>

              <View style={styles.modalFila}>
                <Text style={styles.modalFilaLabel}>Valor de la factura</Text>
                <Text style={styles.modalFilaValor}>{formatMonto(desglosePago.montoFactura)}</Text>
              </View>
              <View style={styles.modalFila}>
                <Text style={styles.modalFilaLabel}>Comisión pasarela</Text>
                <Text style={styles.modalFilaValor}>{formatMonto(desglosePago.montoComision)}</Text>
              </View>
              <View style={[styles.modalFila, styles.modalFilaTotal]}>
                <Text style={styles.modalFilaTotalLabel}>Total a pagar</Text>
                <Text style={styles.modalFilaTotalValor}>{formatMonto(desglosePago.montoTotal)}</Text>
              </View>

              <TouchableOpacity style={styles.modalBotonPrincipal} activeOpacity={0.85} onPress={confirmarDesglose}>
                <Text style={styles.modalBotonPrincipalTexto}>Continuar a Wompi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBotonSecundario} activeOpacity={0.7} onPress={cancelarDesglose}>
                <Text style={styles.modalBotonSecundarioTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.superficieSutil },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  titulo: { fontFamily: fonts.headlineExtraBold, fontSize: 24, color: colors.textoPrincipal },
  subtitulo: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textoSecundario, marginTop: 4 },
  spacer: { marginVertical: 24 },
  lista: { paddingHorizontal: 20, paddingBottom: 100, flexGrow: 1 },
  bannerError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.rojoBg,
    borderWidth: 1,
    borderColor: colors.rojoBorde,
    borderRadius: radii['2xl'],
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerErrorTexto: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.rojo, flex: 1 },
  vacioContenedor: { alignItems: 'center', paddingTop: 60, gap: 6 },
  vacioTitulo: { fontFamily: fonts.headlineSemiBold, fontSize: 16, color: colors.textoPrincipal, marginTop: 4 },
  vacio: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textoSecundario },
  overlayCargando: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  overlayTexto: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textoSecundario },

  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.blanco,
    borderRadius: radii['3xl'],
    padding: 24,
  },
  modalTitulo: { fontFamily: fonts.headlineSemiBold, fontSize: 17, color: colors.textoPrincipal },
  modalSubtitulo: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textoSecundario, marginTop: 6, lineHeight: 17 },
  modalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  modalFilaLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textoSecundario },
  modalFilaValor: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.textoPrincipal },
  modalFilaTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borde,
  },
  modalFilaTotalLabel: { fontFamily: fonts.headlineSemiBold, fontSize: 14, color: colors.textoPrincipal },
  modalFilaTotalValor: { fontFamily: fonts.headlineSemiBold, fontSize: 16, color: colors.azulMarca },
  modalBotonPrincipal: {
    backgroundColor: colors.azulMarca,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  modalBotonPrincipalTexto: { fontFamily: fonts.headlineSemiBold, fontSize: 14, color: colors.blanco },
  modalBotonSecundario: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  modalBotonSecundarioTexto: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textoSecundario },
});

export default PagarScreen;
