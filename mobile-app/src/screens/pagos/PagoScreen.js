import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { usePagosStore }    from '../../store/pagos.store';
import { useAsociadoStore } from '../../store/asociado.store';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Toast, useToast } from '../../components/AppToast';
import { useTheme }   from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';

const MESES_LABELS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Construye el HTML con el script oficial del checkout widget de Wompi
const buildCheckoutHtml = ({ publicKey, amountInCents, reference, currency, acceptanceToken, integritySignature }) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Pago Seguro</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; background: #111414; }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .loader {
      color: #a5d0b9;
      font-family: sans-serif;
      font-size: 14px;
      margin-top: 16px;
      text-align: center;
    }
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
    // Reenviar mensajes de Wompi a React Native
    window.addEventListener('message', function(e) {
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            typeof e.data === 'string' ? e.data : JSON.stringify(e.data)
          );
        }
      } catch(err) {}
    });

    // Auto-click al botón de Wompi cuando esté listo
    var intentos = 0;
    var interval = setInterval(function() {
      // Wompi puede renderizar el botón con distintos selectores según versión
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
</html>
`.trim();

const PagoScreen = ({ route, navigation }) => {
  const { colors, typography } = useTheme();
  const meses = route.params?.meses ?? [];
  const [checkout, setCheckout] = useState(null);  // parámetros del widget
  const [loading,  setLoading]  = useState(false);
  const [resultado, setResultado] = useState(null); // 'exito' | 'error'
  const { show, toastProps }    = useToast();

  const { iniciarPago, cargarHistorial } = usePagosStore();
  const { cargarDatos }                  = useAsociadoStore();

  const totalMonto = meses.reduce((sum, m) => sum + (m.monto || 0), 0);

  const handleIniciarPago = async () => {
    setLoading(true);
    try {
      const payload = meses.map((m) => ({ mes: m.mes, año: m.año, monto: m.monto || 50000 }));
      const data = await iniciarPago(payload);
      setCheckout(data);
    } catch (err) {
      show('error', 'Error al iniciar pago', err.response?.data?.message || 'No se pudo iniciar el pago.');
    } finally {
      setLoading(false);
    }
  };

  // Captura cambios de URL del WebView para detectar resultado
  const handleNavChange = async (navState) => {
    const url = navState.url || '';

    const esExito  = url.includes('pago-resultado') && (url.includes('APPROVED') || url.includes('status=approved'));
    const esFallo  = url.includes('pago-resultado') && (url.includes('DECLINED') || url.includes('VOIDED') || url.includes('ERROR'));
    const esCierre = url.includes('pago-resultado') && !esExito && !esFallo;

    if (esExito) {
      setCheckout(null);
      setResultado('exito');
      await cargarHistorial();
      await cargarDatos();
    } else if (esFallo || esCierre) {
      setCheckout(null);
      setResultado('error');
    }
  };

  // Captura mensajes enviados desde el HTML via postMessage
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
    } catch {
      // mensaje no parseable — ignorar
    }
  };

  const styles = makeStyles(colors, typography);

  // ── Pantalla de resultado ────────────────────────────────────────────────────
  if (resultado) {
    const esExito = resultado === 'exito';
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.resultadoContainer}>
          <View style={[styles.resultadoIconBox, esExito ? styles.iconExito : styles.iconError]}>
            <MaterialIcons
              name={esExito ? 'check-circle' : 'cancel'}
              size={64}
              color={esExito ? colors.primary : colors.error}
            />
          </View>
          <Text style={styles.resultadoTitulo}>
            {esExito ? '¡Pago exitoso!' : 'Pago no procesado'}
          </Text>
          <Text style={styles.resultadoSub}>
            {esExito
              ? 'Tu aporte ha sido registrado. Gracias por mantener tu membresía al día.'
              : 'El pago fue rechazado o cancelado. Puedes intentarlo de nuevo.'}
          </Text>
          <TouchableOpacity
            style={[styles.resultadoBtn, esExito ? styles.btnPrimary : styles.btnSecondary]}
            onPress={() => {
              if (esExito) {
                navigation.navigate('EstadoFinanciero');
              } else {
                setResultado(null);
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.resultadoBtnText, esExito && { color: colors.primary }]}>
              {esExito ? 'Ver mis pagos' : 'Intentar de nuevo'}
            </Text>
          </TouchableOpacity>
          {!esExito && (
            <TouchableOpacity onPress={() => navigation.navigate('EstadoFinanciero')} style={{ marginTop: spacing.md }}>
              <Text style={styles.linkText}>Volver al estado financiero</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── WebView con el widget de Wompi ──────────────────────────────────────────
  if (checkout) {
    return (
      <SafeAreaView style={styles.safe}>
        <Toast {...toastProps} />
        <View style={styles.webHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setCheckout(null)}>
            <MaterialIcons name="close" size={20} color={colors.primary} />
            <Text style={styles.backText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.webTitle}>Pago seguro · Wompi</Text>
          <View style={{ width: 80 }} />
        </View>
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
      </SafeAreaView>
    );
  }

  // ── Resumen del pago ─────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <Toast {...toastProps} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Realizar pago</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.container}>
        {meses.length === 0 && (
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={20} color={colors.primary} />
            <Text style={styles.infoText}>No hay meses pendientes de pago. Vuelve al estado financiero.</Text>
          </View>
        )}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Meses a pagar</Text>
          {meses.map((m) => (
            <View key={m._id} style={styles.mesRow}>
              <Text style={styles.mesLabel}>{MESES_LABELS[m.mes - 1]} {m.año}</Text>
              <Text style={styles.mesMonto}>${(m.monto || 0).toLocaleString('es-CO')}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalMonto}>${totalMonto.toLocaleString('es-CO')}</Text>
          </View>
        </View>

        {/* Métodos de pago */}
        <View style={styles.metodosCard}>
          <View style={styles.metodosHeader}>
            <MaterialIcons name="lock" size={16} color={colors.primary} />
            <Text style={styles.metodosTitle}>Pago 100% seguro · Elige tu método</Text>
          </View>

          {/* Fila 1 — Tarjeta y Nequi */}
          <View style={styles.metodosRow}>
            <View style={styles.metodoBadge}>
              <View style={[styles.metodoLogoBox, { backgroundColor: '#1A1F71' }]}>
                <MaterialIcons name="credit-card" size={18} color="#fff" />
              </View>
              <Text style={styles.metodoText}>Tarjeta</Text>
              <Text style={styles.metodoSub}>Visa · MC · Amex</Text>
            </View>
            <View style={styles.metodoBadge}>
              <View style={[styles.metodoLogoBox, { backgroundColor: '#6A0DAD' }]}>
                <Text style={styles.metodoLetra}>N</Text>
              </View>
              <Text style={styles.metodoText}>Nequi</Text>
              <Text style={styles.metodoSub}>Billetera digital</Text>
            </View>
          </View>

          {/* Fila 2 — DaviPlata y PSE */}
          <View style={styles.metodosRow}>
            <View style={styles.metodoBadge}>
              <View style={[styles.metodoLogoBox, { backgroundColor: '#E8001C' }]}>
                <Text style={styles.metodoLetra}>D</Text>
              </View>
              <Text style={styles.metodoText}>DaviPlata</Text>
              <Text style={styles.metodoSub}>Billetera digital</Text>
            </View>
            <View style={styles.metodoBadge}>
              <View style={[styles.metodoLogoBox, { backgroundColor: '#00539B' }]}>
                <Text style={styles.metodoLetra}>PSE</Text>
              </View>
              <Text style={styles.metodoText}>PSE</Text>
              <Text style={styles.metodoSub}>Transferencia banco</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.pagarBtn, (loading || meses.length === 0) && { opacity: 0.6 }]}
          onPress={handleIniciarPago}
          disabled={loading || meses.length === 0}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="payment" size={20} color="#fff" />
              <Text style={styles.pagarBtnText}>
                Pagar ${totalMonto.toLocaleString('es-CO')}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
  backText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  title:    { ...typography.h2 },

  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },

  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.xl,
    padding:         spacing.lg,
    gap:             spacing.sm,
  },
  cardTitle: { ...typography.h3, marginBottom: spacing.sm },
  mesRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    paddingVertical:   spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  mesLabel:  { ...typography.body },
  mesMonto:  { ...typography.bodyBold },
  totalRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      spacing.sm,
    paddingTop:     spacing.sm,
  },
  totalLabel: { ...typography.h3 },
  totalMonto: { ...typography.h3, color: colors.primary },

  infoCard: {
    backgroundColor: colors.primaryContainer + '33',
    borderRadius:    radius.lg,
    padding:         spacing.md,
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             spacing.sm,
  },
  infoText: { ...typography.small, flex: 1, lineHeight: 18 },

  metodosCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.xl,
    padding:         spacing.lg,
    gap:             spacing.md,
  },
  metodosHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.xs,
  },
  metodosTitle: { ...typography.label, color: colors.onSurfaceVariant, fontWeight: '600' },
  metodosRow:   { flexDirection: 'row', gap: spacing.sm },
  metodoBadge: {
    flex:            1,
    alignItems:      'center',
    gap:             4,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  metodoLogoBox: {
    width:           44,
    height:          44,
    borderRadius:    radius.md,
    backgroundColor: '#E8F5E9',
    alignItems:      'center',
    justifyContent:  'center',
  },
  metodoLetra: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  metodoText:  { ...typography.small, fontWeight: '700', color: colors.onSurface, marginTop: 2 },
  metodoSub:   { fontSize: 10, color: colors.onSurfaceVariant, textAlign: 'center' },

  pagarBtn: {
    backgroundColor:   colors.primary,
    borderRadius:      radius.lg,
    paddingVertical:   spacing.md + 4,
    paddingHorizontal: spacing.lg,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               spacing.sm,
    marginTop:         'auto',
  },
  pagarBtnText: { ...typography.h3, color: '#fff', flex: 1, textAlign: 'center' },

  webHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    backgroundColor:   colors.surfaceContainerHigh,
  },
  webTitle: { ...typography.bodyBold },

  // Resultado
  resultadoContainer: {
    flex: 1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        spacing.xl,
    gap:            spacing.lg,
  },
  resultadoIconBox: {
    width:           120,
    height:          120,
    borderRadius:    60,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.sm,
  },
  iconExito: { backgroundColor: colors.primaryContainer },
  iconError: { backgroundColor: colors.errorContainer },
  resultadoTitulo: { ...typography.h1, textAlign: 'center' },
  resultadoSub:    { ...typography.body, textAlign: 'center', lineHeight: 22 },
  resultadoBtn: {
    borderRadius:    radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop:       spacing.sm,
  },
  btnPrimary:       { backgroundColor: colors.primaryContainer },
  btnSecondary:     { backgroundColor: colors.errorContainer },
  resultadoBtnText: { ...typography.h3, color: colors.error },
  linkText:         { ...typography.small, color: colors.onSurfaceVariant, textDecorationLine: 'underline' },
});

export default PagoScreen;
