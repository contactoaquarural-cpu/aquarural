import { useCallback, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFacturasStore } from '../../store/facturas.store';
import FacturaCard from '../../components/FacturaCard';
import { colors, fonts } from '../../theme/tokens';

const FacturasScreen = () => {
  const { facturas, isLoading, error, descargandoId, cargarFacturas, descargarPdf } = useFacturasStore();
  const [refrescando, setRefrescando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarFacturas();
    }, [])
  );

  const handleRefrescar = async () => {
    setRefrescando(true);
    await cargarFacturas();
    setRefrescando(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Facturas</Text>
        <Text style={styles.subtitulo}>Historial completo de tu acueducto</Text>
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
          data={facturas}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={refrescando} onRefresh={handleRefrescar} tintColor={colors.azulMarca} />}
          renderItem={({ item }) => (
            <FacturaCard factura={item} onDescargar={descargarPdf} descargando={descargandoId === item._id} />
          )}
          ListEmptyComponent={
            <View style={styles.vacioContenedor}>
              <MaterialIcons name="receipt-long" size={32} color={colors.textoTenue} />
              <Text style={styles.vacio}>Aún no tienes facturas registradas.</Text>
            </View>
          }
        />
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
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerErrorTexto: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.rojo, flex: 1 },
  vacioContenedor: { alignItems: 'center', paddingTop: 60, gap: 8 },
  vacio: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textoSecundario },
});

export default FacturasScreen;
