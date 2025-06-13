import React from 'react';
import { View, ActivityIndicator, Modal, Platform, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeCustom } from '@/contexts/ThemeContext';
import { useLogout } from '../../hooks/useLogout';
import { useUser } from '../../contexts/UserContext';
import { useFocusEffect } from '@react-navigation/native';

import Header from './Components/Header';
import CalendarMonth from './Components/CalendarMonth';
import DayActions from './Components/DayActions';
import { useCalendarLogic } from './Components/useCalendarLogic';

export default function HomeScreen() {
  const { theme, toggleTheme } = useThemeCustom();
  const isDark = theme === 'dark';
  const { logout } = useLogout();
  const { user } = useUser();
  const email = user?.email;
  const router = useRouter();

  // Hook modularizado
  const {
    citas, loadingCitas, events, loadingEvents, selectedDate, setSelectedDate,
    month, setMonth, modalVisible, setModalVisible, modalDate, setModalDate,
    borrarCita, markedDates, refreshCitas, refreshEvents
  } = useCalendarLogic(email);

  useFocusEffect(
    React.useCallback(() => {
      refreshCitas();
      refreshEvents();
    }, [refreshCitas, refreshEvents])
  );

  const isWeb = Platform.OS === 'web';

  // 🔥 Nuevo: Calcula los eventos del día en cada render
  const eventosDelDia = React.useMemo(() => {
    if (!modalDate) return [];
    return [
      ...events.filter(ev =>
        (ev.start?.dateTime?.slice(0,10) || ev.start?.date) === modalDate
      ),
      ...citas.filter(cita =>
        cita.date.slice(0,10) === modalDate
      )
    ];
  }, [modalDate, events, citas]);

  if (!email) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1aa5ff" />
        <Text>Cargando usuario...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#181818' : '#f3f3f3' }}>
      <Header
        isDark={isDark}
        toggleTheme={toggleTheme}
        user={user}
        logout={logout}
      />
      <View style={{ flex: 1, flexDirection: isWeb ? 'row' : 'column' }}>
        <View style={{ flex: 2, padding: 16 }}>
          <CalendarMonth
            isDark={isDark}
            markedDates={markedDates}
            onDayPress={day => {
              setSelectedDate(day.dateString);
              setModalDate(day.dateString);
              setModalVisible(true);
            }}
            onMonthChange={m => {
              setMonth({ year: m.year, month: m.month });
              setSelectedDate('');
            }}
          />
        </View>
        {isWeb ? (
          <View style={{
            flex: 1, backgroundColor: isDark ? '#23262d' : '#fff',
            borderLeftWidth: 1, borderLeftColor: '#e0e0e0',
            minWidth: 300, maxWidth: 420, padding: 20,
            alignItems: 'center', boxShadow: '0 0 12px #0002'
          }}>
            {modalVisible && (
              <DayActions
                isDark={isDark}
                modalDate={modalDate}
                modalEvents={eventosDelDia} 
                onEdit={item => {
                  setModalVisible(false);
                  if ('appointmentId' in item) {
                    router.push({ pathname: '/update', params: { id: item.appointmentId } });
                  } else {
                    router.push({ pathname: '/update', params: { id: item.id } });
                  }
                }}
                onDelete={async item => {
                  await borrarCita(item);
                  await refreshCitas();
                  await refreshEvents();
                  Alert.alert('Cita eliminada');
                }}
                onAdd={(hour: number) => {
                  setModalVisible(false);
                  const iso = `${modalDate}T${String(hour).padStart(2,'0')}:00:00`;
                  router.push({ pathname: '/create', params: { date: iso } });
                }}
                onClose={() => setModalVisible(false)}
              />
            )}
            {!modalVisible && (
              <View style={{ marginTop: 24 }}>
                <ActivityIndicator size="small" color="#1aa5ff" animating={loadingCitas || loadingEvents} />
              </View>
            )}
          </View>
        ) : (
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: '#000a', justifyContent: 'center', alignItems: 'center' }}>
              <DayActions
                isDark={isDark}
                modalDate={modalDate}
                modalEvents={eventosDelDia} 
                onEdit={item => {
                  setModalVisible(false);
                  if ('appointmentId' in item) {
                    router.push({ pathname: '/update', params: { id: item.appointmentId } });
                  } else {
                    router.push({ pathname: '/update', params: { id: item.id } });
                  }
                }}
                onDelete={async item => {
                  await borrarCita(item);
                  await refreshCitas();
                  await refreshEvents();
                  Alert.alert('Cita eliminada');
                }}
                onAdd={(hour: number) => {
                  setModalVisible(false);
                  const iso = `${modalDate}T${String(hour).padStart(2,'0')}:00:00`;
                  router.push({ pathname: '/create', params: { date: iso } });
                }}
                onClose={() => setModalVisible(false)}
              />
            </View>
          </Modal>
        )}
      </View>
    </View>
  );
}
