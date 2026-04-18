import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { usePagosStore } from '../../store/pagos.store';
import { useAsociadoStore } from '../../store/asociado.store';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Toast, useToast } from '../../components/AppToast';
import { colors, spacing, radius, typography } from '../../utils/theme';

const MESES_LABELS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const PagoScreen = ({ route, navigation }) => {
  const meses = route.params?.meses ?? [];
  const [urlPago, setUrlPago] = useState(null);
  const [loading, setLoading] = useState(false);
  const { show, toastProps }  = useToast();

  const { iniciarPago, cargarHistorial } = usePagosStore();
  const { cargarDatos }                  = useAsociadoStore();

  const totalMonto = meses.reduce((sum, m) => sum + (m.monto || 0), 0);

  const handleIniciarPago = async () => {
    setLoading(true);
    try {
      const mesesIds = meses.map((m) => m._id);
      const url      = await iniciarPago(mesesIds, totalMonto);
      setUrlPago(url);
    } catch (err) {
      show('error', 'Error al iniciar pago', err.response?.data?.message || 'No se pudo iniciar el pago.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNav = async (navState) => {
    if (navState.url?.includes('pago-exitoso') || navState.url?.includes('success')) {
      setUrlPago(null);
      await cargarHistorial();
      await cargarDatos();
      show('success', 'Pago exitoso', 'Tu aporte ha sido registrado.');
      setTimeout(() => navigation.navigate('EstadoFinanciero'), 2000);
    }
    if (navState.url?.includes('pago-fallido') || navState.url?.includes('declined')) {
      setUrlPago(null);
      show('error', 'Pago no procesado', 'El pago fue rechazado o cancelado. Inténtalo de nuevo.');
    }
  };

  if (urlPago) {
    return (
      <SafeAreaView style={styles.safe}>
        <Toast {...toastProps} />
        <View style={styles.webHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setUrlPago(null)}>
            <MaterialIcons name="close" size={20} color={colors.primary} />
            <Text style={styles.backText}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.webTitle}>Pago seguro</Text>
          <View style={{ width: 80 }} />
        </View>
        <WebView
          source={{ uri: urlPago }}
          onNavigationStateChange={handleWebViewNav}
          startInLoadingState
          renderLoading={() => <LoadingSpinner message="Cargando pasarela de pago..." />}
        />
      </SafeAreaView>
    );
  }

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

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoText}>
            Serás redirigido a la pasarela segura de Wompi para completar el pago con PSE, tarjeta de crédito o Nequi.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.pagarBtn, loading && { opacity: 0.6 }]}
          onPress={handleIniciarPago}
          disabled={loading || meses.length === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.pagarBtnText}>
            {loading ? 'Procesando...' : `Pagar $${totalMonto.toLocaleString('es-CO')} →`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
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
    flexDirection:   'row',
    justifyContent:  'space-between',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  mesLabel:  { ...typography.body },
  mesMonto:  { ...typography.bodyBold },
  totalRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      spacing.sm,
  },
  totalLabel: { ...typography.h3 },
  totalMonto: { ...typography.h3, color: colors.primary },

  infoCard: {
    backgroundColor: colors.primaryContainer + '44',
    borderRadius:    radius.lg,
    padding:         spacing.md,
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             spacing.sm,
  },
  infoIcon: { fontSize: 20 },
  infoText: { ...typography.small, flex: 1, lineHeight: 18 },

  pagarBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md + 4,
    alignItems:      'center',
    marginTop:       'auto',
  },
  pagarBtnText: { ...typography.h3, color: colors.primary },

  webHeader: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.sm,
    backgroundColor: colors.surfaceContainerHigh,
  },
  webTitle: { ...typography.bodyBold },
});

export default PagoScreen;
