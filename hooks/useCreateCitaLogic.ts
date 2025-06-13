import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { crearCita, fetchCitas } from '@/lib/api';
import { Cita } from '../app/(tabs)/types/calendar';



export function useCreateCitaLogic(email: string | undefined, router: any, initialDate?: Date) {

  const prevInitialDate = useRef<number | null>(null);



  // --- ESTADOS DEL FORMULARIO ---
  const [date, setDate] = useState<Date>(initialDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [notes, setNotes] = useState('');
    // --- NUEVOS ESTADOS ---
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(10);

  // --- ESTADOS DE CALENDARIOS ---
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState('primary');
  const [showNewCalModal, setShowNewCalModal] = useState(false);
  const [newCalName, setNewCalName] = useState('');
  const [newCalDescription, setNewCalDescription] = useState('');
  const [newCalTimeZone, setNewCalTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );

  // Estado de citas locales para comprobación de solapamientos
  const [citas, setCitas] = useState<Cita[]>([]);

  

  // --- EFECTO PARA LIMPIAR CAMPOS SIEMPRE QUE CAMBIA LA FECHA INICIAL ---
  useEffect(() => {
    setPatientId('');
    setNotes('');
    // Si quieres limpiar también el calendario seleccionado, puedes hacerlo aquí:
    // setSelectedCalendarId('primary');
  }, []);

  useEffect(() => {
    if (
      initialDate &&
      (prevInitialDate.current === null || prevInitialDate.current !== initialDate.getTime())
    ) {
      setDate(initialDate);
      setPatientId('');
      setNotes('');
      prevInitialDate.current = initialDate.getTime();
    }
  }, [initialDate]);


  // Cargar citas locales y calendarios al montar
  useEffect(() => {
    if (email) {
      fetchCitas(email).then(setCitas).catch(console.error);
    }
    fetchCalendars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const fetchCalendars = useCallback(async () => {
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) return;
    try {
      let all: any[] = [];
      let pageToken: string | undefined;
      do {
        const url = new URL(
          'https://www.googleapis.com/calendar/v3/users/me/calendarList'
        );
        url.searchParams.set('showHidden', 'true');
        url.searchParams.set('maxResults', '250');
        if (pageToken) url.searchParams.set('pageToken', pageToken);
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al listar calendarios');
        const data = await res.json();
        // filtrar solo donde tenga permiso de escritura
        const editable = (data.items || []).filter(
          (cal: any) =>
            cal.accessRole === 'owner' || cal.accessRole === 'writer'
        );
        all = all.concat(editable);
        pageToken = data.nextPageToken;
      } while (pageToken);
      setCalendars(all);
      if (!all.find(c => c.id === selectedCalendarId)) {
        setSelectedCalendarId(all[0]?.id || 'primary');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('No se pudieron cargar los calendarios');
    }
  }, [selectedCalendarId]);

  const handleCreateCalendar = useCallback(async () => {
    if (!newCalName.trim()) {
      Alert.alert('Ingresa un nombre para el calendario');
      return;
    }
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      Alert.alert('Inicia sesión de nuevo');
      return;
    }
    try {
      const res = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: newCalName.trim(),
            description: newCalDescription.trim() || undefined,
            timeZone: newCalTimeZone || undefined,
          }),
        }
      );
      if (!res.ok) throw new Error('Error creando calendario');
      const created = await res.json();
      await fetchCalendars();
      setSelectedCalendarId(created.id);
      setNewCalName('');
      setNewCalDescription('');
      setShowNewCalModal(false);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error al crear calendario', e.message);
    }
  }, [newCalName, newCalDescription, newCalTimeZone, fetchCalendars]);

  const handleSubmit = useCallback(async () => {
      console.log("INTENTANDO CREAR CITA", { patientId, notes, selectedCalendarId, date });
    if (!email || !patientId || !notes) {
          console.log("Campos obligatorios incompletos", { email, patientId, notes });
      Alert.alert('Completa todos los campos obligatorios');
      return;
    }
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      console.error('No hay token de acceso', { token });
      Alert.alert('Inicia sesión de nuevo');
      return;
    }

    // Restricción de ±1 hora
    const startDate = date;
    const restriction = 1 * 3600000;
    const winStart = new Date(startDate.getTime() - restriction);
    const winEnd = new Date(startDate.getTime() + restriction);
    // chequear en Google
    const encId = encodeURIComponent(selectedCalendarId);
    const listRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encId}/events?timeMin=${winStart.toISOString()}&timeMax=${winEnd.toISOString()}&singleEvents=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const busyGoogle = (await listRes.json()).items || [];
    // chequear local
    const busyLocal = citas.filter(cita => {
      if (cita.status === 'completed') return false;
      const dt = new Date(cita.date);
      return dt >= winStart && dt <= winEnd;
    });
    if (busyGoogle.length || busyLocal.length) {
      console.warn('Horario ocupado', {
        busyGoogle: busyGoogle.length,
        busyLocal: busyLocal.length,
        winStart,
        winEnd,
      });
      Alert.alert(
        'Horario ocupado',
        'Ya hay una cita en ese rango de ±1 hora'
      );
      return;
    }

    // crear evento en Google
    const endDate = new Date(startDate.getTime() + 30 * 60000);
      // -- INTEGRACIÓN DE RECORDATORIOS --
    const eventBody = {
      summary: `Cita con ${patientId}`,
      description: notes,
      start: { dateTime: startDate.toISOString(), timeZone: newCalTimeZone },
      end: { dateTime: endDate.toISOString(), timeZone: newCalTimeZone },
      reminders: reminderEnabled ? {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: reminderMinutes }
        ]
      } : undefined
    };
    const resG = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventBody),
      }
    );
    if (!resG.ok) {
      const err = await resG.json();
      console.error(err);
      Alert.alert('No se pudo crear la cita en Google');
      return;
    }
    const googleEvent = await resG.json();

    // guardar en backend
    await crearCita({
      doctorId: email,
      patientId,
      date: startDate.toISOString(),
      notes,
      googleEventId: googleEvent.id,
    });
    console.log('Cita creada en backend', {
      doctorId: email,
      patientId,
      date: startDate.toISOString(),
      notes,
      googleEventId: googleEvent.id,
    });
    Alert.alert('Cita creada con éxito');
    router.back();
  }, [email, patientId, notes, date, selectedCalendarId, newCalTimeZone, citas, router, reminderEnabled, reminderMinutes]);

    return {
    date, setDate, showDatePicker, setShowDatePicker, patientId, setPatientId,
    notes, setNotes, calendars, selectedCalendarId, setSelectedCalendarId,
    showNewCalModal, setShowNewCalModal, newCalName, setNewCalName,
    newCalDescription, setNewCalDescription, newCalTimeZone, setNewCalTimeZone,
    handleCreateCalendar, handleSubmit, fetchCalendars,
    reminderEnabled, setReminderEnabled, reminderMinutes, setReminderMinutes
  };
}
