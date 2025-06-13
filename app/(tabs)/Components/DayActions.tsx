import React from 'react';
import { Platform } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import DaySchedule from './DaySchedule';
import { Cita, GoogleEvent } from '../types/calendar';

interface DayActionsProps {
  modalDate: string;
  modalEvents: (GoogleEvent | Cita)[];
  isDark: boolean;
  onEdit: (item: GoogleEvent | Cita) => void;
  onDelete: (item: GoogleEvent | Cita) => void;
  onAdd: (hour: number) => void;
  onClose: () => void;
}

export default function DayActions({
  modalDate,
  modalEvents,
  isDark,
  onEdit,
  onDelete,
  onAdd,
  onClose,
}: DayActionsProps) {
  const content = (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <Text style={[styles.title, isDark && styles.darkText]}>
        {modalDate}
      </Text>
      <DaySchedule
        date={modalDate}
        events={modalEvents}
        onSelect={onEdit}
        onAdd={onAdd}
        onDelete={onDelete} // NUEVO PROP
      />
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Text style={styles.closeTxt}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );

  // En web lo mostramos inline, en móvil en modal
  if (Platform.OS === 'web') {
    return content;
  }
  return (
    <Modal transparent animationType="slide" visible>
      <View style={[styles.overlay, isDark && styles.darkOverlay]}>
        {content}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center' },
  darkOverlay: { backgroundColor:'rgba(0,0,0,0.8)' },
  container: { width:'90%', maxHeight:'80%', backgroundColor:'#fff', borderRadius:8, padding:16 },
  darkContainer: { backgroundColor:'#333' },
  title: { fontSize:18, fontWeight:'600', marginBottom:12, textAlign:'center' },
  darkText: { color:'#eee' },
  closeBtn: { marginTop:12, alignSelf:'center' },
  closeTxt: { color:'#1aa5ff', fontWeight:'500' }
});