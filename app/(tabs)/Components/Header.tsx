// components/Header.tsx
import React from 'react';
import { View, Text, Switch, Image, Button } from 'react-native';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  user: { name?: string; picture?: string };
  logout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme, user, logout }) => (
  <View style={{
    width: '100%', height: 64, backgroundColor: isDark ? '#161c24' : '#1aa5ff',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, marginBottom: 8, elevation: 4, gap: 8,
  }}>
    <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>NovaCitas</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Switch value={isDark} onValueChange={toggleTheme} />
      <Text style={{ color: '#fff', fontWeight: '500', marginRight: 8 }}>{user?.name}</Text>
      {user?.picture && <Image source={{ uri: user.picture }} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee' }} />}
      <Button title="Salir" onPress={logout} color={isDark ? '#e57373' : '#f44336'} />
    </View>
  </View>
);
export default Header;

