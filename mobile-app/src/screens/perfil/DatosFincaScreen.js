import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAsociadoStore } from '../../store/asociado.store';
import { Toast, useToast } from '../../components/AppToast';
import { useTheme } from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';

const DatosFincaScreen = () => {
  const { colors, typography } = useTheme();
  const navigation = useNavigation();
  const { finca, actualizarFinca } = useAsociadoStore();
  const { show, toastProps } = useToast();

  const [nombre,     setNombre]     = useState(finca?.nombre           || '');
  const [hectareas,  setHectareas]  = useState(String(finca?.hectareas    || ''));
  const [cabezas,    setCabezas]    = useState(String(finca?.cabezasGanado || ''));
  const [produccion, setProduccion] = useState(finca?.tipoProduccion   || 'CARNE');
  const [vereda,     setVereda]     = useState(finca?.vereda           || '');
  const [loading,    setLoading]    = useState(false);

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      show('warning', 'Campo requerido', 'El nombre de la finca es obligatorio.');
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
      show('success', 'Finca actualizada', 'Los datos de tu finca fueron guardados.');
      setTimeout(() => navigation.goBack(), 1800);
    } catch (err) {
      show('error', 'Error', err.response?.data?.message || 'No se pudo actualizar la finca.');
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors, typography);

  return (
    <SafeAreaView style={styles.safe}>
      <Toast {...toastProps} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
          <Text style={styles.backText}>Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Datos de la Finca</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="Nombre de la finca" value={nombre} onChangeText={setNombre} autoCapitalize="words" />
        <Field label="Hectáreas" value={hectareas} onChangeText={setHectareas} keyboardType="numeric" />
        <Field label="Cabezas de ganado" value={cabezas} onChangeText={setCabezas} keyboardType="numeric" />
        <Field label="Vereda" value={vereda} onChangeText={setVereda} autoCapitalize="words" />

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

const makeStyles = (colors, typography) => StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.md,
  },
  backBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: spacing.xs, paddingHorizontal: spacing.xs },
  backText: { ...typography.body, color: colors.primary, fontWeight: '600' },
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
