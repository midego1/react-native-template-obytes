import { Switch, View } from 'react-native';

import { DateTimePickerInput, DurationPresets, Input, Text } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { combineDateAndTime, getTodayStart } from '@/lib/date-utils';

import { useWizard } from './wizard-context';

export function StepWhen() {
  const { form, selectedDuration, setSelectedDuration } = useWizard();

  const minimumDate = getTodayStart();

  return (
    <form.Subscribe
      selector={(state: any) => ({
        startsAt: state.values.starts_at,
        endsAt: state.values.ends_at,
        isFlexibleTime: state.values.is_flexible_time,
      })}
      children={({ startsAt, endsAt, isFlexibleTime }: any) => {
        const handleDateChange = (date: Date) => {
          if (startsAt) {
            // Keep existing time, just change date
            const newDate = combineDateAndTime(date, startsAt);
            form.setFieldValue('starts_at', newDate);
            // If end time exists, update it too
            if (endsAt) {
              const newEndDate = combineDateAndTime(date, endsAt);
              form.setFieldValue('ends_at', newEndDate);
            }
          } else {
            // Set date with a default time (e.g., noon)
            const newDate = new Date(date);
            newDate.setHours(12, 0, 0, 0);
            form.setFieldValue('starts_at', newDate);
          }
        };

        const handleStartTimeChange = (time: Date) => {
          if (startsAt) {
            // Keep existing date, just change time
            const newDateTime = combineDateAndTime(startsAt, time);
            form.setFieldValue('starts_at', newDateTime);
          } else {
            // Use today's date with the selected time
            form.setFieldValue('starts_at', time);
          }
          // Clear duration selection when time changes manually
          setSelectedDuration(null);
        };

        const handleDurationSelect = (hours: number, endTime: Date) => {
          setSelectedDuration(hours);
          form.setFieldValue('ends_at', endTime);
        };

        const handleEndTimeChange = (time: Date) => {
          if (startsAt) {
            const newEndTime = combineDateAndTime(startsAt, time);
            form.setFieldValue('ends_at', newEndTime);
          } else {
            form.setFieldValue('ends_at', time);
          }
          // Clear duration preset when manually setting end time
          setSelectedDuration(null);
        };

        const handleFlexibleToggle = (value: boolean) => {
          form.setFieldValue('is_flexible_time', value);
        };

        return (
          <View className="p-4">
            {/* Date Picker */}
            <form.Field
              name="starts_at"
              children={(field: any) => (
                <DateTimePickerInput
                  label="Date *"
                  value={field.state.value}
                  onChange={handleDateChange}
                  mode="date"
                  minimumDate={minimumDate}
                  placeholder="Select date"
                  error={getFieldError(field)}
                />
              )}
            />

            {/* Start Time Picker */}
            <form.Field
              name="starts_at"
              children={(field: any) => (
                <DateTimePickerInput
                  label="Start Time *"
                  value={field.state.value}
                  onChange={handleStartTimeChange}
                  mode="time"
                  placeholder="Select start time"
                />
              )}
            />

            {/* Duration Presets */}
            <DurationPresets
              startTime={startsAt}
              selectedDuration={selectedDuration}
              onSelect={handleDurationSelect}
            />

            {/* End Time Picker */}
            <form.Field
              name="ends_at"
              children={(field: any) => (
                <DateTimePickerInput
                  label="End Time (optional)"
                  value={field.state.value}
                  onChange={handleEndTimeChange}
                  mode="time"
                  placeholder="Select end time"
                />
              )}
            />

            {/* Divider */}
            <View className="my-4 h-px bg-gray-200 dark:bg-gray-700" />

            {/* Flexible Time Toggle */}
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 dark:text-gray-100">
                  Flexible timing
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Start time is approximate
                </Text>
              </View>
              <Switch
                value={isFlexibleTime || false}
                onValueChange={handleFlexibleToggle}
                trackColor={{ false: '#e5e7eb', true: '#818cf8' }}
                thumbColor={isFlexibleTime ? '#6366f1' : '#f4f4f5'}
              />
            </View>

            {/* Max Attendees */}
            <form.Field
              name="max_attendees"
              children={(field: any) => (
                <View className="mb-4">
                  <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    Max Attendees (optional)
                  </Text>
                  <Input
                    placeholder="Leave empty for unlimited"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    keyboardType="numeric"
                    error={getFieldError(field)}
                  />
                </View>
              )}
            />
          </View>
        );
      }}
    />
  );
}
