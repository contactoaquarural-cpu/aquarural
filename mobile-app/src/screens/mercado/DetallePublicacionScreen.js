import React, { useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Linking, Dimensions, FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../utils/ThemeContext';

const { width: W } = Dimensions.get('window');

const CATEGORIA_LABEL = {
  ANIMAL: 'Animal', TERRENO: 'Terreno', FINCA: 'Finca', INSUMO: 'Insumo', OTRO: 'Otro',
};

const DetallePublicacionScreen = ({ route, navigation }) => {
  const { publicacion } = route.params;
  const colors = useThemeColors();
  const s = styles(colors);
  const [fotoActiva, setFotoActiva] = useState(0);

  const abrirWhatsApp = () => {
    const num = publicacion.contacto?.whatsapp || publicacion.contacto?.telefono;
    if (!num) return;
    const tel = num.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/57${tel}?text=Hola, vi tu publicación "${publicacion.titulo}" en AquaRural y me interesa.`);
  };

  const llamar = () => {
    const num = publicacion.contacto?.telefono;
    if (!num) return;
    Linking.openURL(`tel:${num}`);
  };

  const fotos = publicacion.fotos?.length > 0 ? publicacion.fotos : [];

  return (
    <View style={s.container}>
      {/* Galería de fotos */}
      {fotos.length > 0 ? (
        <View>
          <FlatList
            data={fotos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={(e) => {
              setFotoActiva(Math.round(e.nativeEvent.contentOffset.x / W));
            }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width: W, height: W }} resizeMode="cover" />
            )}
          />
          {fotos.length > 1 && (
            <View style={s.dots}>
              {fotos.map((_, i) => (
                <View key={i} style={[s.dot, i === fotoActiva && s.dotActivo]} />
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={s.fotoPlaceholder}>
          <MaterialIcons name="image-not-supported" size={48} color={colors.onSurfaceVariant} />
        </View>
      )}

      {/* Botón volver */}
      <TouchableOpacity style={s.btnVolver} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
      </TouchableOpacity>

      {/* Contenido */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
        {/* Categoría */}
        <View style={s.categoriaRow}>
          <Text style={s.categoriaLabel}>{CATEGORIA_LABEL[publicacion.categoria] ?? publicacion.categoria}</Text>
          {publicacion.subcategoria ? (
            <Text style={s.subcategoria}> · {publicacion.subcategoria}</Text>
          ) : null}
        </View>

        {/* Título */}
        <Text style={s.titulo}>{publicacion.titulo}</Text>

        {/* Precio */}
        {publicacion.precio ? (
          <Text style={s.precio}>
            ${publicacion.precio.toLocaleString('es-CO')} COP
            {publicacion.negociable ? '  ·  Negociable' : ''}
          </Text>
        ) : (
          <Text style={s.precioConvenir}>Precio a convenir</Text>
        )}

        {/* Ubicación */}
        <View style={s.ubicacion}>
          <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
          <Text style={s.ubicacionText}>
            {publicacion.municipio}{publicacion.vereda ? ` · ${publicacion.vereda}` : ''}
          </Text>
        </View>

        {/* Descripción */}
        <View style={s.seccion}>
          <Text style={s.seccionLabel}>Descripción</Text>
          <Text style={s.descripcion}>{publicacion.descripcion}</Text>
        </View>

        {/* Vendedor */}
        {publicacion.asociadoId?.nombre && (
          <View style={s.vendedor}>
            <View style={s.vendedorAvatar}>
              {publicacion.asociadoId.foto ? (
                <Image source={{ uri: publicacion.asociadoId.foto }} style={s.vendedorFoto} />
              ) : (
                <MaterialIcons name="person" size={22} color={colors.onSurfaceVariant} />
              )}
            </View>
            <View>
              <Text style={s.vendedorNombre}>{publicacion.asociadoId.nombre}</Text>
              <Text style={s.vendedorSub}>Asociado verificado · {publicacion.asociadoId.municipio}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botones de contacto */}
      <View style={s.botonesContacto}>
        {publicacion.contacto?.telefono && (
          <TouchableOpacity style={[s.btnContacto, s.btnLlamar]} onPress={llamar}>
            <MaterialIcons name="call" size={20} color={colors.primary} />
            <Text style={s.btnLlamarText}>Llamar</Text>
          </TouchableOpacity>
        )}
        {(publicacion.contacto?.whatsapp || publicacion.contacto?.telefono) && (
          <TouchableOpacity style={[s.btnContacto, s.btnWhatsapp]} onPress={abrirWhatsApp}>
            <MaterialIcons name="chat" size={20} color="#fff" />
            <Text style={s.btnWhatsappText}>WhatsApp</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = (c) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: c.background },
  fotoPlaceholder:  { width: W, height: W * 0.7, backgroundColor: c.surfaceContainer, alignItems: 'center', justifyContent: 'center' },
  btnVolver:        { position: 'absolute', top: 48, left: 16, backgroundColor: c.surfaceContainer + 'cc', borderRadius: 20, padding: 8 },
  dots:             { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10, backgroundColor: c.background },
  dot:              { width: 6, height: 6, borderRadius: 3, backgroundColor: c.outlineVariant },
  dotActivo:        { backgroundColor: c.primary, width: 18 },
  scroll:           { flex: 1 },
  scrollContent:    { padding: 20 },
  categoriaRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  categoriaLabel:   { fontSize: 12, fontWeight: '700', color: c.primary, textTransform: 'uppercase', letterSpacing: 1 },
  subcategoria:     { fontSize: 12, color: c.onSurfaceVariant },
  titulo:           { fontSize: 22, fontWeight: '700', color: c.onSurface, lineHeight: 28 },
  precio:           { fontSize: 20, fontWeight: '700', color: c.tertiary, marginTop: 8 },
  precioConvenir:   { fontSize: 15, color: c.onSurfaceVariant, marginTop: 8 },
  ubicacion:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  ubicacionText:    { fontSize: 13, color: c.onSurfaceVariant },
  seccion:          { marginTop: 24 },
  seccionLabel:     { fontSize: 13, fontWeight: '700', color: c.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  descripcion:      { fontSize: 15, color: c.onSurface, lineHeight: 22 },
  vendedor:         { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, padding: 14, backgroundColor: c.surfaceContainer, borderRadius: 16 },
  vendedorAvatar:   { width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  vendedorFoto:     { width: 44, height: 44 },
  vendedorNombre:   { fontSize: 14, fontWeight: '700', color: c.onSurface },
  vendedorSub:      { fontSize: 12, color: c.primary, marginTop: 2 },
  botonesContacto:  { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 32, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.outlineVariant },
  btnContacto:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  btnLlamar:        { backgroundColor: c.primaryContainer },
  btnLlamarText:    { color: c.primary, fontSize: 15, fontWeight: '700' },
  btnWhatsapp:      { backgroundColor: '#25D366' },
  btnWhatsappText:  { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default DetallePublicacionScreen;
