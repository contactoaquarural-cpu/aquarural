import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors } from '../../utils/ThemeContext';
import api from '../../services/api.service';

const CATEGORIAS = [
  { key: 'ANIMAL',  label: 'Animal' },
  { key: 'TERRENO', label: 'Terreno' },
  { key: 'FINCA',   label: 'Finca' },
  { key: 'INSUMO',  label: 'Insumo' },
  { key: 'OTRO',    label: 'Otro' },
];

const CrearPublicacionScreen = ({ navigation }) => {
  const colors = useThemeColors();
  const s = styles(colors);

  const [form, setForm] = useState({
    titulo: '', descripcion: '', categoria: 'ANIMAL',
    subcategoria: '', precio: '', negociable: false,
    municipio: 'Garzón', vereda: '', telefono: '', whatsapp: '',
  });
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const seleccionarFotos = async () => {
    if (fotos.length >= 5) {
      Alert.alert('Máximo 5 fotos', 'Ya tienes el máximo de fotos permitidas.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - fotos.length,
    });
    if (!result.canceled) {
      setFotos((prev) => [...prev, ...result.assets].slice(0, 5));
    }
  };

  const eliminarFoto = (idx) => setFotos((prev) => prev.filter((_, i) => i !== idx));

  const publicar = async () => {
    if (!form.titulo.trim() || form.titulo.length < 5) {
      return setError('El título debe tener al menos 5 caracteres');
    }
    if (!form.descripcion.trim() || form.descripcion.length < 10) {
      return setError('La descripción debe tener al menos 10 caracteres');
    }
    if (!form.telefono.trim() && !form.whatsapp.trim()) {
      return setError('Debes ingresar al menos un número de contacto');
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('titulo', form.titulo.trim());
      formData.append('descripcion', form.descripcion.trim());
      formData.append('categoria', form.categoria);
      if (form.subcategoria) formData.append('subcategoria', form.subcategoria.trim());
      if (form.precio) formData.append('precio', form.precio);
      formData.append('negociable', String(form.negociable));
      formData.append('municipio', form.municipio.trim() || 'Garzón');
      if (form.vereda) formData.append('vereda', form.vereda.trim());
      if (form.telefono) formData.append('telefono', form.telefono.trim());
      if (form.whatsapp) formData.append('whatsapp', form.whatsapp.trim());

      fotos.forEach((foto, i) => {
        formData.append('fotos', {
          uri: foto.uri,
          name: `foto_${i}.jpg`,
          type: 'image/jpeg',
        });
      });

      await api.post('/publicaciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert(
        '¡Publicación enviada!',
        'Tu aviso será revisado por el administrador antes de aparecer en el mercado.',
        [{ text: 'Entendido', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Error al publicar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nuevo aviso</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">

        {/* Fotos */}
        <Text style={s.label}>Fotos ({fotos.length}/5)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.fotosRow}>
          {fotos.map((f, i) => (
            <View key={i} style={s.fotoWrapper}>
              <Image source={{ uri: f.uri }} style={s.fotoMini} />
              <TouchableOpacity style={s.fotoEliminar} onPress={() => eliminarFoto(i)}>
                <MaterialIcons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {fotos.length < 5 && (
            <TouchableOpacity style={s.fotoBtnAgregar} onPress={seleccionarFotos}>
              <MaterialIcons name="add-photo-alternate" size={28} color={colors.primary} />
              <Text style={s.fotoBtnText}>Agregar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Categoría */}
        <Text style={s.label}>Categoría *</Text>
        <View style={s.categorias}>
          {CATEGORIAS.map((c) => (
            <TouchableOpacity
              key={c.key}
              style={[s.catBtn, form.categoria === c.key && s.catBtnActivo]}
              onPress={() => set('categoria', c.key)}
            >
              <Text style={[s.catLabel, form.categoria === c.key && s.catLabelActivo]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Título */}
        <Text style={s.label}>Título *</Text>
        <TextInput
          style={s.input}
          placeholder="Ej: Novillo cebú macho 300 kg"
          placeholderTextColor={colors.onSurfaceVariant}
          value={form.titulo}
          onChangeText={(v) => set('titulo', v)}
          maxLength={100}
        />

        {/* Descripción */}
        <Text style={s.label}>Descripción *</Text>
        <TextInput
          style={[s.input, s.textarea]}
          placeholder="Describe el animal, terreno o producto que ofreces..."
          placeholderTextColor={colors.onSurfaceVariant}
          value={form.descripcion}
          onChangeText={(v) => set('descripcion', v)}
          multiline
          numberOfLines={4}
          maxLength={1000}
        />

        {/* Precio */}
        <Text style={s.label}>Precio (COP)</Text>
        <TextInput
          style={s.input}
          placeholder="Ej: 2500000"
          placeholderTextColor={colors.onSurfaceVariant}
          value={form.precio}
          onChangeText={(v) => set('precio', v.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={s.negociableRow}
          onPress={() => set('negociable', !form.negociable)}
        >
          <MaterialIcons
            name={form.negociable ? 'check-box' : 'check-box-outline-blank'}
            size={22}
            color={form.negociable ? colors.primary : colors.onSurfaceVariant}
          />
          <Text style={s.negociableLabel}>Precio negociable</Text>
        </TouchableOpacity>

        {/* Ubicación */}
        <Text style={s.label}>Municipio *</Text>
        <TextInput
          style={s.input}
          placeholder="Garzón"
          placeholderTextColor={colors.onSurfaceVariant}
          value={form.municipio}
          onChangeText={(v) => set('municipio', v)}
        />
        <Text style={s.label}>Vereda</Text>
        <TextInput
          style={s.input}
          placeholder="Ej: Versalles"
          placeholderTextColor={colors.onSurfaceVariant}
          value={form.vereda}
          onChangeText={(v) => set('vereda', v)}
        />

        {/* Contacto */}
        <Text style={s.label}>Teléfono de contacto</Text>
        <TextInput
          style={s.input}
          placeholder="Ej: 3106160000"
          placeholderTextColor={colors.onSurfaceVariant}
          value={form.telefono}
          onChangeText={(v) => set('telefono', v)}
          keyboardType="phone-pad"
          maxLength={15}
        />
        <Text style={s.label}>WhatsApp</Text>
        <TextInput
          style={s.input}
          placeholder="Ej: 3106160000"
          placeholderTextColor={colors.onSurfaceVariant}
          value={form.whatsapp}
          onChangeText={(v) => set('whatsapp', v)}
          keyboardType="phone-pad"
          maxLength={15}
        />

        {error ? <Text style={s.error}>{error}</Text> : null}

        <TouchableOpacity style={s.btnPublicar} onPress={publicar} disabled={loading}>
          {loading
            ? <ActivityIndicator color={colors.onPrimary} />
            : <Text style={s.btnPublicarText}>Enviar publicación</Text>}
        </TouchableOpacity>

        <Text style={s.aviso}>
          Tu publicación será revisada por el administrador antes de aparecer en el mercado.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = (c) => StyleSheet.create({
  container:        { flex: 1, backgroundColor: c.background },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 },
  headerTitle:      { fontSize: 18, fontWeight: '700', color: c.onSurface },
  form:             { padding: 16, gap: 4 },
  label:            { fontSize: 13, fontWeight: '700', color: c.onSurfaceVariant, marginTop: 16, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:            { backgroundColor: c.surfaceContainer, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: c.onSurface, borderWidth: 1, borderColor: c.outlineVariant },
  textarea:         { minHeight: 100, textAlignVertical: 'top' },
  categorias:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: c.surfaceContainer, borderWidth: 1, borderColor: c.outlineVariant },
  catBtnActivo:     { backgroundColor: c.primaryContainer, borderColor: c.primary },
  catLabel:         { fontSize: 13, color: c.onSurfaceVariant, fontWeight: '600' },
  catLabelActivo:   { color: c.onPrimaryContainer },
  negociableRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  negociableLabel:  { fontSize: 14, color: c.onSurface },
  fotosRow:         { flexDirection: 'row' },
  fotoWrapper:      { position: 'relative', marginRight: 10 },
  fotoMini:         { width: 80, height: 80, borderRadius: 12 },
  fotoEliminar:     { position: 'absolute', top: -6, right: -6, backgroundColor: c.error, borderRadius: 10, padding: 2 },
  fotoBtnAgregar:   { width: 80, height: 80, borderRadius: 12, borderWidth: 2, borderColor: c.primary, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  fotoBtnText:      { fontSize: 11, color: c.primary, fontWeight: '600' },
  error:            { color: c.error, fontSize: 13, marginTop: 12 },
  btnPublicar:      { backgroundColor: c.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  btnPublicarText:  { color: c.onPrimary, fontSize: 16, fontWeight: '700' },
  aviso:            { fontSize: 12, color: c.onSurfaceVariant, textAlign: 'center', marginTop: 12, lineHeight: 18 },
});

export default CrearPublicacionScreen;
