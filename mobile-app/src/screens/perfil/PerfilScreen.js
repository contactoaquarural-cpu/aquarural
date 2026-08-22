import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { useTheme } from '../../utils/ThemeContext';
import { spacing } from '../../utils/theme';
import { useConfigStore } from '../../store/config.store';

const PerfilScreen = ({ navigation }) => {
  const { isDark, toggleTheme, colors } = useTheme();
  const { user, logout } = useAuthStore();
  const nombreAcueducto = useConfigStore((s) => s.nombreAcueducto || 'Acueducto Veredal La Argentina');
  const telefonoContacto = useConfigStore((s) => s.telefonoContacto || '3166160377');

  const nombre = user?.nombres || user?.nombre || 'José Donaldo Gómez Murcia';
  const cedula = user?.cedula || '1075234891';
  const matricula = user?.matricula || 'ACU-0101';

  const abrirWhatsAppTesorero = () => {
    const num = telefonoContacto.replace(/\D/g, '');
    const msg = encodeURIComponent(`Hola, soy ${nombre} (Matrícula ${matricula}) y necesito ayuda con mi cuenta de agua en ${nombreAcueducto}.`);
    Linking.openURL(`https://wa.me/57${num}?text=${msg}`);
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Card Header */}
        <View style={[styles.userCard, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{nombre.charAt(0).toUpperCase()}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.userName, { color: colors.onSurface }]}>{nombre}</Text>
            <Text style={[styles.userSub, { color: colors.onSurfaceVariant }]}>C.C. {cedula} • Matrícula: <Text style={{ color: '#06b6d4', fontWeight: '800' }}>{matricula}</Text></Text>
            <Text style={styles.userAcueducto}>{nombreAcueducto}</Text>
          </View>
        </View>

        {/* Botón Destacado Soporte WhatsApp Tesorero */}
        <TouchableOpacity onPress={abrirWhatsAppTesorero} style={styles.btnWhatsApp}>
          <MaterialIcons name="chat" size={24} color="#ffffff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.btnWpTitle}>Contactar al Tesorero por WhatsApp</Text>
            <Text style={styles.btnWpSub}>Atención directa de la Junta Veredal</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#ffffff" />
        </TouchableOpacity>

        {/* Menú de Opciones */}
        <View style={[styles.menuContainer, { backgroundColor: colors.surface, borderColor: colors.outline }]}>
          {/* Conmutador de Tema Claro / Oscuro */}
          <View style={styles.menuItem}>
            <MaterialIcons name={isDark ? "wb-sunny" : "brightness-3"} size={22} color={isDark ? "#f59e0b" : "#0284c7"} />
            <Text style={[styles.menuText, { color: colors.onSurface, flex: 1 }]}>
              {isDark ? 'Modo Oscuro Activo' : 'Modo Claro Activo'}
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#cbd5e1', true: '#0ea5e9' }}
              thumbColor={isDark ? '#0284c7' : '#f8fafc'}
            />
          </View>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            onPress={() => navigation.navigate('UbicacionFinca')}
            style={styles.menuItem}
          >
            <MaterialIcons name="location-on" size={22} color="#10b981" />
            <Text style={[styles.menuText, { color: colors.onSurface }]}>Ubicación GPS de mi Vivienda</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            onPress={() => navigation.navigate('HistorialPagos')}
            style={styles.menuItem}
          >
            <MaterialIcons name="receipt-long" size={22} color="#06b6d4" />
            <Text style={[styles.menuText, { color: colors.onSurface }]}>Historial de Recibos & Facturas</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            onPress={() => navigation.navigate('Notificaciones')}
            style={styles.menuItem}
          >
            <MaterialIcons name="notifications" size={22} color="#f59e0b" />
            <Text style={[styles.menuText, { color: colors.onSurface }]}>Avisos y Noticias de la Junta</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Cerrar Sesión */}
        <TouchableOpacity onPress={handleLogout} style={styles.btnLogout}>
          <MaterialIcons name="logout" size={20} color="#ef4444" />
          <Text style={styles.btnLogoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, gap: spacing.md },
  userCard: { padding: spacing.md, borderRadius: 24, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#06b6d4', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  userName: { fontSize: 16, fontWeight: '800', color: '#ffffff' },
  userSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  userAcueducto: { fontSize: 11, color: '#38bdf8', marginTop: 2, fontWeight: '600' },
  btnWhatsApp: { padding: spacing.md, borderRadius: 20, backgroundColor: '#25d366', flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnWpTitle: { fontSize: 14, fontWeight: '800', color: '#ffffff' },
  btnWpSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  menuContainer: { borderRadius: 24, borderWidth: 1, padding: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  menuText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#f8fafc' },
  menuDivider: { height: 1, backgroundColor: '#1e293b', marginHorizontal: 14 },
  btnLogout: { flexDirection: 'row', height: 48, borderRadius: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnLogoutText: { fontSize: 14, fontWeight: '700', color: '#ef4444' },
});

export default PerfilScreen;
