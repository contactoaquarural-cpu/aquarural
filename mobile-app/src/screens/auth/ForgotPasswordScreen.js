import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api.service';
import { Toast, useToast } from '../../components/AppToast';
import { useTheme } from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const { colors, typography } = useTheme();
  const [correo,  setCorreo]  = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const { show, toastProps } = useToast();

  const handleSubmit = async () => {
    if (!correo.trim()) {
      show('warning', 'Campo requerido', 'Ingresa tu correo electrónico.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/recuperar', { correo: correo.trim() });
      setSent(true);
    } catch (err) {
      show('error', 'Error', err.response?.data?.message || 'No se pudo procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors, typography);

  return (
    <SafeAreaView style={styles.safe}>
      <Toast {...toastProps} />
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
        <Text style={styles.backText}>Volver</Text>
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

const makeStyles = (colors, typography) => StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.background },
  backBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, padding: spacing.md },
  backText:  { ...typography.body, color: colors.primary, fontWeight: '600' },
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
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            spacing.md,
  },
  successIcon:  { fontSize: 52 },
  successTitle: { ...typography.h1, textAlign: 'center' },
  successBody:  { ...typography.body, textAlign: 'center', maxWidth: 280 },
});

export default ForgotPasswordScreen;
