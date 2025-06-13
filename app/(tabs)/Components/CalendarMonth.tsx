// components/CalendarMonth.tsx
import React from 'react';
import { Text } from 'react-native';
import { Calendar } from 'react-native-calendars';

interface CalendarMonthProps {
  isDark: boolean;
  markedDates: { [date: string]: any };
  onDayPress: (day: { dateString: string }) => void;
  onMonthChange: (m: { year: number; month: number }) => void;
}

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  isDark, markedDates, onDayPress, onMonthChange
}) => (
  <>
    <Text style={{
      marginTop: 4, marginBottom: 4, fontWeight: 'bold',
      fontSize: 17, color: isDark ? '#fff' : '#333'
    }}>
      Calendario de Citas
    </Text>
    <Calendar
      markedDates={markedDates}
      onDayPress={onDayPress}
      onMonthChange={onMonthChange}
      theme={{
        backgroundColor: isDark ? '#181818' : '#fff',
        calendarBackground: isDark ? '#181818' : '#fff',
        todayTextColor: '#1aa5ff',
        dayTextColor: isDark ? '#fff' : '#222',
        arrowColor: '#1aa5ff',
        selectedDayBackgroundColor: '#1aa5ff',
        selectedDayTextColor: '#fff',
        monthTextColor: isDark ? '#fff' : '#1aa5ff',
        textMonthFontWeight: 'bold',
        textSectionTitleColor: isDark ? '#aaa' : '#444',
      }}
      firstDay={1}
      style={{
        borderRadius: 16,
        marginBottom: 8,
        elevation: 3,
      }}
    />
  </>
);
export default CalendarMonth;

