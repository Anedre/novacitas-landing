import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../contexts/UserContext';


export function useLogout() {
  const router = useRouter();
    const { clearUser } = useUser();

  const logout = async () => {
    await clearUser();
    await AsyncStorage.removeItem('accessToken'); // Por si acaso
    router.replace('/(auth)/splash');
  };


  return { logout };
}
