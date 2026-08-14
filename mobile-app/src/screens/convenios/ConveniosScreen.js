import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api.service';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage   from '../../components/ErrorMessage';
import { useTheme }   from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';

const getTipoConfig = (colors) => ({
  AGROPECUARIO: { icon: '🌾', color: colors.primary,   bg: colors.primaryContainer },
  VETERINARIA:  { icon: '🐾', color: colors.tertiary,  bg: colors.tertiaryContainer },
  INSUMOS:      { icon: '🧪', color: '#82cfff',        bg: '#002d57' },
  OTRO:         { icon: '🤝', color: colors.onSurface, bg: colors.surfaceContainerHighest },
});

const CONVENIOS_DEMO = [
  {
    _id: 'demo-1',
    nombre: 'Agropecuaria El Potrero',
    tipo: 'AGROPECUARIO',
    descripcion: 'Venta de insumos, tuberías y accesorios para acueductos veredales. Descuento especial para suscriptores de AquaRural.',
    telefono: '318 456 7890',
    descuentoPorcentaje: 10,
    direccion: 'Cra. 5 #8-32, Garzón, Huila',
  },
  {
    _id: 'demo-2',
    nombre: 'Clínica Veterinaria Los Andes',
    tipo: 'VETERINARIA',
    descripcion: 'Servicios de medicina veterinaria, vacunación, inseminación artificial y cirugías. Atención 24 horas para emergencias ganaderas.',
    telefono: '312 789 0123',
    descuentoPorcentaje: 15,
    direccion: 'Cl. 12 #6-45, Garzón, Huila',
  },
  {
    _id: 'demo-3',
    nombre: 'Distribuidora AgroHuila',
    tipo: 'INSUMOS',
    descripcion: 'Herbicidas, fertilizantes, pesticidas y equipos agrícolas. Asesoría técnica gratuita para asociados con compras mayores a $200.000.',
    telefono: '310 234 5678',
    descuentoPorcentaje: 8,
    direccion: 'Av. Circunvalar #15-10, Garzón, Huila',
  },
  {
    _id: 'demo-4',
    nombre: 'Almacén Ganadero del Sur',
    tipo: 'AGROPECUARIO',
    descripcion: 'Equipos de ordeño, herramientas para finca, cercas eléctricas y ropa de trabajo. El almacén más completo del sur del Huila.',
    telefono: '315 678 9012',
    descuentoPorcentaje: 12,
    direccion: 'Cra. 9 #10-67, Garzón, Huila',
  },
  {
    _id: 'demo-5',
    nombre: 'Banco Agrario de Colombia',
    tipo: 'OTRO',
    descripcion: 'Créditos agropecuarios con tasas preferenciales para ganaderos asociados. Líneas especiales para compra de ganado, mejoramiento de praderas e infraestructura.',
    telefono: '018000 912227',
    descuentoPorcentaje: 0,
    direccion: 'Cl. 7 #5-12, Garzón, Huila',
  },
  {
    _id: 'demo-6',
    nombre: 'Laboratorio Biovet Diagnóstico',
    tipo: 'VETERINARIA',
    descripcion: 'Análisis de brucelosis, tuberculosis, mastitis y perfiles sanitarios completos. Resultados en 48 horas con entrega a domicilio en la finca.',
    telefono: '321 345 6789',
    descuentoPorcentaje: 20,
    direccion: 'Cl. 4 #3-89, Garzón, Huila',
  },
];

const ConvenioCard = ({ item, onPress, colors, typography }) => {
  const TIPO_CONFIG = getTipoConfig(colors);
  const config = TIPO_CONFIG[item.tipo] || TIPO_CONFIG.OTRO;
  const styles = makeStyles(colors, typography);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBox, { backgroundColor: config.bg }]}>
          <Text style={styles.cardIcon}>{config.icon}</Text>
        </View>
        <View style={styles.cardMeta}>
          <View style={[styles.tipoBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.tipoBadgeText, { color: config.color }]}>{item.tipo}</Text>
          </View>
          {item.descuentoPorcentaje > 0 && (
            <View style={styles.descuentoBadge}>
              <Text style={styles.descuentoText}>{item.descuentoPorcentaje}% dto.</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.cardNombre}>{item.nombre}</Text>
      {item.descripcion ? (
        <Text style={styles.cardDesc} numberOfLines={2}>{item.descripcion}</Text>
      ) : null}
      {item.telefono ? (
        <View style={styles.cardContact}>
          <Text style={styles.cardContactIcon}>📞</Text>
          <Text style={styles.cardContactText}>{item.telefono}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const ConveniosScreen = ({ navigation }) => {
  const { colors, typography } = useTheme();
  const [convenios,  setConvenios]  = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [busqueda,   setBusqueda]   = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const cargarConvenios = async () => {
    setError(null);
    try {
      const { data } = await api.get('/convenios');
      const lista = data.data?.length > 0 ? data.data : CONVENIOS_DEMO;
      setConvenios(lista);
      setFiltered(lista);
    } catch {
      setConvenios(CONVENIOS_DEMO);
      setFiltered(CONVENIOS_DEMO);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarConvenios(); }, []);

  useEffect(() => {
    if (!busqueda.trim()) {
      setFiltered(convenios);
      return;
    }
    const q = busqueda.toLowerCase();
    setFiltered(convenios.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.tipo.toLowerCase().includes(q)
    ));
  }, [busqueda, convenios]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarConvenios();
    setRefreshing(false);
  };

  const styles = makeStyles(colors, typography);

  if (loading) return <LoadingSpinner message="Cargando convenios..." />;
  if (error)   return <ErrorMessage message={error} onRetry={cargarConvenios} />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Convenios</Text>
        <Text style={styles.subtitle}>{convenios.length} aliados activos</Text>
      </View>

      {/* Búsqueda */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar convenio..."
            placeholderTextColor={colors.outline}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ConvenioCard
            item={item}
            colors={colors}
            typography={typography}
            onPress={() => navigation.navigate('DetalleConvenio', { convenio: item })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>Sin resultados para "{busqueda}"</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const makeStyles = (colors, typography) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop:        spacing.md,
    paddingBottom:     spacing.sm,
  },
  title:    { ...typography.h1 },
  subtitle: { ...typography.small, marginTop: 4 },

  searchRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom:     spacing.md,
  },
  searchBox: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius:    radius.lg,
    paddingHorizontal: spacing.md,
    height:          48,
    gap:             spacing.sm,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, ...typography.body, color: colors.onSurface },

  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },

  card: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.xl,
    padding:         spacing.lg,
    gap:             spacing.sm,
  },
  cardHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  cardIconBox: {
    width:           44,
    height:          44,
    borderRadius:    radius.md,
    alignItems:      'center',
    justifyContent:  'center',
  },
  cardIcon:  { fontSize: 22 },
  cardMeta:  { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  tipoBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      radius.full,
  },
  tipoBadgeText: { ...typography.label },
  descuentoBadge: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical:   3,
    borderRadius:      radius.full,
  },
  descuentoText: { ...typography.label, color: colors.primary },
  cardNombre:    { ...typography.h3 },
  cardDesc:      { ...typography.body, lineHeight: 20 },
  cardContact: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.xs,
    marginTop:     spacing.xs,
  },
  cardContactIcon: { fontSize: 14 },
  cardContactText: { ...typography.small },

  empty:     { alignItems: 'center', paddingTop: 60, gap: spacing.md },
  emptyIcon: { fontSize: 40 },
  emptyText: { ...typography.body },
});

export default ConveniosScreen;
