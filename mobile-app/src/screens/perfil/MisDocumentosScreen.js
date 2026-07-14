import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../../utils/ThemeContext';
import api from '../../services/api.service';

const DOCUMENTOS = [
  {
    tipo:  'VACUNACION',
    label: 'Certificado de Vacunación',
    icon:  'vaccines',
    desc:  'Certificado de vacunación del hato ganadero',
  },
  {
    tipo:  'TITULO_PROPIEDAD',
    label: 'Título de Propiedad',
    icon:  'home_work',
    desc:  'Escritura o título del predio',
  },
  {
    tipo:  'REGISTRO_ICA',
    label: 'Registro Ganadero ICA',
    icon:  'verified',
    desc:  'Registro oficial ante el ICA',
  },
];

const MisDocumentosScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const s = styles(colors);

  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [subiendo, setSubiendo]     = useState(null);

  const cargar = async () => {
    try {
      const { data } = await api.get('/documentos');
      setDocumentos(data.data || []);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { cargar(); }, []));

  const getDoc = (tipo) => documentos.find((d) => d.tipo === tipo);

  const subirDocumento = async (tipo) => {
    Alert.alert(
      'Subir documento',
      '¿Cómo quieres subir el documento?',
      [
        {
          text: 'Galería de fotos',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permiso requerido', 'Necesitas permitir el acceso a la galería');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.85,
              allowsEditing: false,
            });
            if (result.canceled) return;
            await enviar(tipo, result.assets[0]);
          },
        },
        {
          text: 'Cámara',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permiso requerido', 'Necesitas permitir el acceso a la cámara');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.85,
            });
            if (result.canceled) return;
            await enviar(tipo, result.assets[0]);
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const enviar = async (tipo, asset) => {
    setSubiendo(tipo);
    try {
      const formData = new FormData();
      const uri  = asset.uri;
      const name = asset.name || `doc_${Date.now()}.jpg`;
      const type = asset.mimeType || 'image/jpeg';

      formData.append('foto', { uri, name, type });
      formData.append('tipo', tipo);

      await api.post('/documentos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await cargar();
    } catch {
      Alert.alert('Error', 'No se pudo subir el documento. Intenta de nuevo.');
    } finally {
      setSubiendo(null);
    }
  };

  const eliminar = (tipo, label) => {
    Alert.alert(
      'Eliminar documento',
      `¿Eliminar "${label}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/documentos/${tipo}`);
              await cargar();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el documento');
            }
          },
        },
      ]
    );
  };

  if (loading) return (
    <View style={s.loader}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.title}>Mis Documentos</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Aviso opcional */}
        <View style={s.aviso}>
          <MaterialIcons name="info" size={16} color={colors.primary} />
          <Text style={s.avisoText}>
            Estos documentos son opcionales y solo los ve la administración de la asociación.
          </Text>
        </View>

        {DOCUMENTOS.map((def) => {
          const doc       = getDoc(def.tipo);
          const cargando  = subiendo === def.tipo;

          return (
            <View key={def.tipo} style={s.card}>
              <View style={s.cardLeft}>
                <View style={[s.iconBox, doc && s.iconBoxActivo]}>
                  <MaterialIcons
                    name={def.icon}
                    size={22}
                    color={doc ? colors.primary : colors.onSurfaceVariant}
                  />
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.cardLabel}>{def.label}</Text>
                  <Text style={s.cardDesc}>
                    {doc
                      ? `Subido el ${new Date(doc.fechaSubida).toLocaleDateString('es-CO')}`
                      : def.desc}
                  </Text>
                </View>
              </View>

              <View style={s.cardActions}>
                {cargando ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : doc ? (
                  <>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(doc.url)}
                      style={s.actionBtn}
                    >
                      <MaterialIcons name="open-in-new" size={18} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => eliminar(def.tipo, def.label)}
                      style={s.actionBtn}
                    >
                      <MaterialIcons name="delete-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={() => subirDocumento(def.tipo)}
                    style={s.subirBtn}
                  >
                    <MaterialIcons name="upload" size={16} color={colors.onPrimary} />
                    <Text style={s.subirBtnText}>Subir</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = (c) => StyleSheet.create({
  container:    { flex: 1, backgroundColor: c.background },
  loader:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: c.background },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 },
  backBtn:      { padding: 4 },
  title:        { fontSize: 20, fontWeight: '700', color: c.onSurface },
  scroll:       { padding: 16, gap: 12, paddingBottom: 40 },
  aviso:        { flexDirection: 'row', gap: 8, backgroundColor: c.primaryContainer, borderRadius: 12, padding: 12, marginBottom: 8 },
  avisoText:    { flex: 1, fontSize: 12, color: c.onPrimaryContainer, lineHeight: 18 },
  card:         { backgroundColor: c.surfaceContainer, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox:      { width: 44, height: 44, borderRadius: 12, backgroundColor: c.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  iconBoxActivo:{ backgroundColor: c.primaryContainer },
  cardInfo:     { flex: 1 },
  cardLabel:    { fontSize: 14, fontWeight: '600', color: c.onSurface },
  cardDesc:     { fontSize: 12, color: c.onSurfaceVariant, marginTop: 2 },
  cardActions:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 8 },
  actionBtn:    { padding: 6 },
  subirBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10 },
  subirBtnText: { fontSize: 12, fontWeight: '700', color: c.onPrimary },
  error:        { color: c.error },
});

export default MisDocumentosScreen;
