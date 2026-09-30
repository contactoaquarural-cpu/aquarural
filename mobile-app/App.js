import { useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useFonts, Outfit_800ExtraBold, Outfit_700Bold, Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import RootNavigator from './src/navigation';

SplashScreen.preventAutoHideAsync();

// Muestra el banner/sonido incluso con la app abierta en primer plano — sin
// esto, una push que llega mientras el suscriptor está usando la app queda
// silenciada por completo (comportamiento por defecto de expo-notifications).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Outfit_800ExtraBold,
    Outfit_700Bold,
    Outfit_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) return null;

  return (
    <>
      <RootNavigator />
      <StatusBar style="dark" />
    </>
  );
}
