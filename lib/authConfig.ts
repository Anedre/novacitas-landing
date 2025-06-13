import Constants from 'expo-constants';

export const googleAuthConfig = {
  clientId: '492940404528-3iikksb6qj2j7fdnfrgo71sce7g5k9kb.apps.googleusercontent.com', // tu client ID
  redirectUri: 'https://auth.expo.io/@huzhan/nova-calendario',
  scopes: [
    'openid',
    'profile',
    'email',
    'https://www.googleapis.com/auth/calendar.readonly'
  ],
  responseType: 'token',
};
