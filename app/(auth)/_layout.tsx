import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="splash">
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
