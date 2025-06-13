import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  name?: string;
  picture?: string;
  email?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  loadUser: () => Promise<void>;
  clearUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loadUser: async () => {},
  clearUser: async () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Cargar usuario desde AsyncStorage al iniciar la app
  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('googleUser');
    if (userStr) setUser(JSON.parse(userStr));
    else setUser(null);
  };

  // Limpiar usuario (logout)
  const clearUser = async () => {
    await AsyncStorage.removeItem('googleUser');
    setUser(null);
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}
