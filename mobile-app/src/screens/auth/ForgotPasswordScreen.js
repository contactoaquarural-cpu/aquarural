import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api.service';
import { colors, spacing, radius, typography } from '../../utils/theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const [correo,  setCorreo]  = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async () => {
    if (!correo.trim()) {
      Alert.alert('Requerido', 'Ingresa tu correo electrónico.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/recuperar', { correo: correo.trim() });
      setSent(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        {sent ? (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>📬</Text>
            <Text style={styles.successTitle}>Revisa tu correo</Text>
            <Text style={styles.successBody}>
              Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
            </Text>
            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.btnText}>Volver al Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo registrado y te enviaremos un enlace para restablecerla.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                value={correo}
                onChangeText={setCorreo}
                placeholder="Ej: nombre@correo.com"
                placeholderTextColor={colors.outline}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={colors.primary} />
                : <Text style={styles.btnText}>Enviar enlace</Text>
              }
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.background },
  backBtn:   { padding: spacing.md },
  backIcon:  { ...typography.h2, color: colors.primary },
  container: { flex: 1, padding: spacing.xl, paddingTop: spacing.lg },

  title:    { ...typography.h1, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.xl },

  fieldGroup:  { marginBottom: spacing.lg },
  fieldLabel:  { ...typography.label, marginBottom: spacing.xs + 2 },
  input: {
    backgroundColor:   colors.surfaceContainerHigh,
    borderRadius:      radius.lg,
    paddingHorizontal: spacing.md,
    height:            52,
    ...typography.bodyBold,
    color:             colors.onSurface,
  },

  btn: {
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems:      'center',
  },
  btnText: { ...typography.h3, color: colors.primary },

  successCard: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    gap:             spacing.md,
  },
  successIcon:  { fontSize: 52 },
  successTitle: { ...typography.h1, textAlign: 'center' },
  successBody:  { ...typography.body, textAlign: 'center', maxWidth: 280 },
});

export default ForgotPasswordScreen;
