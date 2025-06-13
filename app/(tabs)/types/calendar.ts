// app/(tabs)/types/calendar.ts

export type GoogleEvent = {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  description?: string;
  location?: string;
};

export type Cita = {
  appointmentId: string;
  date: string;
  patientId: string;
  status: string;
  notes?: string;
  // Añade esta línea:
  googleEventId?: string;
};

export type EventoCalendario = GoogleEvent | Cita;
