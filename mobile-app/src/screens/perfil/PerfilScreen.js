import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Switch, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api.service';
import { useAuthStore }     from '../../store/auth.store';
import { useAsociadoStore } from '../../store/asociado.store';
import { useTheme }         from '../../utils/ThemeContext';
import { useConfigStore }   from '../../store/config.store';
import EstadoBadge from '../../components/EstadoBadge';
import { Toast, ConfirmModal, useToast } from '../../components/AppToast';
import { spacing, radius } from '../../utils/theme';

const PerfilScreen = ({ navigation }) => {
  const { isDark, toggleTheme, colors, typography } = useTheme();
  const logout     = useAuthStore((s) => s.logout);
  const user       = useAuthStore((s) => s.user);
  const { asociado, cargarDatos } = useAsociadoStore();
  const { show, toastProps } = useToast();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { nombreAsociacion, telefonoContacto } = useConfigStore();
  const telefono = telefonoContacto;

  const handleContactar = () => {
    const numero = telefono.replace(/\D/g, '');
    Alert.alert(
      `Contactar a ${nombreAsociacion}`,
      `¿Cómo deseas comunicarte?\n📞 ${telefono}`,
      [
        { text: '📞 Llamar',      onPress: () => Linking.openURL(`tel:${numero}`) },
        { text: '💬 WhatsApp',    onPress: () => Linking.openURL(`https://wa.me/57${numero}`) },
        { text: 'Cancelar',       style: 'cancel' },
      ]
    );
  };

  const datos  = asociado || user;
  const nombre = datos?.nombre || '';
  const cedula = datos?.cedula || '';
  const estado = datos?.estado || 'AL_DIA';

  const iniciales = nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleCambiarFoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      show('warning', 'Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    try {
      const formData = new FormData();
      formData.append('foto', {
        uri:  result.assets[0].uri,
        type: 'image/jpeg',
        name: 'perfil.jpg',
      });
      await api.post(`/asociados/${datos?._id}/foto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await cargarDatos();
      show('success', 'Foto actualizada', 'Tu foto de perfil fue guardada.');
    } catch {
      show('error', 'Error', 'No se pudo subir la foto. Inténtalo de nuevo.');
    }
  };

  const styles = makeStyles(colors, typography);

  return (
    <SafeAreaView style={styles.safe}>
      <Toast {...toastProps} />
      <ConfirmModal
        visible={confirmLogout}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres salir?"
        confirmText="Salir"
        cancelText="Cancelar"
        danger
        onConfirm={() => { setConfirmLogout(false); logout(); }}
        onCancel={() => setConfirmLogout(false)}
      />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header / avatar */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleCambiarFoto} activeOpacity={0.8}>
            {datos?.foto ? (
              <Image source={{ uri: datos.foto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{iniciales}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <MaterialIcons name="photo-camera" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileNombre}>{nombre}</Text>
          <Text style={styles.profileCedula}>C.C. {cedula}</Text>
          <EstadoBadge estado={estado} />
        </View>

        {/* Mi cuenta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi cuenta</Text>
          <View style={styles.menuCard}>
            <MenuRow icon="edit" label="Editar perfil" sublabel="Nombre, teléfono, correo"
              onPress={() => navigation.navigate('EditarPerfil')} colors={colors} typography={typography} />
            <MenuRow icon="agriculture" label="Datos de la finca" sublabel="Hectáreas, ganado, producción"
              onPress={() => navigation.navigate('DatosFinca')} colors={colors} typography={typography} />
            <MenuRow icon="location-on" label="Ubicación de la finca" sublabel="Tomar coordenadas GPS"
              onPress={() => navigation.navigate('UbicacionFinca')} colors={colors} typography={typography} />
            <MenuRow icon="notifications" label="Notificaciones" sublabel="Historial de avisos"
              onPress={() => navigation.navigate('Notificaciones')} colors={colors} typography={typography} />
            <MenuRow icon="event" label="Eventos y Convocatorias" sublabel="Reuniones, comités, capacitaciones"
              onPress={() => navigation.navigate('Eventos')} colors={colors} typography={typography} />
            <MenuRow icon="folder" label="Mis documentos" sublabel="Vacunación, título, registro ICA"
              onPress={() => navigation.navigate('MisDocumentos')} colors={colors} typography={typography} />
          </View>
        </View>

        {/* Apariencia */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <View style={styles.menuCard}>
            <View style={styles.menuRow}>
              <View style={styles.menuIconBox}>
                <MaterialIcons
                  name={isDark ? 'dark-mode' : 'light-mode'}
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>Modo {isDark ? 'oscuro' : 'claro'}</Text>
                <Text style={styles.menuSub}>{isDark ? 'Activado' : 'Desactivado'}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.surfaceContainerHigh, true: colors.primaryContainer }}
                thumbColor={isDark ? colors.primary : colors.outline}
              />
            </View>
          </View>
        </View>

        {/* Soporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          <View style={styles.menuCard}>
            <MenuRow icon="phone" label={`Contactar a ${nombreAsociacion}`} sublabel={telefono}
              onPress={handleContactar} colors={colors} typography={typography} />
          </View>
        </View>

        {/* Cerrar sesión */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuRow icon="logout" label="Cerrar sesión"
              onPress={() => setConfirmLogout(true)} danger colors={colors} typography={typography} />
          </View>
        </View>

        <Text style={styles.version}>{nombreAsociacion} v1.0 · MetaDevelopment Ltd</Text>
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const MenuRow = ({ icon, label, sublabel, onPress, danger, colors, typography }) => {
  const styles = makeStyles(colors, typography);
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.menuIconBox, danger && styles.menuIconBoxDanger]}>
        <MaterialIcons
          name={icon}
          size={20}
          color={danger ? colors.error : colors.primary}
        />
      </View>
      <View style={styles.menuInfo}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {sublabel ? <Text style={styles.menuSub}>{sublabel}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
    </TouchableOpacity>
  );
};

const makeStyles = (colors, typography) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  profileHeader: {
    alignItems:        'center',
    paddingVertical:   spacing.xl,
    paddingHorizontal: spacing.lg,
    gap:               spacing.sm,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: spacing.sm },
  avatarFallback: {
    width:           80,
    height:          80,
    borderRadius:    40,
    backgroundColor: colors.primaryContainer,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    spacing.sm,
  },
  avatarInitials:  { ...typography.displayMd, color: colors.primary, fontSize: 28 },
  avatarEditBadge: {
    position:        'absolute',
    bottom:          spacing.sm,
    right:           -spacing.xs,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius:    radius.full,
    width:           26,
    height:          26,
    alignItems:      'center',
    justifyContent:  'center',
  },
  profileNombre: { ...typography.h2, textAlign: 'center' },
  profileCedula: { ...typography.body, marginBottom: spacing.xs },

  section:      { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { ...typography.label, marginBottom: spacing.sm },

  menuCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius:    radius.xl,
    overflow:        'hidden',
  },
  menuRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: spacing.md,
    paddingVertical:   spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
    gap:               spacing.md,
  },
  menuIconBox: {
    width:           36,
    height:          36,
    borderRadius:    radius.sm,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuIconBoxDanger: { backgroundColor: colors.errorContainer + '44' },
  menuInfo:          { flex: 1 },
  menuLabel:         { ...typography.bodyBold },
  menuLabelDanger:   { color: colors.error },
  menuSub:           { ...typography.small, marginTop: 2 },

  version: {
    ...typography.label,
    textAlign:    'center',
    marginTop:    spacing.md,
    color:        colors.outline,
    marginBottom: spacing.lg,
  },
});

export default PerfilScreen;
