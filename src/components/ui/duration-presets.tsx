import { Pressable, View } from 'react-native';

import { addDuration, DURATION_PRESETS } from '@/lib/date-utils';

import { Text } from './text';

type DurationPresetsProps = {
  startTime: Date | undefined;
  selectedDuration: number | null;
  onSelect: (hours: number, endTime: Date) => void;
  disabled?: boolean;
};

export function DurationPresets({
  startTime,
  selectedDuration,
  onSelect,
  disabled = false,
}: DurationPresetsProps) {
  const handleSelect = (hours: number) => {
    if (startTime && !disabled) {
      const endTime = addDuration(startTime, hours);
      onSelect(hours, endTime);
    }
  };

  const isDisabled = disabled || !startTime;

  return (
    <View className="mb-4">
      <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
        Duration
      </Text>
      <View className="flex-row gap-2">
        {DURATION_PRESETS.map((preset) => {
          const isSelected = selectedDuration === preset.hours;
          return (
            <Pressable
              key={preset.label}
              onPress={() => handleSelect(preset.hours)}
              disabled={isDisabled}
              className={`flex-1 rounded-xl py-3 px-2 items-center ${
                isSelected
                  ? 'bg-indigo-500 dark:bg-indigo-600'
                  : isDisabled
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isSelected
                    ? 'text-white'
                    : isDisabled
                      ? 'text-gray-400 dark:text-gray-600'
                      : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {isDisabled && !startTime && (
        <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Select a start time first
        </Text>
      )}
    </View>
  );
}
