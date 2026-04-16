import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api.service';
import { useAuthStore }     from '../../store/auth.store';
import { useAsociadoStore } from '../../store/asociado.store';
import EstadoBadge from '../../components/EstadoBadge';
import { colors, spacing, radius, typography } from '../../utils/theme';

const MenuRow = ({ icon, label, sublabel, onPress, danger }) => (
  <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.menuIconBox, danger && styles.menuIconBoxDanger]}>
      <Text style={styles.menuIcon}>{icon}</Text>
    </View>
    <View style={styles.menuInfo}>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      {sublabel ? <Text style={styles.menuSub}>{sublabel}</Text> : null}
    </View>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

const PerfilScreen = () => {
  const navigation = useNavigation();
  const logout     = useAuthStore((s) => s.logout);
  const user       = useAuthStore((s) => s.user);
  const { asociado, cargarDatos } = useAsociadoStore();

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
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto.');
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
      Alert.alert('✅ Foto actualizada', 'Tu foto de perfil fue guardada.');
    } catch {
      Alert.alert('Error', 'No se pudo subir la foto. Inténtalo de nuevo.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
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
              <Text style={styles.avatarEditIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileNombre}>{nombre}</Text>
          <Text style={styles.profileCedula}>C.C. {cedula}</Text>
          <EstadoBadge estado={estado} />
        </View>

        {/* Acciones de perfil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi cuenta</Text>
          <View style={styles.menuCard}>
            <MenuRow
              icon="✏️"
              label="Editar perfil"
              sublabel="Nombre, teléfono, correo"
              onPress={() => navigation.navigate('EditarPerfil')}
            />
            <MenuRow
              icon="🌾"
              label="Datos de la finca"
              sublabel="Hectáreas, ganado, producción"
              onPress={() => navigation.navigate('DatosFinca')}
            />
            <MenuRow
              icon="🔔"
              label="Notificaciones"
              sublabel="Historial de avisos"
              onPress={() => navigation.navigate('Notificaciones')}
            />
          </View>
        </View>

        {/* Soporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          <View style={styles.menuCard}>
            <MenuRow
              icon="📞"
              label="Contactar a ASOGACENTRO"
              sublabel="316 616 0377"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Cerrar sesión */}
        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuRow
              icon="🚪"
              label="Cerrar sesión"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        {/* Versión */}
        <Text style={styles.version}>ASOGACENTRO v1.0 · MetaDevelopment Ltd</Text>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  profileHeader: {
    alignItems:       'center',
    paddingVertical:  spacing.xl,
    paddingHorizontal: spacing.lg,
    gap:              spacing.sm,
  },
  avatar: {
    width:        80,
    height:       80,
    borderRadius: 40,
    marginBottom: spacing.sm,
  },
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
  avatarEditIcon:  { fontSize: 14 },
  profileNombre:   { ...typography.h2, textAlign: 'center' },
  profileCedula:   { ...typography.body, marginBottom: spacing.xs },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
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
  menuIcon:          { fontSize: 18 },
  menuInfo:          { flex: 1 },
  menuLabel:         { ...typography.bodyBold },
  menuLabelDanger:   { color: colors.error },
  menuSub:           { ...typography.small, marginTop: 2 },
  menuArrow:         { ...typography.h2, color: colors.outline },

  version: {
    ...typography.label,
    textAlign: 'center',
    marginTop: spacing.md,
    color:     colors.outline,
    marginBottom: spacing.lg,
  },
});

export default PerfilScreen;
