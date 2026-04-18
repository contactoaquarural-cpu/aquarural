import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api.service';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Solicita permisos y registra el token FCM en el backend
export const inicializarNotificaciones = async (asociadoId) => {
  try {
    if (!Device.isDevice) return;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    if (token && asociadoId) {
      await api.patch(`/asociados/${asociadoId}/fcm-token`, { fcmToken: token });
    }

    return token;
  } catch (error) {
    console.warn('Error al inicializar notificaciones:', error.message);
  }
};

// Escucha notificaciones cuando la app está en primer plano
export const escucharNotificaciones = (onNotificacion) => {
  return Notifications.addNotificationReceivedListener((notification) => {
    if (onNotificacion) onNotificacion(notification);
  });
};
