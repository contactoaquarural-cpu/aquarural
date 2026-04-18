import React from 'react';
import {
  View, Text, ScrollView, Image,
  TouchableOpacity, StyleSheet, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../../utils/theme';

const CATEGORIA_CONFIG = {
  GOBIERNO:      { icon: '🏛️', color: '#60a5fa', bg: '#1e3a5f' },
  SANIDAD:       { icon: '🩺', color: colors.primary, bg: colors.primaryContainer },
  PRECIOS:       { icon: '📈', color: colors.tertiary, bg: colors.tertiaryContainer },
  EVENTO:        { icon: '📅', color: '#c084fc', bg: '#3b1f5e' },
  INSTITUCIONAL: { icon: '🏢', color: colors.onSurface, bg: colors.surfaceContainerHighest },
};

const DetalleNoticiaScreen = ({ route, navigation }) => {
  const { noticia } = route.params;
  const cat = CATEGORIA_CONFIG[noticia.categoria] || CATEGORIA_CONFIG.INSTITUCIONAL;

  const handleCompartir = async () => {
    try {
      await Share.share({
        title:   noticia.titulo,
        message: `${noticia.titulo}\n\nASSOGACENTRO — ${noticia.categoria}\n\n${noticia.contenido.slice(0, 200)}...`,
      });
    } catch {
      // usuario canceló
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <View style={{ width: 80 }} />
        </View>

        {/* Imagen de portada */}
        {noticia.imagen && (
          <Image source={{ uri: noticia.imagen }} style={styles.image} resizeMode="cover" />
        )}

        <View style={styles.content}>
          {/* Categoría y fecha */}
          <View style={styles.metaRow}>
            <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
              <Text style={styles.catIcon}>{cat.icon}</Text>
              <Text style={[styles.catText, { color: cat.color }]}>{noticia.categoria}</Text>
            </View>
            {noticia.fechaPublicacion && (
              <Text style={styles.fecha}>
                {new Date(noticia.fechaPublicacion).toLocaleDateString('es-CO', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </Text>
            )}
          </View>

          {/* Título */}
          <Text style={styles.titulo}>{noticia.titulo}</Text>

          {/* Fuente */}
          <View style={styles.fuenteRow}>
            <Text style={styles.fuenteIcon}>🐄</Text>
            <Text style={styles.fuente}>ASOGACENTRO · Garzón, Huila</Text>
          </View>

          {/* Separador */}
          <View style={styles.divider} />

          {/* Contenido */}
          <Text style={styles.cuerpo}>{noticia.contenido}</Text>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Barra inferior — compartir */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.shareBtn} onPress={handleCompartir} activeOpacity={0.85}>
          <Text style={styles.shareIcon}>📤</Text>
          <Text style={styles.shareText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  image:    { width: '100%', height: 200 },

  content: { padding: spacing.lg, gap: spacing.md },

  metaRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            spacing.md,
    flexWrap:       'wrap',
  },
  catBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               4,
    paddingHorizontal: spacing.sm,
    paddingVertical:   4,
    borderRadius:      radius.full,
  },
  catIcon:  { fontSize: 13 },
  catText:  { ...typography.label },
  fecha:    { ...typography.small, flex: 1 },

  titulo:   { ...typography.displayMd, lineHeight: 36 },

  fuenteRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           spacing.sm,
  },
  fuenteIcon: { fontSize: 16 },
  fuente:     { ...typography.small, color: colors.primary, fontWeight: '600' },

  divider: {
    height:          1,
    backgroundColor: colors.outlineVariant,
    marginVertical:  spacing.sm,
  },

  cuerpo: {
    ...typography.body,
    lineHeight:   26,
    color:        colors.onSurface,
    letterSpacing: 0.2,
  },

  bottomBar: {
    padding:         spacing.md,
    backgroundColor: colors.surfaceContainerHigh,
  },
  shareBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             spacing.sm,
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md,
  },
  shareIcon: { fontSize: 18 },
  shareText: { ...typography.bodyBold, color: colors.primary },
});

export default DetalleNoticiaScreen;
