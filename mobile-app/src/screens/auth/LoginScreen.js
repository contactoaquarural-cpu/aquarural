import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useAsociadoStore } from '../../store/asociado.store';
import { Toast, useToast } from '../../components/AppToast';
import { colors, spacing, radius, typography } from '../../utils/theme';

const LoginScreen = ({ navigation }) => {
  const [cedula,   setCedula]   = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { show, toastProps } = useToast();

  const login        = useAuthStore((s) => s.login);
  const cargarDatos  = useAsociadoStore((s) => s.cargarDatos);

  const handleLogin = async () => {
    if (!cedula.trim() || !password.trim()) {
      show('warning', 'Campos requeridos', 'Ingresa tu cédula y contraseña.');
      return;
    }
    setLoading(true);
    try {
      await login(cedula.trim(), password);
      await cargarDatos();
    } catch (err) {
      show('error', 'Error al ingresar', err.response?.data?.message || 'Verifica tu cédula y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Toast {...toastProps} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header visual */}
          <LinearGradient
            colors={[colors.primaryContainer, colors.background]}
            style={styles.heroGradient}
          >
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>🐄</Text>
            </View>
            <Text style={styles.orgName}>ASOGACENTRO</Text>
            <Text style={styles.heroSub}>Asociación de Ganaderos del Centro</Text>
          </LinearGradient>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Ingresa con tu cédula para continuar.</Text>

            {/* Campo cédula */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Cédula</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  value={cedula}
                  onChangeText={setCedula}
                  placeholder="Ej: 12345678"
                  placeholderTextColor={colors.outline}
                  keyboardType="numeric"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Campo contraseña */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={[styles.input, styles.inputPassword]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <MaterialIcons
                    name={showPass ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={colors.onSurfaceVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Olvidé mi contraseña */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Botón ingresar */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primaryContainer, '#0d3327']}
                style={styles.loginBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={styles.loginBtnText}>Ingresar →</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Ir a registro */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>¿No estás registrado? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: colors.background },
  flex:  { flex: 1 },
  scroll: { flexGrow: 1 },

  heroGradient: {
    paddingTop:    spacing.xxl,
    paddingBottom: spacing.xl,
    alignItems:    'center',
    gap:           spacing.sm,
  },
  logoBox: {
    width:           72,
    height:          72,
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.xl,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.sm,
  },
  logoIcon:  { fontSize: 36 },
  orgName:   { ...typography.h1, color: colors.primary, letterSpacing: 2 },
  heroSub:   { ...typography.small, color: colors.onSurfaceVariant, textAlign: 'center' },

  formContainer: {
    flex:              1,
    backgroundColor:   colors.surfaceContainerLow,
    borderTopLeftRadius:  radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding:           spacing.xl,
    paddingTop:        spacing.xxl,
    marginTop:         -spacing.lg,
  },
  title:    { ...typography.displayMd, marginBottom: spacing.xs },
  subtitle: { ...typography.body, marginBottom: spacing.xl },

  fieldGroup: { marginBottom: spacing.md },
  fieldLabel: { ...typography.label, marginBottom: spacing.xs + 2 },
  inputWrapper: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius:    radius.lg,
    paddingHorizontal: spacing.md,
  },
  inputIcon:     { fontSize: 18, marginRight: spacing.sm },
  input: {
    flex:           1,
    height:         52,
    ...typography.bodyBold,
    color:          colors.onSurface,
  },
  inputPassword: { paddingRight: spacing.xl },
  eyeBtn:        { padding: spacing.xs },
  eyeIcon:       { fontSize: 18 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: spacing.xl },
  forgotText: { ...typography.small, color: colors.onPrimaryContainer, fontWeight: '600' },

  loginBtn: { borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.xl },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnGradient: {
    paddingVertical: spacing.md + 2,
    alignItems:      'center',
  },
  loginBtnText: {
    ...typography.h3,
    color:          colors.primary,
    letterSpacing:  1,
  },

  registerRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.sm },
  registerText: { ...typography.body },
  registerLink: { ...typography.bodyBold, color: colors.primary },
});

export default LoginScreen;
