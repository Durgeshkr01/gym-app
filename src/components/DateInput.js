import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';

/**
 * Smart date input – auto-inserts slashes as user types (DD/MM/YYYY).
 * Tap the calendar icon to open a date picker.
 * Accepts: value, onChangeText, label, style, dense, mode
 */
export default function DateInput({ value, onChangeText, label = 'Date', style, dense = true, mode = 'outlined', ...rest }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [showCalendar, setShowCalendar] = useState(false);

  const handleChange = (text) => {
    // Strip everything except digits
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (digits.length >= 5) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }
    onChangeText(formatted);
  };

  // Convert DD/MM/YYYY → YYYY-MM-DD for calendar
  const toISO = (dmy) => {
    if (!dmy || dmy.length < 10) return '';
    const parts = dmy.split('/');
    if (parts.length === 3 && parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return '';
  };

  // Convert YYYY-MM-DD → DD/MM/YYYY
  const fromISO = (iso) => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return '';
  };

  const selectedISO = toISO(value);
  const todayISO = new Date().toISOString().split('T')[0];
  const markedDates = selectedISO
    ? { [selectedISO]: { selected: true, selectedColor: '#FF6B35' } }
    : {};

  return (
    <View>
      <TextInput
        label={label}
        value={value}
        onChangeText={handleChange}
        mode={mode}
        placeholder="DD/MM/YYYY"
        keyboardType="numeric"
        maxLength={10}
        dense={dense}
        style={style}
        textColor={c.text}
        right={<TextInput.Icon icon="calendar" color="#FF6B35" onPress={() => setShowCalendar(true)} />}
        {...rest}
      />
      <Modal visible={showCalendar} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowCalendar(false)} activeOpacity={1}>
          <TouchableOpacity activeOpacity={1} style={styles.calendarBox}>
            <Text style={{ textAlign: 'center', fontSize: 15, fontWeight: 'bold', color: '#FF6B35', marginBottom: 6 }}>
              📅 {label}
            </Text>
            <Calendar
              current={selectedISO || todayISO}
              onDayPress={(day) => {
                onChangeText(fromISO(day.dateString));
                setShowCalendar(false);
              }}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: '#FF6B35',
                todayTextColor: '#FF6B35',
                arrowColor: '#FF6B35',
                dotColor: '#FF6B35',
                textSectionTitleColor: '#888',
              }}
            />
            <TouchableOpacity onPress={() => setShowCalendar(false)}
              style={{ alignSelf: 'center', marginTop: 8, paddingVertical: 8, paddingHorizontal: 24, backgroundColor: '#FF6B35', borderRadius: 20 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  calendarBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
