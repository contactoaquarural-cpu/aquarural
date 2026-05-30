import React, { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../../services/api.service';
import { useTheme } from '../../utils/ThemeContext';
import { spacing, radius } from '../../utils/theme';

const STEPS = ['Datos', 'Acceso', 'Finca'];

const RegisterScreen = ({ navigation }) => {
  const { colors, typography } = useTheme();
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [exitoso, setExitoso] = useState(false);

  // Paso 1 — Datos personales
  const [nombre,   setNombre]   = useState('');
  const [cedula,   setCedula]   = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo,   setCorreo]   = useState('');
  const [municipio,    setMunicipio]    = useState('Garzón');
  const [municipios,   setMunicipios]   = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Errores inline por campo
  const [errores, setErrores] = useState({});

  useEffect(() => {
    // Lista estática de municipios del Huila — evita dependencia de API externa
    setMunicipios([
      { name: 'Acevedo' }, { name: 'Agrado' }, { name: 'Aipe' }, { name: 'Algeciras' },
      { name: 'Altamira' }, { name: 'Baraya' }, { name: 'Campoalegre' }, { name: 'Colombia' },
      { name: 'Elías' }, { name: 'Garzón' }, { name: 'Gigante' }, { name: 'Guadalupe' },
      { name: 'Hobo' }, { name: 'Iquira' }, { name: 'Isnos' }, { name: 'La Argentina' },
      { name: 'La Plata' }, { name: 'Nataga' }, { name: 'Neiva' }, { name: 'Oporapa' },
      { name: 'Paicol' }, { name: 'Palermo' }, { name: 'Palestina' }, { name: 'Pital' },
      { name: 'Pitalito' }, { name: 'Rivera' }, { name: 'Saladoblanco' }, { name: 'San Agustín' },
      { name: 'Santa María' }, { name: 'Suaza' }, { name: 'Tarqui' }, { name: 'Tello' },
      { name: 'Teruel' }, { name: 'Tesalia' }, { name: 'Timana' }, { name: 'Villavieja' },
      { name: 'Yaguará' },
    ]);
  }, []);

  // Paso 2 — Acceso
  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');

  // Paso 3 — Finca
  const [nombreFinca, setNombreFinca] = useState('');
  const [hectareas,   setHectareas]   = useState('');
  const [cabezas,     setCabezas]     = useState('');
  const [produccion,  setProduccion]  = useState(['CARNE']);
  const [vereda,      setVereda]      = useState('');

  const capitalizarPalabras = (text) =>
    text
      .split(' ')
      .map((palabra) => palabra.length > 0 ? palabra[0].toUpperCase() + palabra.slice(1) : '')
      .join(' ');

  const setError = (campo, msg) =>
    setErrores((prev) => ({ ...prev, [campo]: msg }));

  const clearError = (campo) =>
    setErrores((prev) => { const e = { ...prev }; delete e[campo]; return e; });

  const handleNext = () => {
    const nuevosErrores = {};

    if (step === 0) {
      if (!nombre.trim())
        nuevosErrores.nombre = 'El nombre es obligatorio.';
      else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombre.trim()))
        nuevosErrores.nombre = 'El nombre no debe contener números ni caracteres especiales.';

      if (!cedula.trim())
        nuevosErrores.cedula = 'La cédula es obligatoria.';
      else if (cedula.trim().length < 8)
        nuevosErrores.cedula = 'La cédula debe tener mínimo 8 dígitos.';

      if (telefono.trim() && !telefono.trim().startsWith('3'))
        nuevosErrores.telefono = 'El celular debe iniciar con 3.';
      else if (telefono.trim() && telefono.trim().length < 10)
        nuevosErrores.telefono = 'El celular debe tener 10 dígitos.';

      if (correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()))
        nuevosErrores.correo = 'Ingresa un correo válido. Ej: nombre@gmail.com';
    }

    if (step === 1) {
      if (password.length < 6)
        nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres.';
      if (password2 && password !== password2)
        nuevosErrores.password2 = 'Las contraseñas no coinciden.';
      if (!password2)
        nuevosErrores.password2 = 'Confirma tu contraseña.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    const nuevosErrores = {};
    if (!nombreFinca.trim())
      nuevosErrores.nombreFinca = 'El nombre de la finca es obligatorio.';
    if (produccion.length === 0)
      nuevosErrores.produccion = 'Selecciona al menos un tipo de producción.';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setLoading(true);
    try {
      await api.post('/asociados', {
        nombre:    nombre.trim(),
        cedula:    cedula.trim(),
        telefono:  telefono.trim(),
        correo:    correo.trim() || undefined,
        municipio: municipio.trim(),
        password,
        finca: {
          nombre:         nombreFinca.trim(),
          hectareas:      parseFloat(hectareas) || 0,
          cabezasGanado:  parseInt(cabezas) || 0,
          tipoProduccion: produccion.length > 1 ? 'DOBLE' : produccion[0] || 'CARNE',
          vereda:         vereda.trim() || undefined,
        },
      });
      setExitoso(true);
    } catch (err) {
      const msg = err.code === 'ECONNABORTED'
        ? 'La conexión tardó demasiado. Verifica tu internet e intenta de nuevo.'
        : err.response?.data?.message || 'No se pudo completar el registro. Intenta de nuevo.';
      setError('submit', msg);
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(colors, typography);

  const renderStep = () => {
    if (step === 0) return (
      <>
        <InputField
          label="Nombre completo *"
          value={nombre}
          onChangeText={(t) => {
            const soloLetras = t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
            setNombre(soloLetras);
            clearError('nombre');
          }}
          placeholder="Ej: Juan García"
          autoCapitalize="words"
          error={errores.nombre}
        />
        <InputField
          label="Cédula *"
          value={cedula}
          onChangeText={(t) => { setCedula(t.replace(/[^0-9]/g, '').slice(0, 10)); clearError('cedula'); }}
          placeholder="Mínimo 8 dígitos"
          keyboardType="numeric"
          error={errores.cedula}
        />
        <InputField
          label="Celular"
          value={telefono}
          onChangeText={(t) => { setTelefono(t.replace(/[^0-9]/g, '').slice(0, 10)); clearError('telefono'); }}
          placeholder="Ej: 3001234567"
          keyboardType="phone-pad"
          error={errores.telefono}
        />
        <InputField
          label="Correo electrónico"
          value={correo}
          onChangeText={(t) => { setCorreo(t.replace(/\s/g, '').toLowerCase()); clearError('correo'); }}
          placeholder="Ej: nombre@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errores.correo}
        />

        {/* Selector de municipio */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Municipio *</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.selectorText}>{municipio || 'Selecciona un municipio'}</Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Municipio del Huila</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color={colors.onSurface} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={municipios}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.modalItem, municipio === item.name && styles.modalItemActive]}
                    onPress={() => { setMunicipio(item.name); setModalVisible(false); }}
                  >
                    <Text style={[styles.modalItemText, municipio === item.name && styles.modalItemTextActive]}>
                      {item.name}
                    </Text>
                    {municipio === item.name && (
                      <MaterialIcons name="check" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </>
    );

    if (step === 1) return (
      <>
        <InputField
          label="Contraseña *"
          value={password}
          onChangeText={(t) => { setPassword(t); clearError('password'); }}
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          error={errores.password}
        />
        <ConfirmPasswordField
          value={password2}
          onChangeText={(t) => { setPassword2(t); clearError('password2'); }}
          error={errores.password2}
        />
      </>
    );

    return (
      <>
        <InputField
          label="Nombre de la finca *"
          value={nombreFinca}
          onChangeText={(t) => { setNombreFinca(t); clearError('nombreFinca'); }}
          placeholder="Ej: La Esperanza"
          autoCapitalize="words"
          error={errores.nombreFinca}
        />
        <InputField label="Hectáreas" value={hectareas} onChangeText={setHectareas} placeholder="Ej: 25" keyboardType="numeric" />
        <InputField label="Cabezas de ganado" value={cabezas} onChangeText={setCabezas} placeholder="Ej: 40" keyboardType="numeric" />
        <InputField
          label="Vereda"
          value={vereda}
          onChangeText={setVereda}
          placeholder="Ej: El Paraíso"
          autoCapitalize="words"
        />
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Tipo de producción * (puede seleccionar varios)</Text>
          <View style={styles.radioRow}>
            {['CARNE', 'LECHE'].map((tipo) => {
              const activo = produccion.includes(tipo);
              return (
                <TouchableOpacity
                  key={tipo}
                  style={[styles.radioBtn, activo && styles.radioBtnActive]}
                  onPress={() => {
                    setProduccion((prev) => activo ? prev.filter((t) => t !== tipo) : [...prev, tipo]);
                    clearError('produccion');
                  }}
                >
                  <MaterialIcons
                    name={activo ? 'check-box' : 'check-box-outline-blank'}
                    size={16}
                    color={activo ? colors.primary : colors.onSurfaceVariant}
                  />
                  <Text style={[styles.radioText, activo && styles.radioTextActive]}>{tipo}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errores.produccion && <ErrorText msg={errores.produccion} />}
        </View>
        {errores.submit && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={16} color={colors.error} />
            <Text style={styles.errorBannerText}>{errores.submit}</Text>
          </View>
        )}
      </>
    );
  };

  if (exitoso) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.exitoContainer}>
          <View style={styles.exitoIconWrapper}>
            <MaterialIcons name="check-circle" size={80} color={colors.primary} />
          </View>
          <Text style={styles.exitoTitulo}>¡Registro exitoso!</Text>
          <Text style={styles.exitoSubtitulo}>
            Tu cuenta ha sido creada.{'\n'}Ya puedes ingresar a la app.
          </Text>
          <TouchableOpacity
            style={styles.exitoBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={styles.exitoBtnText}>Ir al Login →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => step === 0 ? navigation.goBack() : setStep((s) => s - 1)}>
            <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registro</Text>
          <View style={{ width: 70 }} />
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <View style={styles.progressItem}>
                <View style={styles.progressDotWrapper}>
                  {i === step && <PulseRing />}
                  <View style={[
                    styles.progressDot,
                    i < step && styles.progressDotDone,
                    i === step && styles.progressDotActive,
                  ]}>
                    {i < step
                      ? <MaterialIcons name="check" size={16} color={colors.primary} />
                      : <Text style={[styles.progressNum, i === step && styles.progressNumActive]}>{i + 1}</Text>
                    }
                  </View>
                </View>
                <Text style={[
                  styles.progressLabel,
                  i < step && styles.progressLabelDone,
                  i === step && styles.progressLabelActive,
                ]}>
                  {s}
                </Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.progressLine, i < step && styles.progressLineDone]} />
              )}
            </React.Fragment>
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

