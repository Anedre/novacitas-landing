import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Button, Platform } from 'react-native';
import { EventoCalendario } from '../types/calendar';

interface DayScheduleProps {
  date: string;
  events: EventoCalendario[];
  onAdd: (hour: number) => void;
  onSelect: (ev: EventoCalendario) => void;
  onDelete: (ev: EventoCalendario) => void;
}

export default function DaySchedule({ date, events, onAdd, onSelect, onDelete }: DayScheduleProps) {
  const [expandedHour, setExpandedHour] = useState<number | null>(null);

  // Agrupa eventos por hora
  const evByHour = events.reduce((acc, ev) => {
    const dt = new Date((ev as any).date || (ev as any).start?.dateTime);
    const h = dt.getHours();
    acc[h] = ev;
    return acc;
  }, {} as Record<number, EventoCalendario>);

  return (
    <ScrollView style={styles.container}>
      {Array.from({ length: 24 }).map((_, hour) => {
        const ev = evByHour[hour];
        const isExpanded = expandedHour === hour;

        return (
          <View key={hour}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                if (ev) setExpandedHour(isExpanded ? null : hour);
                else onAdd(hour);
              }}
            >
              <Text style={styles.hour}>{hour}:00</Text>
              {ev ? (
                <View style={styles.card}>
                  <Text style={styles.title}>
                    {(ev as any).summary ?? (ev as any).notes}
                  </Text>
                  <Text style={{ marginLeft: 8 }}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              ) : (
                <View style={styles.emptySlot} />
              )}
            </TouchableOpacity>
            {/* Si está expandido, muestra menú */}
            {isExpanded && ev && (
              <View style={styles.menu}>
                <Text style={styles.menuTitle}>Detalles</Text>
                {/* Mostrar detalles, según tipo */}
                {'summary' in ev && ev.summary && (
                  <Text>
                    <Text style={{ fontWeight: 'bold' }}>Resumen: </Text>
                    {ev.summary}
                  </Text>
                )}
                {'notes' in ev && ev.notes && (
                  <Text>
                    <Text style={{ fontWeight: 'bold' }}>Notas: </Text>
                    {ev.notes}
                  </Text>
                )}
                {'patientId' in ev && ev.patientId && (
                  <Text>
                    <Text style={{ fontWeight: 'bold' }}>Paciente: </Text>
                    {ev.patientId}
                  </Text>
                )}
                {'description' in ev && ev.description && (
                  <Text>
                    <Text style={{ fontWeight: 'bold' }}>Descripción: </Text>
                    {ev.description}
                  </Text>
                )}
                {/* Calendario: ejemplo, puedes mostrar más si tienes */}
                {'appointmentId' in ev && (
                  <Text>
                    <Text style={{ fontWeight: 'bold' }}>Tipo: </Text>
                    {'Cita local'}
                  </Text>
                )}
                {'id' in ev && !('appointmentId' in ev) && (
                  <Text>
                    <Text style={{ fontWeight: 'bold' }}>Tipo: </Text>
                    {'Google Calendar'}
                  </Text>
                )}
                {/* Acciones */}
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <Button title="Editar" onPress={() => onSelect(ev)} />
                  <View style={{ width: 12 }} />
                  <Button title="Borrar" color="red" onPress={() => onDelete(ev)} />
                </View>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  hour: { width: 50, color: '#888' },
  card: {
    backgroundColor: '#1aa5ff',
    flex: 1,
    padding: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { color: '#fff', fontWeight: '600' },
  emptySlot: { flex: 1 },
  menu: {
    backgroundColor: Platform.OS === 'web' ? '#f8f9fa' : '#fff',
    borderRadius: 8,
    marginHorizontal: 52,
    marginBottom: 8,
    padding: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  menuTitle: { fontWeight: 'bold', marginBottom: 4 },
});
