import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAuthStore }  from '../../store/auth.store';
import { usePagosStore } from '../../store/pagos.store';
import { useAsociadoStore } from '../../store/asociado.store';
import EstadoBadge    from '../../components/EstadoBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme }   from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';
import api from '../../services/api.service';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const METODO_LABELS = {
  PSE:           'PSE',
  TARJETA:       'Tarjeta',
  NEQUI:         'Nequi',
  EFECTIVO:      'Efectivo',
  TRANSFERENCIA: 'Transferencia',
};

const buildCheckoutHtml = ({ publicKey, amountInCents, reference, currency, acceptanceToken, integritySignature }) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; background: #111414; }
    .container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .loader { color: #a5d0b9; font-family: sans-serif; font-size: 14px; margin-top: 16px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <form id="wompi-form">
      <script
        src="https://checkout.wompi.co/widget.js"
        data-render="button"
        data-public-key="${publicKey}"
        data-currency="${currency}"
        data-amount-in-cents="${amountInCents}"
        data-reference="${reference}"
        data-signature:integrity="${integritySignature}"
        data-acceptance-token="${acceptanceToken}"
        data-redirect-url="https://aquarural.app/pago-resultado"
      ></script>
    </form>
    <p class="loader" id="loader-text">Cargando pasarela segura de pago...</p>
  </div>
  <script>
    window.addEventListener('message', function(e) {
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(typeof e.data === 'string' ? e.data : JSON.stringify(e.data));
        }
      } catch(err) {}
    });
    var intentos = 0;
    var interval = setInterval(function() {
      var btn = document.querySelector('button[data-wompi]') ||
                document.querySelector('.waybox-button') ||
                document.querySelector('button[type="button"]') ||
                document.querySelector('form button') ||
                document.querySelector('button');
      if (btn) {
        clearInterval(interval);
        var loader = document.getElementById('loader-text');
        if (loader) loader.style.display = 'none';
        btn.click();
      }
      if (++intentos > 40) {
        clearInterval(interval);
        var loader = document.getElementById('loader-text');
        if (loader) loader.textContent = 'Toca el botón para continuar con el pago.';
      }
    }, 250);
  </script>