const PulseRing = () => {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors, typography);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1.7, duration: 800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />
  );
};

const ErrorText = ({ msg }) => {
  const { colors } = useTheme();
  const styles = makeStyles(colors, {});
  return (
    <View style={styles.errorRow}>
      <MaterialIcons name="error-outline" size={14} color={colors.error} />
      <Text style={styles.errorText}>{msg}</Text>
    </View>
  );
};

const ConfirmPasswordField = ({ value, onChangeText, error }) => {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors, typography);
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Confirmar contraseña *</Text>
      <View style={styles.inputRow}>
        {visible ? (
          <TextInput
            style={[styles.input, styles.inputWithIcon, error && styles.inputError]}
            value={value}
            onChangeText={onChangeText}
            placeholder="Repite la contraseña"
            placeholderTextColor={colors.outline}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
          />
        ) : (
          <TextInput
            style={[styles.input, styles.inputWithIcon, error && styles.inputError]}
            value={value}
            onChangeText={onChangeText}
            placeholder="Repite la contraseña"
            placeholderTextColor={colors.outline}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            secureTextEntry={true}
          />
        )}
        <TouchableOpacity style={styles.eyeBtn} onPress={() => setVisible((v) => !v)}>
          <MaterialIcons
            name={visible ? 'visibility' : 'visibility-off'}
            size={20}
            color={colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      </View>
      {error && <ErrorText msg={error} />}
    </View>
  );
};

