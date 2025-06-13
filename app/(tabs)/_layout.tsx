import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeCustom } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';



export default function TabLayout() {
  const { theme } = useThemeCustom();
  const isDark = theme === 'dark';
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#fff' : '#555', // 👈 Forzamos gris oscuro en modo claro
        tabBarInactiveTintColor: isDark ? '#888' : '#999',
        tabBarStyle: {
          backgroundColor: isDark ? '#111' : '#f4f4f4',
          borderTopColor: isDark ? '#333' : '#ccc',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Futuro',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="play" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen name="create" options={{ href: null }} />
      <Tabs.Screen name="update" options={{ href: null }} />
      <Tabs.Screen name="reminders" options={{ href: null }} />

    </Tabs>
  );
}
