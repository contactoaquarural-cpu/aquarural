import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore }     from '../../store/auth.store';
import { useAsociadoStore } from '../../store/asociado.store';
import { colors, spacing, radius, typography } from '../../utils/theme';

const EditarPerfilScreen = () => {
  const navigation = useNavigation();
  const user       = useAuthStore((s) => s.user);
  const { asociado, actualizarPerfil } = useAsociadoStore();

  const datos = asociado || user;

  const [nombre,   setNombre]   = useState(datos?.nombre   || '');
  const [telefono, setTelefono] = useState(datos?.telefono || '');
  const [correo,   setCorreo]   = useState(datos?.correo   || '');
  const [loading,  setLoading]  = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Requerido', 'El nombre no puede estar vacío.');
      return;
    }
    setLoading(true);
    try {
      await actualizarPerfil({
        nombre:   nombre.trim(),
        telefono: telefono.trim() || undefined,
        correo:   correo.trim()   || undefined,
      });
      Alert.alert('✅ Perfil actualizado', 'Tus datos fueron guardados correctamente.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Field label="Nombre completo" value={nombre} onChangeText={setNombre} />
          <Field label="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
          <Field label="Correo electrónico" value={correo} onChangeText={setCorreo} keyboardType="email-address" />

          <View style={styles.readOnly}>
            <Text style={styles.readOnlyLabel}>Cédula (no editable)</Text>
            <Text style={styles.readOnlyValue}>{datos?.cedula || '—'}</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.6 }]}
            onPress={handleGuardar}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.primary} />
              : <Text style={styles.saveBtnText}>Guardar cambios</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const Field = ({ label, ...props }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      placeholderTextColor={colors.outline}
      autoCapitalize="none"
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  flex:   { flex: 1 },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.md,
  },
  backIcon: { ...typography.h2, color: colors.primary, paddingHorizontal: spacing.sm },
  title:    { ...typography.h2 },
  scroll:   { padding: spacing.xl, gap: spacing.md },

  fieldGroup:  { gap: spacing.xs + 2 },
  fieldLabel:  { ...typography.label },
  input: {
    backgroundColor:   colors.surfaceContainerHigh,
    borderRadius:      radius.lg,
    paddingHorizontal: spacing.md,
    height:            52,
    ...typography.bodyBold,
    color:             colors.onSurface,
  },

  readOnly: {
    backgroundColor: colors.surfaceContainer,
    borderRadius:    radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.md,
    gap:             4,
  },
  readOnlyLabel: { ...typography.label },
  readOnlyValue: { ...typography.body, color: colors.onSurface },

  saveBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems:      'center',
    marginTop:       spacing.md,
  },
  saveBtnText: { ...typography.h3, color: colors.primary },
});

export default EditarPerfilScreen;
