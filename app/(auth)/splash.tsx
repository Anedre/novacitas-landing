import { useEffect, useRef } from 'react';
import { View, Image, Animated, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      router.replace('/(auth)/login' as any);
    }, 2100);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#1453c7',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Animated.View style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
        alignItems: 'center'
      }}>
        {/* Sombra envolviendo el logo */}
        <View style={{
          borderRadius: 32,
          marginBottom: 18,
          backgroundColor: '#fff',
          borderWidth: 4,
          borderColor: '#fff',
          // Sombra multiplataforma SOLO en View
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 5 },
        }}>
          <Image
            source={require('../../assets/images/logonovacitas.png')}
            style={{ width: 120, height: 120, borderRadius: 32 }}
            resizeMode="contain"
          />
        </View>
        <Text style={{
          color: '#fff',
          fontWeight: 'bold',
          fontSize: 28,
          letterSpacing: 1,
          textShadowColor: '#0009',
          textShadowRadius: 5
        }}>
          NovaCitas
        </Text>
      </Animated.View>
    </View>
  );
}
