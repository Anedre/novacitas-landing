import React from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Platform,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useUser } from '../../contexts/UserContext';
import ReminderOptIn from './Components/reminders';
import { useCreateCitaLogic } from '../../hooks/useCreateCitaLogic'; // Ajusta ruta si es necesario

export default function CreateCitaScreen() {
  const router = useRouter();
  const { user } = useUser();
  const email = user?.email;
  const params = useLocalSearchParams();
  const initialDate = params.date ? new Date(params.date as string) : undefined;

  // Hook modularizado
 const {
  date, setDate, showDatePicker, setShowDatePicker, patientId, setPatientId,
  notes, setNotes, calendars, selectedCalendarId, setSelectedCalendarId,
  showNewCalModal, setShowNewCalModal, newCalName, setNewCalName,
  newCalDescription, setNewCalDescription, newCalTimeZone, setNewCalTimeZone,
  handleCreateCalendar, handleSubmit,
  reminderEnabled, setReminderEnabled, reminderMinutes, setReminderMinutes
} = useCreateCitaLogic(email, router, initialDate);

  if (!email) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#1aa5ff"/></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Paciente:</Text>
      <TextInput
        value={patientId}
        onChangeText={setPatientId}
        style={styles.input}
        placeholder="ID o nombre del paciente"
      />

      <Text style={styles.label}>Notas:</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        style={[styles.input, styles.textarea]}
        placeholder="Notas sobre la cita"
        multiline
      />

      <Text style={styles.label}>Elige Calendario:</Text>
      {Platform.OS === 'web' ? (
        <>
          <select
            value={selectedCalendarId}
            onChange={e => {
              if (e.target.value === '__new__') setShowNewCalModal(true);
              else setSelectedCalendarId(e.target.value);
            }}
            style={{
              width: '100%',
              padding: 12,
              borderWidth: '1px',
              borderColor: '#ddd',
              borderRadius: 8,
              backgroundColor: '#fff',
              fontSize: 16,
              marginBottom: 16,
            }}
          >
            {calendars.map(cal => (
              <option key={cal.id} value={cal.id}>
                {cal.summaryOverride ?? cal.summary}
              </option>
            ))}
            <option value="__new__">➕ Crear calendario…</option>
          </select>
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Fecha y hora:</Text>
            <input
              type="datetime-local"
              value={
                date
                  ? `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
                  : ''
              }
              onChange={e => {
                const [datePart, timePart] = e.target.value.split('T');
                const [year, month, day] = datePart.split('-').map(Number);
                const [hour, minute] = timePart.split(':').map(Number);
                setDate(new Date(year, month - 1, day, hour, minute));
              }}
              style={{
                width: '100%',
                padding: 12,
                borderWidth: 1,
                borderColor: '#ddd',
                borderRadius: 8,
                backgroundColor: '#fff',
                fontSize: 16,
                marginBottom: 16,
              }}
            />
          </View>
        </>
      ) : (
        <View style={styles.dateBtn}>
          <Button
            title={date.toLocaleString()}
            onPress={() => setShowDatePicker(true)}
            color="#1aa5ff"
          />
          <Picker
            selectedValue={selectedCalendarId}
            onValueChange={v => {
              if (v === '__new__') setShowNewCalModal(true);
              else setSelectedCalendarId(v);
            }}
            mode="dropdown"
          >
            {calendars.map(cal => (
              <Picker.Item
                key={cal.id}
                label={cal.summaryOverride ?? cal.summary}
                value={cal.id}
              />
            ))}
            <Picker.Item label="➕ Crear calendario…" value="__new__" />
          </Picker>
        </View>
      )}
      
      <ReminderOptIn
        enabled={reminderEnabled}
        setEnabled={setReminderEnabled}
        minutes={reminderMinutes}
        setMinutes={setReminderMinutes}
      />


      <View style={styles.btnGroup}>
        <Button title="Crear cita" onPress={handleSubmit} color="#1aa5ff" />
        <Button title="Cancelar" onPress={() => router.back()} color="#888" />
      </View>

      {/* Modal nuevo calendario */}
      <Modal visible={showNewCalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Calendario</Text>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              value={newCalName}
              onChangeText={setNewCalName}
              style={styles.input}
            />
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              value={newCalDescription}
              onChangeText={setNewCalDescription}
              style={styles.input}
            />
            <Text style={styles.label}>Zona horaria</Text>
            <TextInput
              value={newCalTimeZone}
              onChangeText={setNewCalTimeZone}
              style={styles.input}
            />
            <View style={styles.btnGroup}>
              <Button title="Crear" onPress={handleCreateCalendar} color="#1aa5ff" />
              <Button title="Cerrar" onPress={() => setShowNewCalModal(false)} color="#888" />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: { flex:1, justifyContent:'center', alignItems:'center' },
  container: { flex:1, backgroundColor:'#fafafb', padding:20 },
  title: { fontSize:24, fontWeight:'bold', color:'#1a73e8', marginBottom:20 },
  label: { fontSize:16, fontWeight:'500', marginBottom:8 },
  input: {
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:8,
    backgroundColor:'#fff',
    padding:12,
    marginBottom:16
  },
  textarea: { minHeight:80, textAlignVertical:'top' },
  dateBtn: {
    padding:12,
    backgroundColor:'#1aa5ff',
    borderRadius:8,
    marginBottom:16,
    alignItems:'center'
  },
  dateTxt: { color:'#fff', fontWeight:'bold' },
  selectWebWrapper: { marginBottom:16 },
  selectWeb: {
    width:'100%',
    padding:12,
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:8,
    backgroundColor:'#fff'
  },
  pickerWrapper: {
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:8,
    backgroundColor:'#fff',
    marginBottom:16
  },
  picker: { width:'100%' },
  btnGroup: { flexDirection:'row', justifyContent:'space-between', marginTop:10 },
  btn: { flex:1, marginHorizontal:5 },
  modalOverlay: {
    flex:1,
    backgroundColor:'rgba(0,0,0,0.5)',
    justifyContent:'center',
    alignItems:'center'
  },
  modalContent: {
    width:'90%',
    maxWidth:400,
    backgroundColor:'#fff',
    borderRadius:8,
    padding:20,
    shadowColor:'#000',
    shadowOffset:{ width:0, height:2 },
    shadowOpacity:0.25,
    shadowRadius:4,
    elevation:5
  },
  modalTitle: { fontSize:18, fontWeight:'600', marginBottom:12 }
});
