import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../contexts/UserContext';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleLogin() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { user, setUser } = useUser();

  const [request, response, promptAsync] = Google.useAuthRequest({
    // Solo uno por plataforma
    androidClientId: '492940404528-3v8gmgi0qah3ntqons2nh3ic0l9acr6u.apps.googleusercontent.com',
    iosClientId: 'TU_IOS_CLIENT_ID.apps.googleusercontent.com', // si tienes
    clientId: Platform.OS === 'web' ? '492940404528-3ikiksb6qj2j7fdnrfgo71sce7g5k9kb.apps.googleusercontent.com' : undefined,
    scopes: [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar',
    ],    // No pongas redirectUri, Expo/EAS lo resuelve automáticamente
  });


   useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const userStr = await AsyncStorage.getItem('googleUser');
      if (token) setAccessToken(token);
      if (userStr) setUser(JSON.parse(userStr));
    })();
  }, []);

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      const token = response.authentication.accessToken;
      setAccessToken(token);
      AsyncStorage.setItem('accessToken', token);
      fetchGoogleUser(token);
    }
  }, [response]);

  const fetchGoogleUser = async (token: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const userObj = { name: data.name, picture: data.picture, email: data.email };
      setUser(userObj);
      await AsyncStorage.setItem('googleUser', JSON.stringify(userObj));
    } catch (e) {
      console.error('Error obteniendo perfil Google', e);
    }
  };

  const clearProfile = async () => {
    setAccessToken(null);
    setUser(null);
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('googleUser');
  };

  return { request, promptAsync, user, clearProfile };
}