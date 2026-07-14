import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { useThemeColors } from '../../utils/ThemeContext';

const { width: W } = Dimensions.get('window');

const formatDuracion = (seg) => {
  if (!seg) return null;
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const ReproductorScreen = ({ route, navigation }) => {
  const { capitulo } = route.params;
  const colors = useThemeColors();
  const s = styles(colors);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
          video { width: 100%; height: 100%; object-fit: contain; }
        </style>
      </head>
      <body>
        <video
          src="${capitulo.videoUrl}"
          controls
          autoplay
          playsinline
          webkit-playsinline
        ></video>
      </body>
    </html>
  `;

  return (
    <View style={s.container}>
      {/* Reproductor WebView */}
      <View style={s.videoWrapper}>
        <WebView
          source={{ html }}
          style={s.webview}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
        />
      </View>

      {/* Botón volver */}
      <TouchableOpacity style={s.btnVolver} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Metadata */}
      <ScrollView style={s.meta} contentContainerStyle={s.metaContent}>
        <View style={s.capRow}>
          <View style={s.capBadge}>
            <Text style={s.capText}>Capítulo {capitulo.numero}</Text>
          </View>
          {formatDuracion(capitulo.duracion) && (
            <Text style={s.duracion}>{formatDuracion(capitulo.duracion)}</Text>
          )}
        </View>

        <Text style={s.titulo}>{capitulo.titulo}</Text>

        {capitulo.fechaPublicacion && (
          <Text style={s.fecha}>
            {new Date(capitulo.fechaPublicacion).toLocaleDateString('es-CO', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
        )}

        {capitulo.descripcion ? (
          <View style={s.descripcionCard}>
            <Text style={s.descripcionLabel}>Descripción</Text>
            <Text style={s.descripcion}>{capitulo.descripcion}</Text>
          </View>
        ) : null}

        <View style={s.brand}>
          <MaterialIcons name="live-tv" size={16} color={colors.primary} />
          <Text style={s.brandText}>Ganadero TV · Asogacentro</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = (c) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#000' },
  videoWrapper:     { width: W, aspectRatio: 1, backgroundColor: '#000' },
  webview:          { flex: 1, backgroundColor: '#000' },
  btnVolver:        { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
  meta:             { flex: 1, backgroundColor: c.background },
  metaContent:      { padding: 20, gap: 8, paddingBottom: 40 },
  capRow:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  capBadge:         { backgroundColor: c.primaryContainer, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  capText:          { fontSize: 12, fontWeight: '700', color: c.onPrimaryContainer, textTransform: 'uppercase', letterSpacing: 0.5 },
  duracion:         { fontSize: 13, color: c.onSurfaceVariant },
  titulo:           { fontSize: 22, fontWeight: '700', color: c.onSurface, lineHeight: 28, marginTop: 4 },
  fecha:            { fontSize: 12, color: c.onSurfaceVariant },
  descripcionCard:  { backgroundColor: c.surfaceContainer, borderRadius: 16, padding: 16, marginTop: 12 },
  descripcionLabel: { fontSize: 12, fontWeight: '700', color: c.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  descripcion:      { fontSize: 15, color: c.onSurface, lineHeight: 22 },
  brand:            { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24 },
  brandText:        { fontSize: 12, color: c.onSurfaceVariant },
});

export default ReproductorScreen;
