import DateTimePicker from '@react-native-community/datetimepicker';
import { useCallback, useRef, useState } from 'react';
import { Modal, Platform, Pressable, View } from 'react-native';

import { formatDisplayDate, formatDisplayTime } from '@/lib/date-utils';

import { Text } from './text';

type DateTimePickerMode = 'date' | 'time';

type DateTimePickerInputProps = {
  label?: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  mode: DateTimePickerMode;
  minimumDate?: Date;
  maximumDate?: Date;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
};

export function DateTimePickerInput({
  label,
  value,
  onChange,
  mode,
  minimumDate,
  maximumDate,
  placeholder,
  error,
  disabled = false,
}: DateTimePickerInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  // Track the selected value in the picker before confirming
  const pendingValueRef = useRef<Date | null>(null);

  const handlePress = useCallback(() => {
    if (!disabled) {
      // Initialize pending value to current value or now
      pendingValueRef.current = value || new Date();
      setShowPicker(true);
    }
  }, [disabled, value]);

  const handleChange = useCallback(
    (_event: any, selectedDate?: Date) => {
      if (Platform.OS === 'android') {
        setShowPicker(false);
        if (selectedDate) {
          onChange(selectedDate);
        }
      } else {
        // iOS: just track the selection, don't confirm yet
        if (selectedDate) {
          pendingValueRef.current = selectedDate;
        }
      }
    },
    [onChange],
  );

  const handleIOSConfirm = useCallback(() => {
    // On iOS, confirm the pending selection
    if (pendingValueRef.current) {
      onChange(pendingValueRef.current);
    }
    setShowPicker(false);
  }, [onChange]);

  const handleIOSCancel = useCallback(() => {
    pendingValueRef.current = null;
    setShowPicker(false);
  }, []);

  const displayValue
    = value
      ? mode === 'date'
        ? formatDisplayDate(value)
        : formatDisplayTime(value)
      : placeholder || (mode === 'date' ? 'Select date' : 'Select time');

  const hasValue = !!value;

  // Determine the display mode based on platform and picker type
  const getIOSDisplay = () => {
    if (mode === 'date') {
      return 'inline'; // Calendar view for dates
    }
    return 'spinner'; // Spinner for time
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
          {label}
        </Text>
      )}

      <Pressable
        onPress={handlePress}
        disabled={disabled}
        className={`rounded-xl border px-4 py-3 ${
          error
            ? 'border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/20'
            : disabled
              ? 'border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800'
              : 'border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-base ${
              hasValue
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-400 dark:text-gray-500'
            } ${disabled ? 'opacity-50' : ''}`}
          >
            {displayValue}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500">
            {mode === 'date' ? '📅' : '🕐'}
          </Text>
        </View>
      </Pressable>

      {error && (
        <Text className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</Text>
      )}

      {/* iOS Modal Picker */}
      {Platform.OS === 'ios' && showPicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
          onRequestClose={handleIOSCancel}
        >
          <Pressable
            className="flex-1 bg-black/50"
            onPress={handleIOSCancel}
          >
            <View className="flex-1" />
            <Pressable className="bg-white dark:bg-gray-800 rounded-t-3xl">
              <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <Pressable onPress={handleIOSCancel}>
                  <Text className="text-gray-500 dark:text-gray-400">Cancel</Text>
                </Pressable>
                <Text className="font-semibold text-gray-900 dark:text-white">
                  {mode === 'date' ? 'Select Date' : 'Select Time'}
                </Text>
                <Pressable onPress={handleIOSConfirm}>
                  <Text className="text-indigo-600 dark:text-indigo-400 font-semibold">
                    Done
                  </Text>
                </Pressable>
              </View>
              <View className={mode === 'date' ? 'pb-4 px-2' : 'pb-8'}>
                <DateTimePicker
                  value={pendingValueRef.current || value || new Date()}
                  mode={mode}
                  display={getIOSDisplay()}
                  onChange={handleChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  textColor={Platform.OS === 'ios' ? '#000' : undefined}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Android Dialog Picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode={mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}
