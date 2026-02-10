import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface CustomInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  secureTextEntry?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  style?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
}

export default function CustomInput({
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  editable = true,
  keyboardType = 'default',
  style,
  multiline = false,
  numberOfLines = 1,
}: CustomInputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: isFocused ? theme.colors.primary : theme.colors.border,
          backgroundColor: theme.colors.inputBackground,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
          style={styles.icon}
        />
      )}
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text,
            flex: 1,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={secureTextEntry && !showPassword}
        editable={editable}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginVertical: 8,
    transition: 'border-color 0.2s ease',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    fontSize: 16,
    paddingVertical: 12,
  },
});
