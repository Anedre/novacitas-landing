import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { UserProvider } from '@/contexts/UserContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';

import { ThemeProviderCustom, useThemeCustom } from '@/contexts/ThemeContext';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { theme } = useThemeCustom();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
      const inAuthGroup = (segments[0] as string) === '(auth)';

      // Si NO hay token y NO estás en /auth, manda a splash
      if (!token && !inAuthGroup) {
        requestAnimationFrame(() => {
          router.replace('/(auth)/splash' as any);
        });
      }

      // Si hay token y estás en /auth, manda al root (tabs)
      if (token && inAuthGroup) {
        requestAnimationFrame(() => {
          router.replace('/');
        });
      }

      setIsReady(true);
    };

    checkAuth();
  }, [segments]);

  if (!loaded || !isReady || isLoggedIn === null) return null;

  return (

    <UserProvider>
      <ThemeProviderCustom>
        <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
          <Slot />
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </NavigationThemeProvider>
      </ThemeProviderCustom>
    </UserProvider>

  );
  
}
