import React from 'react';
import { View, Text, Switch, StyleSheet, TextInput } from 'react-native';

interface ReminderOptInProps {
  enabled: boolean;
  setEnabled: (val: boolean) => void;
  minutes: number;
  setMinutes: (val: number) => void;
}

export default function ReminderOptIn({
  enabled,
  setEnabled,
  minutes,
  setMinutes
}: ReminderOptInProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>¿Deseas recibir recordatorio antes de tu cita?</Text>
      <Switch value={enabled} onValueChange={setEnabled} />
      {enabled && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Text style={styles.text}>Minutos antes:</Text>
          <TextInput
            style={styles.input}
            value={String(minutes)}
            onChangeText={t => setMinutes(Number(t.replace(/[^0-9]/g, '')))}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 12, alignItems: 'center' },
  text: { fontSize: 16, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 6,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#fff',
    marginLeft: 6
  }
});