</body>
</html>`.trim();

const EstadoFinancieroScreen = ({ navigation }) => {
  const { colors, typography } = useTheme();
  const { aportes, mesesPendientes, isLoading, cargarHistorial, iniciarPago } = usePagosStore();
  const { cargarDatos } = useAsociadoStore();

  const [iniciando,      setIniciando]      = useState(false);
  const [checkout,       setCheckout]       = useState(null);  // abre modal Wompi
  const [resultado,      setResultado]      = useState(null);  // 'exito' | 'error'
  const [montoConfigura, setMontoConfigura] = useState(50000);

  useEffect(() => {
    cargarHistorial();
    api.get('/configuracion').then((r) => {
      if (r.data.data?.montoAporte) setMontoConfigura(r.data.data.montoAporte);
    }).catch(() => {});
  }, []);

  if (isLoading && aportes.length === 0) return <LoadingSpinner />;

  const estado         = mesesPendientes.length === 0 ? 'AL_DIA' : mesesPendientes.length >= 3 ? 'INACTIVO' : 'EN_MORA';
  const totalPendiente = mesesPendientes.reduce((sum, a) => sum + (a.monto || 0), 0);
  const pagados        = aportes.filter((a) => a.estado === 'PAGADO');
  const styles         = makeStyles(colors, typography);

  const handlePagar = async () => {
    setIniciando(true);
    try {
      const payload = mesesPendientes.map((m) => ({ mes: m.mes, año: m.año, monto: m.monto || montoConfigura }));
      const data = await iniciarPago(payload);
      setCheckout(data);
    } catch {
      // error silencioso — el usuario puede reintentar
    } finally {
      setIniciando(false);
    }
  };

  const handleNavChange = async (navState) => {
    const url = navState.url || '';
    const esExito = url.includes('pago-resultado') && (url.includes('APPROVED') || url.includes('status=approved'));
    const esFallo = url.includes('pago-resultado') && (url.includes('DECLINED') || url.includes('VOIDED') || url.includes('ERROR'));
    if (esExito) {
      setCheckout(null);
      setResultado('exito');
      await cargarHistorial();
      await cargarDatos();
    } else if (esFallo || (url.includes('pago-resultado') && !esExito)) {
      setCheckout(null);
      setResultado('error');
    }
  };

  const handleMessage = async (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg?.transaction?.status === 'APPROVED') {
        setCheckout(null);
        setResultado('exito');
        await cargarHistorial();
        await cargarDatos();
      } else if (msg?.transaction?.status === 'DECLINED' || msg?.transaction?.status === 'VOIDED') {
        setCheckout(null);
        setResultado('error');
      }
    } catch { /* no parseable */ }
  };

  return (
    <SafeAreaView style={styles.safe}>

      {/* Modal Wompi */}
      <Modal visible={!!checkout} animationType="slide" onRequestClose={() => setCheckout(null)}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalCerrar} onPress={() => setCheckout(null)}>
              <MaterialIcons name="close" size={20} color={colors.primary} />
              <Text style={styles.modalCerrarText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Pago seguro · Wompi</Text>
            <View style={{ width: 88 }} />
          </View>
          {checkout && (
            <WebView
              source={{ html: buildCheckoutHtml(checkout), baseUrl: 'https://checkout.wompi.co' }}
              onNavigationStateChange={handleNavChange}
              onMessage={handleMessage}
              startInLoadingState
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              mixedContentMode="always"
              allowsInlineMediaPlayback
              renderLoading={() => <LoadingSpinner message="Cargando pasarela de pago..." />}
              style={{ flex: 1, backgroundColor: colors.background }}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Modal resultado */}
      <Modal visible={!!resultado} animationType="fade" transparent>
        <View style={styles.resultadoOverlay}>
          <View style={styles.resultadoCard}>
            <View style={[styles.resultadoIconBox, resultado === 'exito' ? styles.iconExito : styles.iconError]}>
              <MaterialIcons
                name={resultado === 'exito' ? 'check-circle' : 'cancel'}
                size={56}
                color={resultado === 'exito' ? colors.primary : colors.error}
              />
            </View>
            <Text style={styles.resultadoTitulo}>
              {resultado === 'exito' ? '¡Pago exitoso!' : 'Pago no procesado'}
            </Text>
            <Text style={styles.resultadoSub}>
              {resultado === 'exito'
                ? 'Tu aporte ha sido registrado. Gracias por mantener tu membresía al día.'
                : 'El pago fue rechazado o cancelado. Puedes intentarlo de nuevo.'}
            </Text>
            <TouchableOpacity
              style={[styles.resultadoBtn, resultado === 'exito' ? styles.btnExito : styles.btnError]}
              onPress={() => setResultado(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.resultadoBtnText}>
                {resultado === 'exito' ? 'Ver mi estado' : 'Intentar de nuevo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={cargarHistorial} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Estado Financiero</Text>
          <EstadoBadge estado={estado} />
        </View>

        {/* Hero card */}
        <View style={[styles.heroCard, mesesPendientes.length > 0 && styles.heroCardAlert]}>
          <View style={styles.heroRow}>
            <View style={styles.heroItem}>
              <Text style={[styles.heroNum, mesesPendientes.length > 0 && { color: colors.tertiary }]}>
                {mesesPendientes.length}
              </Text>
              <Text style={styles.heroLabel}>Meses{'\n'}pendientes</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroItem}>
              <Text style={[styles.heroNum, mesesPendientes.length > 0 && { color: colors.tertiary }]}>
                ${totalPendiente.toLocaleString('es-CO')}
              </Text>
              <Text style={styles.heroLabel}>Deuda{'\n'}total</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroItem}>
              <Text style={[styles.heroNum, { color: colors.primary }]}>
                {pagados.length}
              </Text>
              <Text style={styles.heroLabel}>Meses{'\n'}pagados</Text>
            </View>
          </View>

          {mesesPendientes.length > 0 && (
            <TouchableOpacity
              style={[styles.pagarBtn, iniciando && { opacity: 0.7 }]}
              onPress={handlePagar}
              disabled={iniciando}
              activeOpacity={0.85}
            >
              {iniciando ? (
                <ActivityIndicator color={colors.onPrimary} size="small" />
              ) : (
                <>
                  <MaterialIcons name="payment" size={18} color={colors.onPrimary} />
                  <Text style={styles.pagarBtnText}>
                    Pagar ${totalPendiente.toLocaleString('es-CO')}
                  </Text>
                  <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
                </>
              )}
            </TouchableOpacity>
          )}

          {mesesPendientes.length === 0 && (
            <View style={styles.alDiaRow}>
              <MaterialIcons name="check-circle" size={18} color={colors.primary} />
              <Text style={styles.alDiaText}>Estás al día con tus aportes</Text>
            </View>
          )}
        </View>

        {/* Meses pendientes */}
        {mesesPendientes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="warning-amber" size={16} color={colors.tertiary} />
              <Text style={[styles.sectionTitle, { color: colors.tertiary }]}>Pendiente de pago</Text>
            </View>
            {mesesPendientes.map((a) => (
              <View key={a._id} style={styles.pendienteRow}>
                <View style={styles.pendienteLeft}>
                  <View style={styles.pendienteDot} />
                  <Text style={styles.mesLabel}>{MESES[a.mes - 1]} {a.año}</Text>
                </View>
                <Text style={styles.montoTertiary}>${(a.monto || 0).toLocaleString('es-CO')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Historial */}
        {pagados.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="history" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Historial de aportes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('HistorialPagos')}>
                <Text style={styles.verTodosText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            {pagados.slice(0, 5).map((a) => (
              <View key={a._id} style={styles.aporteRow}>
                <View style={styles.aporteLeft}>
                  <View style={styles.aporteIconBox}>
                    <MaterialIcons name="check-circle" size={16} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.mesLabel}>{MESES[a.mes - 1]} {a.año}</Text>
                    {a.metodoPago && (
                      <Text style={styles.metodo}>{METODO_LABELS[a.metodoPago] || a.metodoPago}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.aporteRight}>
                  <Text style={styles.montoPrimary}>${(a.monto || 0).toLocaleString('es-CO')}</Text>
                  {a.fechaPago && (
                    <Text style={styles.fecha}>
                      {new Date(a.fechaPago).toLocaleDateString('es-CO')}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const makeStyles = (colors, typography) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.md,
    paddingBottom:     spacing.lg,
  },
  backBtn: { padding: 4 },
  title:   { ...typography.h1, flex: 1 },

  heroCard: {
    marginHorizontal: spacing.lg,
    backgroundColor:  colors.surfaceContainerLow,
    borderRadius:     radius.xl,
    padding:          spacing.lg,
    marginBottom:     spacing.lg,
    gap:              spacing.md,
  },
  heroCardAlert: { borderWidth: 1, borderColor: colors.tertiary + '40' },
  heroRow:       { flexDirection: 'row', alignItems: 'center' },
  heroItem:      { flex: 1, alignItems: 'center', gap: 4 },
  heroNum:       { ...typography.displayMd, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  heroLabel:     { ...typography.label, textAlign: 'center', lineHeight: 14 },
  heroDivider:   { width: 1, height: 40, backgroundColor: colors.outlineVariant },

  pagarBtn: {
    backgroundColor:   colors.primary,
    borderRadius:      radius.lg,
    paddingVertical:   spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               spacing.sm,
    minHeight:         48,
  },
  pagarBtnText: { ...typography.bodyBold, color: colors.onPrimary, flex: 1, textAlign: 'center' },

  alDiaRow: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             spacing.sm,
    paddingVertical: spacing.xs,
  },
  alDiaText: { ...typography.body, color: colors.primary, fontWeight: '600' },

  section: {
    marginHorizontal: spacing.lg,
    backgroundColor:  colors.surfaceContainerLow,
    borderRadius:     radius.xl,
    padding:          spacing.lg,
    marginBottom:     spacing.lg,
    gap:              spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.xs,
    marginBottom:  spacing.xs,
  },
  sectionTitle:  { ...typography.h3, flex: 1 },
  verTodosText:  { ...typography.small, color: colors.primary, fontWeight: '700' },

  pendienteRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    backgroundColor:   colors.tertiaryContainer + '30',
    borderRadius:      radius.md,
    paddingVertical:   spacing.sm,
    paddingHorizontal: spacing.md,
  },
  pendienteLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pendienteDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.tertiary },

  aporteRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingVertical:   spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  aporteLeft:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aporteIconBox: {
    width:           32,
    height:          32,
    borderRadius:    radius.sm,
    backgroundColor: colors.primaryContainer + '44',
    alignItems:      'center',
    justifyContent:  'center',
  },
  aporteRight:   { alignItems: 'flex-end', gap: 2 },
  mesLabel:      { ...typography.bodyBold },
  metodo:        { ...typography.small, color: colors.onSurfaceVariant, marginTop: 1 },
  montoPrimary:  { ...typography.bodyBold, color: colors.primary },
  montoTertiary: { ...typography.bodyBold, color: colors.tertiary },
  fecha:         { ...typography.small, color: colors.onSurfaceVariant },

  // Modal Wompi
  modalHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    backgroundColor:   colors.surfaceContainerHigh,
  },
  modalCerrar:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  modalCerrarText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  modalTitle:      { ...typography.bodyBold },

  // Modal resultado
  resultadoOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         spacing.xl,
  },
  resultadoCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius:    radius.xl,
    padding:         spacing.xl,
    alignItems:      'center',
    gap:             spacing.md,
    width:           '100%',
  },
  resultadoIconBox: {
    width:           96,
    height:          96,
    borderRadius:    48,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.sm,
  },
  iconExito:        { backgroundColor: colors.primaryContainer },
  iconError:        { backgroundColor: colors.errorContainer },
  resultadoTitulo:  { ...typography.h2, textAlign: 'center' },
  resultadoSub:     { ...typography.body, textAlign: 'center', lineHeight: 22, color: colors.onSurfaceVariant },
  resultadoBtn: {
    borderRadius:      radius.lg,
    paddingVertical:   spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop:         spacing.sm,
    width:             '100%',
    alignItems:        'center',
  },
  btnExito:         { backgroundColor: colors.primary },
  btnError:         { backgroundColor: colors.error },
  resultadoBtnText: { ...typography.bodyBold, color: '#fff' },
});

export default EstadoFinancieroScreen;
