import { Modal, View, TouchableOpacity, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radii, fonts } from '../../theme/tokens';

// El backend no configura redirectUrl al generar el checkout (ver
// construirUrlCheckout en backend/src/services/wompi.service.js), así que
// Wompi nunca navega de vuelta a una URL de la app — el usuario cierra este
// modal manualmente cuando termina. El estado real de la factura lo define
// el webhook de Wompi, no este cierre; por eso quien abre el modal siempre
// recarga las facturas en onClose, sin asumir que el pago se completó.
const CheckoutWompiModal = ({ url, onClose }) => {
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.cerrar} activeOpacity={0.7}>
          <MaterialIcons name="close" size={22} color={colors.textoPrincipal} />
        </TouchableOpacity>
        <Text style={styles.titulo}>Pago seguro con Wompi</Text>
        <View style={styles.espaciador} />
      </View>
      <WebView
        source={{ uri: url }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.cargando}>
            <ActivityIndicator size="large" color={colors.azulMarca} />
          </View>
        )}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borde,
    backgroundColor: colors.blanco,
  },
  cerrar: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.superficieSutil,
  },
  titulo: { fontFamily: fonts.headlineSemiBold, fontSize: 15, color: colors.textoPrincipal },
  espaciador: { width: 36 },
  cargando: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default CheckoutWompiModal;
