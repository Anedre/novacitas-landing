import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Alert,
  Button,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

function formatDateTime(date: Date) {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
}

export default function UpdateScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState(30);
  const [loading, setLoading] = useState(false);

  // Para web: centrado máximo
  const isWeb = Platform.OS === 'web';
  const { height, width } = Dimensions.get('window');

  // Puedes traer datos actuales aquí si quieres
  useEffect(() => {
    // Simulación: si quieres cargar la cita existente por id, haz fetch aquí
    // y luego setea patientId, date, notes, reminderEnabled, reminderMinutes
  }, [id]);

  const handleUpdate = async () => {
    if (!patientId.trim()) {
      Alert.alert('Debes ingresar el paciente');
      return;
    }
    if (!date) {
      Alert.alert('Debes elegir una fecha y hora');
      return;
    }
    setLoading(true);
    try {
      // Estructura reminders para Google Calendar
      const reminders = reminderEnabled
        ? { useDefault: false, overrides: [{ method: 'popup', minutes: reminderMinutes }] }
        : { useDefault: false, overrides: [] };

      await fetch('https://mbrn706o5j.execute-api.us-east-1.amazonaws.com/Prod/NovaCalendario-CreateAppointment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: id,
          patientId,
          date: date.toISOString(),
          notes,
          reminders,
          status: 'updated'
        })
      });
      Alert.alert('Cita actualizada');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1, backgroundColor: isWeb ? '#e9f0fa' : '#f6f8fc' }}
    >
      <ScrollView
        contentContainerStyle={[
          isWeb
            ? {
                minHeight: height,
                minWidth: width,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#e9f0fa'
              }
            : { flexGrow: 1, justifyContent: 'center' }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={isWeb ? styles.cardWeb : styles.cardMobile}>
          <Text style={styles.title}>Actualizar cita</Text>

          <Text style={styles.label}>Paciente:</Text>
          <TextInput
            value={patientId}
            onChangeText={setPatientId}
            placeholder="ID o nombre del paciente"
            style={styles.input}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Fecha y hora:</Text>
          {isWeb ? (
            // @ts-ignore
            <input
              type="datetime-local"
              value={date ? formatDateTime(date) : ''}
              onChange={e => {
                const val = e.target.value;
                if (val) setDate(new Date(val));
                else setDate(null);
              }}
              style={{
                width: '100%',
                padding: 16,
                borderWidth: 1,
                borderColor: '#ccd4e1',
                borderRadius: 12,
                backgroundColor: '#fafbfc',
                fontSize: 18,
                marginBottom: 20,
                boxSizing: 'border-box'
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setShowPicker(true)}
                activeOpacity={0.85}
                style={styles.dateInput}
              >
                <Text style={{
                  fontSize: 17,
                  color: date ? '#222' : '#aaa'
                }}>
                  {date ? formatDateTime(date) : 'Selecciona fecha y hora'}
                </Text>
              </TouchableOpacity>
              {showPicker && (
                <DateTimePicker
                  value={date ?? new Date()}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(_, selectedDate) => {
                    setShowPicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                  minimumDate={new Date()}
                  style={{ backgroundColor: '#fff' }}
                />
              )}
            </>
          )}

          <Text style={styles.label}>Notas:</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Notas sobre la cita"
            multiline
            style={[styles.input, styles.textarea]}
            autoCapitalize="sentences"
          />

          <View style={styles.reminderRow}>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ false: '#ccc', true: '#1aa5ff' }}
              thumbColor={reminderEnabled ? '#1aa5ff' : '#f4f3f4'}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.reminderLabel}>¿Agregar recordatorio?</Text>
          </View>
          {reminderEnabled && (
            <View style={styles.reminderMinutes}>
              <Text style={{ fontSize: 15, marginRight: 6 }}>Minutos antes:</Text>
              <TextInput
                style={styles.minutesInput}
                value={String(reminderMinutes)}
                onChangeText={t =>
                  setReminderMinutes(
                    Math.max(1, parseInt(t.replace(/[^0-9]/g, '')) || 1)
                  )
                }
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          )}

          <View style={styles.btnGroup}>
            <Button title="Actualizar" onPress={handleUpdate} color="#1aa5ff" disabled={loading} />
            <View style={{ width: 10 }} />
            <Button title="Cancelar" onPress={() => router.back()} color="#888" />
          </View>
          {loading && <ActivityIndicator size="large" color="#1aa5ff" style={{ marginTop: 24 }} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ----------- STYLES (adaptado para tipos y compatibilidad)
const styles = StyleSheet.create({
  cardWeb: {
    width: 420,
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 36,
    marginVertical: 0,
    marginTop: 40,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#d3e3ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.13,
    shadowRadius: 22,
    elevation: 10,
    alignSelf: 'center',
  },
  cardMobile: {
    width: '94%',
    maxWidth: 420,
    padding: 22,
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.11,
    shadowRadius: 17,
    elevation: 9,
    alignSelf: 'center',
  },
  title: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#1a73e8',
    marginBottom: 20,
    alignSelf: 'center',
  },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 10 },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccd4e1',
    borderRadius: 12,
    backgroundColor: '#fafbfc',
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e2e6',
    borderRadius: 10,
    backgroundColor: '#fafbfc',
    padding: 16,
    marginBottom: 18,
    fontSize: 16
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 4,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  reminderLabel: { fontSize: 15, fontWeight: '500' },
  reminderMinutes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 4,
  },
  minutesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 7,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#fff',
    marginLeft: 3,
  }
});
