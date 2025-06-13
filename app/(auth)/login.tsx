import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useGoogleLogin } from '../../hooks/useGoogleLogin';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';

export default function LoginScreen() {
  const { promptAsync, request } = useGoogleLogin();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.name) {
      router.replace('/');
    }
  }, [user]);

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#f7f8fd',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    }}>
      <Text style={{
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1453c7',
        marginBottom: 10,
        letterSpacing: 1
      }}>
        Bienvenido a NovaCitas
      </Text>
      <Text style={{ fontSize: 15, color: '#355', marginBottom: 40, textAlign: 'center', opacity: 0.78 }}>
        Accede con tu cuenta Google para ver y organizar tus citas.
      </Text>
      <TouchableOpacity
        onPress={() => promptAsync()}
        activeOpacity={0.85}
        disabled={!request}
        style={{
          backgroundColor: '#fff',
          borderRadius: 50,
          paddingVertical: 12,
          paddingHorizontal: 30,
          flexDirection: 'row',
          alignItems: 'center',
          elevation: 2,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
        }}>
        <Image
          source={require('../../assets/images/google.png')} 
          style={{ width: 28, height: 28, marginRight: 12, borderRadius: 14 }}
        />
        <Text style={{ fontSize: 17, color: '#222', fontWeight: 'bold', letterSpacing: 0.5 }}>
          Iniciar sesión con Google
        </Text>
      </TouchableOpacity>
    </View>
  );
}
