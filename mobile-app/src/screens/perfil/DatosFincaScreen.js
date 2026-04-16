import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAsociadoStore } from '../../store/asociado.store';
import { colors, spacing, radius, typography } from '../../utils/theme';

const DatosFincaScreen = () => {
  const navigation = useNavigation();
  const { finca, actualizarFinca } = useAsociadoStore();

  const [nombre,      setNombre]      = useState(finca?.nombre          || '');
  const [hectareas,   setHectareas]   = useState(String(finca?.hectareas    || ''));
  const [cabezas,     setCabezas]     = useState(String(finca?.cabezasGanado || ''));
  const [produccion,  setProduccion]  = useState(finca?.tipoProduccion  || 'CARNE');
  const [vereda,      setVereda]      = useState(finca?.vereda          || '');
  const [loading,     setLoading]     = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      Alert.alert('Requerido', 'El nombre de la finca es obligatorio.');
      return;
    }
    setLoading(true);
    try {
      await actualizarFinca({
        nombre:         nombre.trim(),
        hectareas:      parseFloat(hectareas) || 0,
        cabezasGanado:  parseInt(cabezas)     || 0,
        tipoProduccion: produccion,
        vereda:         vereda.trim() || undefined,
      });
      Alert.alert('✅ Finca actualizada', 'Los datos de tu finca fueron guardados.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo actualizar la finca.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Datos de la Finca</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="Nombre de la finca" value={nombre} onChangeText={setNombre} />
        <Field label="Hectáreas" value={hectareas} onChangeText={setHectareas} keyboardType="numeric" />
        <Field label="Cabezas de ganado" value={cabezas} onChangeText={setCabezas} keyboardType="numeric" />
        <Field label="Vereda" value={vereda} onChangeText={setVereda} />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Tipo de producción</Text>
          <View style={styles.radioRow}>
            {['CARNE', 'LECHE', 'DOBLE'].map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[styles.radioBtn, produccion === tipo && styles.radioBtnActive]}
                onPress={() => setProduccion(tipo)}
              >
                <Text style={[styles.radioText, produccion === tipo && styles.radioTextActive]}>
                  {tipo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  radioRow: { flexDirection: 'row', gap: spacing.sm },
  radioBtn: {
    flex:            1,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius:    radius.md,
    alignItems:      'center',
  },
  radioBtnActive:  { backgroundColor: colors.primaryContainer },
  radioText:       { ...typography.smallBold, color: colors.onSurfaceVariant },
  radioTextActive: { color: colors.primary },

  saveBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems:      'center',
    marginTop:       spacing.md,
  },
  saveBtnText: { ...typography.h3, color: colors.primary },
});

export default DatosFincaScreen;
