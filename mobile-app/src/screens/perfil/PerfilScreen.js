import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth.store';
import { colors, radii, fonts } from '../../theme/tokens';

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcono}>
      <MaterialIcons name={icon} size={18} color={colors.azulMarca} />
    </View>
    <View style={styles.infoTexto}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValor}>{value || 'No registrado'}</Text>
    </View>
  </View>
);

const InfoRowEditable = ({ icon, label, value, onChangeText, keyboardType }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcono}>
      <MaterialIcons name={icon} size={18} color={colors.azulMarca} />
    </View>
    <View style={styles.infoTexto}>
      <Text style={styles.infoLabel}>{label}</Text>
      <TextInput
        style={styles.infoInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={`Ingresa tu ${label.toLowerCase()}`}
        placeholderTextColor={colors.textoTenue}
      />
    </View>
  </View>
);

const PerfilScreen = () => {
  const { user, logout, actualizarPerfil } = useAuthStore();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');
  const [form, setForm] = useState({
    telefono: user?.telefono || '',
    correo: user?.correo || '',
    direccion: user?.direccion || '',
  });

  const confirmarCerrarSesion = () => {
    setMostrarConfirmacion(false);
    logout();
  };

  const iniciarEdicion = () => {
    setForm({ telefono: user?.telefono || '', correo: user?.correo || '', direccion: user?.direccion || '' });
    setErrorGuardar('');
    setEditando(true);
  };

  const guardarCambios = async () => {
    setErrorGuardar('');
    setGuardando(true);
    try {
      await actualizarPerfil(form);
      setEditando(false);
    } catch (e) {
      setErrorGuardar(e.response?.data?.message || 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{user?.nombres?.charAt(0)?.toUpperCase() || 'S'}</Text>
        </View>
        <Text style={styles.nombre}>
          {user?.nombres} {user?.apellidos}
        </Text>
        <Text style={styles.matricula}>Matrícula {user?.matricula}</Text>
      </View>

      <View style={styles.seccion}>
        <View style={styles.seccionEncabezado}>
          <Text style={styles.seccionTitulo}>Información personal</Text>
          {!editando && (
            <TouchableOpacity onPress={iniciarEdicion} activeOpacity={0.7} style={styles.botonEditar}>
              <MaterialIcons name="edit" size={14} color={colors.azulMarca} />
              <Text style={styles.botonEditarTexto}>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tarjeta}>
          <InfoRow icon="badge" label="Cédula" value={user?.cedula} />
          {editando ? (
            <>
              <InfoRowEditable
                icon="call"
                label="Teléfono"
                value={form.telefono}
                keyboardType="phone-pad"
                onChangeText={(v) => setForm((f) => ({ ...f, telefono: v }))}
              />
              <InfoRowEditable
                icon="alternate-email"
                label="Correo"
                value={form.correo}
                keyboardType="email-address"
                onChangeText={(v) => setForm((f) => ({ ...f, correo: v }))}
              />
              <InfoRowEditable
                icon="home"
                label="Dirección"
                value={form.direccion}
                onChangeText={(v) => setForm((f) => ({ ...f, direccion: v }))}
              />
            </>
          ) : (
            <>
              <InfoRow icon="call" label="Teléfono" value={user?.telefono} />
              <InfoRow icon="alternate-email" label="Correo" value={user?.correo} />
              <InfoRow icon="home" label="Dirección" value={user?.direccion} />
            </>
          )}
          <InfoRow icon="location-on" label="Vereda / Sector" value={user?.vereda} />
        </View>

        {editando && (
          <>
            {errorGuardar ? (
              <View style={styles.bannerError}>
                <MaterialIcons name="error-outline" size={16} color={colors.rojo} />
                <Text style={styles.bannerErrorTexto}>{errorGuardar}</Text>
              </View>
            ) : null}
            <View style={styles.edicionBotones}>
              <TouchableOpacity
                style={styles.botonCancelarEdicion}
                activeOpacity={0.7}
                onPress={() => setEditando(false)}
                disabled={guardando}
              >
                <Text style={styles.botonCancelarEdicionTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botonGuardarEdicion}
                activeOpacity={0.85}
                onPress={guardarCambios}
                disabled={guardando}
              >
                {guardando ? (
                  <ActivityIndicator size="small" color={colors.blanco} />
                ) : (
                  <Text style={styles.botonGuardarEdicionTexto}>Guardar cambios</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.botonSalir}
        onPress={() => setMostrarConfirmacion(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="logout" size={18} color={colors.rojo} />
        <Text style={styles.botonSalirTexto}>Cerrar sesión</Text>
      </TouchableOpacity>

      <Modal visible={mostrarConfirmacion} transparent animationType="fade" onRequestClose={() => setMostrarConfirmacion(false)}>
        <View style={styles.modalFondo}>
          <View style={styles.modalTarjeta}>
            <View style={styles.modalIcono}>
              <MaterialIcons name="logout" size={26} color={colors.rojo} />
            </View>
            <Text style={styles.modalTitulo}>Cerrar sesión</Text>
            <Text style={styles.modalTexto}>¿Seguro que quieres cerrar tu sesión en AquaRural?</Text>

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={styles.modalBotonCancelar}
                activeOpacity={0.7}
                onPress={() => setMostrarConfirmacion(false)}
              >
                <Text style={styles.modalBotonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBotonConfirmar} activeOpacity={0.85} onPress={confirmarCerrarSesion}>
                <Text style={styles.modalBotonConfirmarTexto}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.superficieSutil },
  contenido: { paddingBottom: 110 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 28, paddingHorizontal: 20 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radii.full,
    backgroundColor: colors.azulMarca,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarTexto: { fontFamily: fonts.headlineExtraBold, fontSize: 28, color: colors.blanco },
  nombre: { fontFamily: fonts.headlineBold, fontSize: 18, color: colors.textoPrincipal, textAlign: 'center' },
  matricula: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textoSecundario, marginTop: 4 },
  seccion: { paddingHorizontal: 20, marginBottom: 24 },
  seccionEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seccionTitulo: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: colors.textoPrincipal,
  },
  botonEditar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  botonEditarTexto: { fontFamily: fonts.headlineSemiBold, fontSize: 12, color: colors.azulMarca },
  tarjeta: {
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radii['2xl'],
    padding: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  infoIcono: {
    width: 34,
    height: 34,
    borderRadius: radii.xl,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTexto: { flex: 1 },
  infoLabel: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.textoTenue },
  infoValor: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textoPrincipal, marginTop: 1 },
  infoInput: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textoPrincipal,
    borderBottomWidth: 1,
    borderBottomColor: colors.azulMarca,
    paddingVertical: 2,
    marginTop: 1,
  },
  edicionBotones: { flexDirection: 'row', gap: 10, marginTop: 12 },
  botonCancelarEdicion: {
    flex: 1,
    backgroundColor: colors.blanco,
    borderWidth: 1,
    borderColor: colors.borde,
    borderRadius: radii['2xl'],
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonCancelarEdicionTexto: { fontFamily: fonts.headlineSemiBold, fontSize: 13, color: colors.textoPrincipal },
  botonGuardarEdicion: {
    flex: 1,
    backgroundColor: colors.azulMarca,
    borderRadius: radii['2xl'],
    paddingVertical: 12,
    alignItems: 'center',
  },
  botonGuardarEdicionTexto: { fontFamily: fonts.headlineSemiBold, fontSize: 13, color: colors.blanco },
  bannerError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.rojoBg,
    borderWidth: 1,
    borderColor: colors.rojoBorde,
    borderRadius: radii.xl,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  bannerErrorTexto: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.rojo, flex: 1 },
  botonSalir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.rojoBorde,
    borderRadius: radii['2xl'],
    paddingVertical: 14,
  },
  botonSalirTexto: { fontFamily: fonts.headlineSemiBold, fontSize: 14, color: colors.rojo },

  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalTarjeta: {
    width: '100%',
    backgroundColor: colors.blanco,
    borderRadius: radii['3xl'],
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  modalIcono: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.rojoBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitulo: { fontFamily: fonts.headlineBold, fontSize: 17, color: colors.textoPrincipal },
  modalTexto: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textoSecundario,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  modalBotones: { flexDirection: 'row', gap: 10, width: '100%' },
  modalBotonCancelar: {
    flex: 1,
    backgroundColor: colors.superficieSutil,
    borderRadius: radii['2xl'],
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalBotonCancelarTexto: { fontFamily: fonts.headlineSemiBold, fontSize: 14, color: colors.textoPrincipal },
  modalBotonConfirmar: {
    flex: 1,
    backgroundColor: colors.rojo,
    borderRadius: radii['2xl'],
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalBotonConfirmarTexto: { fontFamily: fonts.headlineSemiBold, fontSize: 14, color: colors.blanco },
});

export default PerfilScreen;
