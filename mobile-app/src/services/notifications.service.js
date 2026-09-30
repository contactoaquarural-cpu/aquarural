import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api.service';

// El backend envía push con firebase-admin (sendEachForMulticast), que
// requiere el token NATIVO de FCM (getDevicePushTokenAsync), no el
// "ExponentPushToken[...]" de getExpoPushTokenAsync — ese último solo
// sirve si se envía a través del servicio push de Expo, que no es lo que
// usa este backend.
export const registrarTokenNotificaciones = async (asociadoId) => {
  if (!Device.isDevice) return; // emuladores no tienen push real

  const { status: existente } = await Notifications.getPermissionsAsync();
  let status = existente;
  if (status !== 'granted') {
    const solicitado = await Notifications.requestPermissionsAsync();
    status = solicitado.status;
  }
  if (status !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#1D4ED8',
    });
  }

  try {
    const { data: tokenFCM } = await Notifications.getDevicePushTokenAsync();
    await api.patch(`/asociados/${asociadoId}/token-fcm`, { tokenFCM });
  } catch (e) {
    // No debe bloquear el login si falla el registro del token — el
    // suscriptor simplemente no recibirá push hasta el próximo intento.
  }
};
