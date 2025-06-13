// Components/useCalendarLogic.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native'; // ← importante

import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCitas } from '@/lib/api';
import { GoogleEvent, Cita, EventoCalendario } from '../types/calendar';

const CALENDAR_ID = "primary";
const BACKEND_URL = "https://mbrn706o5j.execute-api.us-east-1.amazonaws.com/Prod/NovaCalendario-CreateAppointment";

export function useCalendarLogic(email: string | undefined) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDate, setModalDate] = useState<string>('');
  const [modalEvents, setModalEvents] = useState<EventoCalendario[]>([]);

  const refreshCitas = useCallback(async () => {
    if (!email) return;
    setLoadingCitas(true);
    try {
      const data = await fetchCitas(email);
      setCitas(data);
    } finally {
      setLoadingCitas(false);
    }
  }, [email]);

  const refreshEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const primerDia = new Date(month.year, month.month - 1, 1);
      const ultimoDia = new Date(month.year, month.month, 0, 23, 59, 59);

      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${primerDia.toISOString()}&timeMax=${ultimoDia.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=50`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(data.items || []);
    } finally {
      setLoadingEvents(false);
    }
  }, [month]);

  useEffect(() => {
    if (!email) return;
    const cargarCitas = async () => {
      setLoadingCitas(true);
      try {
        const data: Cita[] = await fetchCitas(email);
        setCitas(data);
      } catch (err) {
        console.error('Error al obtener citas:', err);
      } finally {
        setLoadingCitas(false);
      }
    };
    cargarCitas();
  }, [email]);

  const fetchEvents = useCallback(async (year: number, monthNum: number) => {
    setLoadingEvents(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) return;

      const primerDia = new Date(year, monthNum - 1, 1);
      const ultimoDia = new Date(year, monthNum, 0, 23, 59, 59);

      const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${primerDia.toISOString()}&timeMax=${ultimoDia.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=50`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(data.items || []);
    } catch (err) {
      console.error('Error al obtener eventos de Google Calendar:', err);
    } finally {
      setLoadingEvents(false);
    }
  }, []);
const borrarCita = async (item: GoogleEvent | Cita) => {
  const token = await AsyncStorage.getItem('accessToken');
  let citaLocal: Cita | undefined;
  let googleEventId: string | undefined;
  let calendarId: string = CALENDAR_ID;

  // GoogleEvent
  if ('id' in item) {
    googleEventId = item.id;
    citaLocal = citas.find(c => c.googleEventId === item.id);
    // Protegido: usa calendarId si existe, si no primary
    calendarId = (item as any).calendarId || CALENDAR_ID;
  }

  // Cita local
  if ('appointmentId' in item) {
    citaLocal = item;
    googleEventId = item.googleEventId;
    calendarId = (item as any).calendarId || CALENDAR_ID;
  }

  // Borra en Google Calendar (si existe)
  let googleOk = true;
  if (googleEventId && token) {
    const encCalId = encodeURIComponent(calendarId);
    const encEventId = encodeURIComponent(googleEventId);
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encCalId}/events/${encEventId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok && res.status !== 404) {
      googleOk = false;
      Alert.alert('No se pudo eliminar del Google Calendar');
    }
  }

  // Borra en tu backend
  let backendOk = true;
  if (citaLocal?.appointmentId && email) {
    const res = await fetch(BACKEND_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId: citaLocal.appointmentId,
        doctorId: email,
      }),
    });
    if (!res.ok) {
      backendOk = false;
      Alert.alert('No se pudo eliminar del sistema');
    }
  }

  // Refresca siempre
  setEvents(prev => googleEventId ? prev.filter(ev => ev.id !== googleEventId) : prev);
  setCitas(prev => citaLocal?.appointmentId ? prev.filter(c => c.appointmentId !== citaLocal!.appointmentId) : prev);

  await Promise.all([refreshEvents(), refreshCitas()]);

  if (googleOk && backendOk) {
    Alert.alert('Cita eliminada correctamente');
  }
};



  useEffect(() => {
    fetchEvents(month.year, month.month);
  }, [month, fetchEvents]);

  const markedDates = useMemo(() => {
    const marks: { [date: string]: any } = {};

    events.forEach(ev => {
      const date =
        (ev.start?.dateTime?.slice(0, 10) || ev.start?.date);
      if (date)
        marks[date] = {
          marked: true,
          dotColor: '#1aa5ff',
          ...(selectedDate === date && {
            selected: true,
            selectedColor: '#1aa5ff',
            selectedTextColor: '#fff'
          })
        };
    });

    citas.forEach(cita => {
      const date = cita.date.slice(0, 10);
      if (date) {
        if (marks[date]) {
          marks[date] = {
            ...marks[date],
            dotColor: '#ffb300',
          };
        } else {
          marks[date] = {
            marked: true,
            dotColor: '#ffb300',
            ...(selectedDate === date && {
              selected: true,
              selectedColor: '#1aa5ff',
              selectedTextColor: '#fff'
            })
          };
        }
      }
    });

    if (selectedDate && !marks[selectedDate]) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: '#1aa5ff',
        selectedTextColor: '#fff'
      };
    }

    return marks;
  }, [events, citas, selectedDate]);

  return {
    citas, loadingCitas, events, loadingEvents, selectedDate, setSelectedDate,
    month, setMonth, modalVisible, setModalVisible, modalDate, setModalDate,
    modalEvents, setModalEvents, refreshCitas, refreshEvents, borrarCita, markedDates
  };
}
