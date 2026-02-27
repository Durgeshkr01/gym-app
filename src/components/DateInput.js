import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../context/ThemeContext';

/**
 * Smart date input – auto-inserts slashes as user types (DD/MM/YYYY).
 * Tap the calendar icon to open a 3-step picker: Year → Month → Day.
 */
export default function DateInput({ value, onChangeText, label = 'Date', style, dense = true, mode = 'outlined', ...rest }) {
  const { theme } = useTheme();
  const c = theme.colors;
  const [showCalendar, setShowCalendar] = useState(false);
  const [step, setStep] = useState('year'); // 'year' | 'month' | 'day'
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i); // 2026 down to 1950
  const months = [
    { num: '01', name: 'January' }, { num: '02', name: 'February' }, { num: '03', name: 'March' },
    { num: '04', name: 'April' }, { num: '05', name: 'May' }, { num: '06', name: 'June' },
    { num: '07', name: 'July' }, { num: '08', name: 'August' }, { num: '09', name: 'September' },
    { num: '10', name: 'October' }, { num: '11', name: 'November' }, { num: '12', name: 'December' },
  ];

  const handleChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length >= 3) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    if (digits.length >= 5) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    onChangeText(formatted);
  };

  const toISO = (dmy) => {
    if (!dmy || dmy.length < 10) return '';
    const parts = dmy.split('/');
    if (parts.length === 3 && parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return '';
  };

  const fromISO = (iso) => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return '';
  };

  const openPicker = () => {
    // Pre-select year/month from current value if available
    const iso = toISO(value);
    if (iso) {
      const parts = iso.split('-');
      setSelectedYear(parts[0]);
      setSelectedMonth(parts[1]);
      setStep('day');
    } else {
      setSelectedYear(String(currentYear));
      setSelectedMonth(null);
      setStep('year');
    }
    setShowCalendar(true);
  };

  const selectedISO = toISO(value);
  const calendarCurrent = selectedYear && selectedMonth
    ? `${selectedYear}-${selectedMonth}-01`
    : selectedISO || new Date().toISOString().split('T')[0];

  const markedDates = selectedISO
    ? { [selectedISO]: { selected: true, selectedColor: '#FF6B35' } }
    : {};

  const stepTitle = step === 'year' ? '📅 Year chunein' : step === 'month' ? `📅 ${selectedYear} — Month chunein` : `📅 ${selectedYear}`;

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
        right={<TextInput.Icon icon="calendar" color="#FF6B35" onPress={openPicker} />}
        {...rest}
      />
      <Modal visible={showCalendar} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowCalendar(false)} activeOpacity={1}>
          <TouchableOpacity activeOpacity={1} style={styles.calendarBox}>

            {/* Header */}
            <View style={styles.header}>
              {step !== 'year' && (
                <TouchableOpacity onPress={() => setStep(step === 'day' ? 'month' : 'year')} style={styles.backBtn}>
                  <Text style={{ color: '#FF6B35', fontSize: 20 }}>‹</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.stepTitle}>{stepTitle}</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.closeBtn}>
                <Text style={{ color: '#999', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Step 1: Year Grid */}
            {step === 'year' && (
              <FlatList
                data={years}
                numColumns={4}
                keyExtractor={item => String(item)}
                style={{ maxHeight: 300 }}
                initialScrollIndex={years.indexOf(selectedYear ? parseInt(selectedYear) : currentYear)}
                getItemLayout={(_, index) => ({ length: 52, offset: 52 * Math.floor(index / 4), index })}
                renderItem={({ item }) => {
                  const isSelected = String(item) === String(selectedYear);
                  return (
                    <TouchableOpacity
                      onPress={() => { setSelectedYear(String(item)); setStep('month'); }}
                      style={[styles.gridItem, isSelected && styles.gridItemSelected]}>
                      <Text style={[styles.gridText, isSelected && styles.gridTextSelected]}>{item}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            {/* Step 2: Month Grid */}
            {step === 'month' && (
              <View style={styles.monthGrid}>
                {months.map(m => {
                  const isSelected = m.num === selectedMonth;
                  return (
                    <TouchableOpacity
                      key={m.num}
                      onPress={() => { setSelectedMonth(m.num); setStep('day'); }}
                      style={[styles.monthItem, isSelected && styles.gridItemSelected]}>
                      <Text style={[styles.monthText, isSelected && styles.gridTextSelected]}>{m.name.slice(0, 3)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Step 3: Day Calendar */}
            {step === 'day' && (
              <Calendar
                current={calendarCurrent}
                onDayPress={(day) => { onChangeText(fromISO(day.dateString)); setShowCalendar(false); }}
                markedDates={markedDates}
                renderHeader={() => (
                  <TouchableOpacity onPress={() => setStep('month')} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#FF6B35' }}>
                      {months.find(m => m.num === selectedMonth)?.name || ''} {selectedYear}
                    </Text>
                    <Text style={{ color: '#FF6B35', marginLeft: 4, fontSize: 12 }}>▾</Text>
                  </TouchableOpacity>
                )}
                theme={{
                  selectedDayBackgroundColor: '#FF6B35',
                  todayTextColor: '#FF6B35',
                  arrowColor: '#FF6B35',
                  dotColor: '#FF6B35',
                  textSectionTitleColor: '#888',
                }}
              />
            )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  backBtn: { padding: 6 },
  closeBtn: { padding: 6 },
  gridItem: {
    flex: 1,
    margin: 4,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  gridItemSelected: {
    backgroundColor: '#FF6B35',
  },
  gridText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  gridTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  monthItem: {
    width: '30%',
    paddingVertical: 14,
    marginBottom: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  monthText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});

