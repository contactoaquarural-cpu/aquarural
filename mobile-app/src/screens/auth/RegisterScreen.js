import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api.service';
import { colors, spacing, radius, typography } from '../../utils/theme';

const STEPS = ['Datos personales', 'Acceso', 'Finca'];

const RegisterScreen = ({ navigation }) => {
  const [step,     setStep]     = useState(0);
  const [loading,  setLoading]  = useState(false);

  // Paso 1 — Datos personales
  const [nombre,    setNombre]    = useState('');
  const [cedula,    setCedula]    = useState('');
  const [telefono,  setTelefono]  = useState('');
  const [correo,    setCorreo]    = useState('');

  // Paso 2 — Acceso
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');

  // Paso 3 — Finca
  const [nombreFinca,  setNombreFinca]  = useState('');
  const [hectareas,    setHectareas]    = useState('');
  const [cabezas,      setCabezas]      = useState('');
  const [produccion,   setProduccion]   = useState('CARNE');
  const [vereda,       setVereda]       = useState('');

  const handleNext = () => {
    if (step === 0) {
      if (!nombre.trim() || !cedula.trim()) {
        Alert.alert('Campos requeridos', 'Nombre y cédula son obligatorios.');
        return;
      }
    }
    if (step === 1) {
      if (password.length < 6) {
        Alert.alert('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== password2) {
        Alert.alert('Contraseñas no coinciden', 'Las contraseñas deben ser iguales.');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!nombreFinca.trim()) {
      Alert.alert('Finca requerida', 'Ingresa el nombre de tu finca.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/asociados', {
        nombre:    nombre.trim(),
        cedula:    cedula.trim(),
        telefono:  telefono.trim(),
        correo:    correo.trim() || undefined,
        password,
        finca: {
          nombre:         nombreFinca.trim(),
          hectareas:      parseFloat(hectareas) || 0,
          cabezasGanado:  parseInt(cabezas) || 0,
          tipoProduccion: produccion,
          vereda:         vereda.trim() || undefined,
        },
      });
      Alert.alert(
        '¡Registro exitoso!',
        'Tu cuenta ha sido creada. Ya puedes ingresar.',
        [{ text: 'Ir al Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (step === 0) return (
      <>
        <InputField label="Nombre completo *" value={nombre} onChangeText={setNombre} placeholder="Ej: Juan García" />
        <InputField label="Cédula *" value={cedula} onChangeText={setCedula} placeholder="Ej: 12345678" keyboardType="numeric" />
        <InputField label="Teléfono" value={telefono} onChangeText={setTelefono} placeholder="Ej: 3001234567" keyboardType="phone-pad" />
        <InputField label="Correo electrónico" value={correo} onChangeText={setCorreo} placeholder="Ej: nombre@correo.com" keyboardType="email-address" />
      </>
    );

    if (step === 1) return (
      <>
        <InputField label="Contraseña *" value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" secureTextEntry />
        <InputField label="Confirmar contraseña *" value={password2} onChangeText={setPassword2} placeholder="Repite la contraseña" secureTextEntry />
      </>
    );

    return (
      <>
        <InputField label="Nombre de la finca *" value={nombreFinca} onChangeText={setNombreFinca} placeholder="Ej: La Esperanza" />
        <InputField label="Hectáreas" value={hectareas} onChangeText={setHectareas} placeholder="Ej: 25" keyboardType="numeric" />
        <InputField label="Cabezas de ganado" value={cabezas} onChangeText={setCabezas} placeholder="Ej: 40" keyboardType="numeric" />
        <InputField label="Vereda" value={vereda} onChangeText={setVereda} placeholder="Ej: El Paraíso" />
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Tipo de producción *</Text>
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
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step === 0 ? navigation.goBack() : setStep((s) => s - 1)}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registro</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.progressItem}>
              <View style={[styles.progressDot, i <= step && styles.progressDotActive]}>
                <Text style={[styles.progressNum, i <= step && styles.progressNumActive]}>
                  {i + 1}
                </Text>
              </View>
              <Text style={[styles.progressLabel, i === step && styles.progressLabelActive]}>
                {s}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}

          <TouchableOpacity
            style={[styles.nextBtn, loading && { opacity: 0.6 }]}
            onPress={step < 2 ? handleNext : handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.nextBtnText}>
                {step < 2 ? 'Siguiente →' : 'Crear cuenta'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Componente campo de entrada reutilizable dentro de esta pantalla
const InputField = ({ label, ...props }) => (
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
  safe:  { flex: 1, backgroundColor: colors.background },
  flex:  { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing.xxl },

  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    padding:        spacing.md,
    paddingTop:     spacing.sm,
  },
  backIcon:    { ...typography.h2, color: colors.primary, paddingHorizontal: spacing.sm },
  headerTitle: { ...typography.h2 },

  progressContainer: {
    flexDirection:  'row',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
    marginBottom: spacing.md,
  },
  progressItem:  { alignItems: 'center', gap: spacing.xs },
  progressDot: {
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems:      'center',
    justifyContent:  'center',
  },
  progressDotActive:  { backgroundColor: colors.primaryContainer },
  progressNum:        { ...typography.smallBold, color: colors.outline },
  progressNumActive:  { color: colors.primary },
  progressLabel:      { ...typography.label, color: colors.outline },
  progressLabelActive: { color: colors.primary },

  fieldGroup:  { marginBottom: spacing.md },
  fieldLabel:  { ...typography.label, marginBottom: spacing.xs + 2 },
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
    flex:              1,
    paddingVertical:   spacing.sm + 2,
    backgroundColor:   colors.surfaceContainerHigh,
    borderRadius:      radius.md,
    alignItems:        'center',
  },
  radioBtnActive:  { backgroundColor: colors.primaryContainer },
  radioText:       { ...typography.smallBold, color: colors.onSurfaceVariant },
  radioTextActive: { color: colors.primary },

  nextBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems:      'center',
    marginTop:       spacing.lg,
  },
  nextBtnText: { ...typography.h3, color: colors.primary },
});

export default RegisterScreen;