const InputField = ({ label, secureTextEntry, value, onChangeText, error, autoCapitalize = 'none', ...props }) => {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors, typography);
  const [visible, setVisible] = useState(false);
  const { secureTextEntry: _drop, ...safeProps } = props;

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        {secureTextEntry ? (
          visible ? (
            <TextInput
              {...safeProps}
              style={[styles.input, styles.inputWithIcon, error && styles.inputError]}
              placeholderTextColor={colors.outline}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              secureTextEntry={false}
              value={value}
              onChangeText={onChangeText}
            />
          ) : (
            <TextInput
              {...safeProps}
              style={[styles.input, styles.inputWithIcon, error && styles.inputError]}
              placeholderTextColor={colors.outline}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              secureTextEntry={true}
              value={value}
              onChangeText={onChangeText}
            />
          )
        ) : (
          <TextInput
            {...safeProps}
            style={[styles.input, error && styles.inputError]}
            placeholderTextColor={colors.outline}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            value={value}
            onChangeText={onChangeText}
          />
        )}
        {secureTextEntry && (
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setVisible((v) => !v)}>
            <MaterialIcons
              name={visible ? 'visibility' : 'visibility-off'}
              size={20}
              color={colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <ErrorText msg={error} />}
    </View>
  );
};

const makeStyles = (colors, typography) => StyleSheet.create({
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
  backBtn:     { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 70 },
  backText:    { ...typography.bodyBold, color: colors.primary },
  headerTitle: { ...typography.h2 },

  progressContainer: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
    marginBottom:    spacing.md,
  },
  progressItem:  { alignItems: 'center', gap: spacing.xs, width: 80 },
  progressLine: {
    width:           32,
    height:          2,
    backgroundColor: colors.surfaceContainerHigh,
    marginBottom:    spacing.lg,
    alignSelf:       'center',
  },
  progressLineDone: { backgroundColor: colors.primary },
  progressDotWrapper: {
    width:          44,
    height:         44,
    alignItems:     'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position:        'absolute',
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: colors.primary,
  },
  progressDot: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     colors.surfaceContainerHigh,
  },
  progressDotActive: {
    backgroundColor: colors.primaryContainer,
    borderColor:     colors.primary,
  },
  progressDotDone: {
    backgroundColor: colors.primaryContainer,
    borderColor:     colors.primary,
  },
  progressNum:         { ...typography.smallBold, color: colors.outline },
  progressNumActive:   { ...typography.smallBold, color: colors.primary },
  progressLabel:       { ...typography.label, color: colors.outline, textAlign: 'center' },
  progressLabelActive: { ...typography.label, color: colors.primary, fontWeight: '700', textAlign: 'center' },
  progressLabelDone:   { ...typography.label, color: colors.primary, textAlign: 'center' },

  fieldGroup:  { marginBottom: spacing.md },
  fieldLabel:  { ...typography.label, marginBottom: spacing.xs + 2 },
  inputRow:    { position: 'relative' },
  input: {
    backgroundColor:   colors.surfaceContainerHigh,
    borderRadius:      radius.lg,
    paddingHorizontal: spacing.md,
    height:            52,
    ...typography.bodyBold,
    color:             colors.onSurface,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  inputWithIcon: { paddingRight: 48 },
  eyeBtn: {
    position:       'absolute',
    right:          spacing.md,
    top:            0,
    bottom:         0,
    justifyContent: 'center',
  },

  errorRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    marginTop:     spacing.xs,
  },
  errorText: { ...typography.small, color: colors.error, flex: 1 },

  errorBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             spacing.xs,
    backgroundColor: colors.errorContainer,
    borderRadius:    radius.md,
    padding:         spacing.md,
    marginBottom:    spacing.md,
  },
  errorBannerText: { ...typography.small, color: colors.error, flex: 1 },

  radioRow: { flexDirection: 'row', gap: spacing.sm },
  radioBtn: {
    flex:            1,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius:    radius.md,
    alignItems:      'center',
    flexDirection:   'row',
    justifyContent:  'center',
    gap:             4,
  },
  radioBtnActive:  { backgroundColor: colors.primaryContainer },
  radioText:       { ...typography.smallBold, color: colors.onSurfaceVariant },
  radioTextActive: { color: colors.primary },

  exitoContainer: {
    flex:            1,
    alignItems:      'center',
    justifyContent:  'center',
    padding:         spacing.xl,
    gap:             spacing.lg,
  },
  exitoIconWrapper: {
    width:           120,
    height:          120,
    borderRadius:    60,
    backgroundColor: colors.primaryContainer,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.md,
  },
  exitoTitulo:    { ...typography.displayMd, textAlign: 'center' },
  exitoSubtitulo: { ...typography.body, textAlign: 'center', color: colors.onSurfaceVariant },
  exitoBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xxl,
    alignItems:      'center',
    marginTop:       spacing.md,
  },
  exitoBtnText: { ...typography.h3, color: colors.primary },

  nextBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius:    radius.lg,
    paddingVertical: spacing.md + 2,
    alignItems:      'center',
    marginTop:       spacing.lg,
  },
  nextBtnText: { ...typography.h3, color: colors.primary },

  selector: {
    backgroundColor:   colors.surfaceContainerHigh,
    borderRadius:      radius.lg,
    paddingHorizontal: spacing.md,
    height:            52,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
  },
  selectorText: { ...typography.bodyBold, color: colors.onSurface },

  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'flex-end',
  },
  modalContainer: {
    backgroundColor:      colors.background,
    borderTopLeftRadius:  radius.xxl,
    borderTopRightRadius: radius.xxl,
    maxHeight:            '70%',
    paddingBottom:        spacing.xl,
  },
  modalHeader: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    padding:           spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  modalTitle:          { ...typography.h3 },
  modalItem: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingVertical:   spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  modalItemActive:     { backgroundColor: colors.primaryContainer },
  modalItemText:       { ...typography.body, color: colors.onSurface },
  modalItemTextActive: { color: colors.primary, fontWeight: '700' },
});

export default RegisterScreen;
