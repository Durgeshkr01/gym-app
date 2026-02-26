import React from 'react';
import { TextInput } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

/**
 * Smart date input – auto-inserts slashes as user types (DD/MM/YYYY).
 * Accepts: value, onChangeText, label, style, dense, mode
 */
export default function DateInput({ value, onChangeText, label = 'Date', style, dense = true, mode = 'outlined', ...rest }) {
  const { theme } = useTheme();
  const c = theme.colors;

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

  return (
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
      right={<TextInput.Icon icon="calendar" color={c.muted} />}
      {...rest}
    />
  );
}
