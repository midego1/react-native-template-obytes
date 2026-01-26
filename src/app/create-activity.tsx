import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Stack, router } from 'expo-router';
import { ScrollView, View, Pressable, Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { Text, Input, Button } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { useCreateActivity } from '@/api/activities/use-create-activity';
import { ACTIVITY_CATEGORIES } from '@/types/activity';
import { useState } from 'react';

const createActivitySchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category: z.string().min(1, 'Please select a category'),
  location_name: z.string().min(1, 'Location is required'),
  location_address: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  starts_at: z.string().min(1, 'Start time is required'),
  ends_at: z.string().optional(),
  max_attendees: z.string().optional(),
  is_flexible_time: z.boolean().optional(),
});

// eslint-disable-next-line max-lines-per-function
export default function CreateActivityScreen() {
  const { mutate: createActivity, isPending } = useCreateActivity();

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      location_name: '',
      location_address: '',
      city: '',
      country: '',
      starts_at: '',
      ends_at: '',
      max_attendees: '',
      is_flexible_time: false,
    },
    validators: {
      onChange: createActivitySchema as any,
    },
    onSubmit: async ({ value }) => {
      // Convert string dates to Date objects
      const startsAt = new Date(value.starts_at);
      const endsAt = value.ends_at ? new Date(value.ends_at) : undefined;

      // Validate dates
      if (Number.isNaN(startsAt.getTime())) {
        Alert.alert('Invalid Date', 'Please enter a valid start date and time');
        return;
      }

      if (startsAt < new Date()) {
        Alert.alert('Invalid Date', 'Start time must be in the future');
        return;
      }

      if (endsAt && endsAt <= startsAt) {
        Alert.alert('Invalid Date', 'End time must be after start time');
        return;
      }

      const activityData = {
        title: value.title,
        description: value.description || undefined,
        category: value.category,
        location_name: value.location_name,
        location_address: value.location_address || undefined,
        city: value.city,
        country: value.country,
        starts_at: startsAt,
        ends_at: endsAt,
        max_attendees: value.max_attendees ? parseInt(value.max_attendees) : undefined,
        is_flexible_time: value.is_flexible_time,
      };

      createActivity(activityData, {
        onSuccess: (activity) => {
          Alert.alert('Success!', 'Your activity has been created', [
            {
              text: 'View Activity',
              onPress: () => router.replace(`/activity/${activity.id}`),
            },
          ]);
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to create activity');
        },
      });
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Activity',
          headerBackTitle: 'Cancel',
        }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
          <View className="p-4">
            {/* Title */}
            <form.Field
              name="title"
              children={(field) => (
                <View className="mb-4">
                  <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    What's the plan? *
                  </Text>
                  <Input
                    placeholder="Coffee & coworking"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldError(field)}
                  />
                </View>
              )}
            />

            {/* Category */}
            <form.Field
              name="category"
              children={(field) => (
                <View className="mb-4">
                  <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    Category *
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {ACTIVITY_CATEGORIES.map((cat) => (
                      <Pressable
                        key={cat.value}
                        onPress={() => {
                          field.handleChange(cat.value);
                        }}
                        className={`rounded-full px-4 py-2 ${
                          field.state.value === cat.value
                            ? 'bg-indigo-500 dark:bg-indigo-600'
                            : 'bg-white dark:bg-gray-800'
                        }`}
                      >
                        <Text
                          className={
                            field.state.value === cat.value
                              ? 'font-semibold text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          }
                        >
                          {cat.emoji} {cat.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {getFieldError(field) && (
                    <Text className="mt-1 text-sm text-red-600">{getFieldError(field)}</Text>
                  )}
                </View>
              )}
            />

            {/* Description */}
            <form.Field
              name="description"
              children={(field) => (
                <View className="mb-4">
                  <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    Description (optional)
                  </Text>
                  <Input
                    placeholder="Tell people what to expect..."
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    multiline
                    numberOfLines={4}
                    error={getFieldError(field)}
                  />
                </View>
              )}
            />

            {/* Location Name */}
            <form.Field
              name="location_name"
              children={(field) => (
                <View className="mb-4">
                  <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    Location Name *
                  </Text>
                  <Input
                    placeholder="Starbucks Reserve"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldError(field)}
                  />
                </View>
              )}
            />

            {/* Location Address */}
            <form.Field
              name="location_address"
              children={(field) => (
                <View className="mb-4">
                  <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    Address (optional)
                  </Text>
                  <Input
                    placeholder="1124 Pike St"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldError(field)}
                  />
                </View>
              )}
            />

            {/* City & Country */}
            <View className="mb-4 flex-row gap-2">
              <form.Field
                name="city"
                children={(field) => (
                  <View className="flex-1">
                    <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                      City *
                    </Text>
                    <Input
                      placeholder="Seattle"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      error={getFieldError(field)}
                    />
                  </View>
                )}
              />

              <form.Field
                name="country"
                children={(field) => (
                  <View className="flex-1">
                    <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                      Country *
                    </Text>
                    <Input
                      placeholder="United States"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      error={getFieldError(field)}
                    />
                  </View>
                )}
              />
            </View>

            {/* Start Date/Time */}
            <form.Field
              name="starts_at"
              children={(field) => (
                <View className="mb-4">
                  <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    Start Time * (e.g., 2026-01-27T14:00)
                  </Text>
                  <Input
                    placeholder="2026-01-27T14:00"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldError(field)}
                  />
                  <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Format: YYYY-MM-DDTHH:MM
                  </Text>
                </View>
              )}
            />

            {/* End Date/Time */}
            <form.Field
              name="ends_at"
              children={(field) => (
                <View className="mb-4">
                  <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    End Time (optional)
                  </Text>
                  <Input
                    placeholder="2026-01-27T16:00"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldError(field)}
                  />
                </View>
              )}
            />

            {/* Max Attendees */}
            <form.Field
              name="max_attendees"
              children={(field) => (
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

            {/* Submit Button */}
            <form.Subscribe
              selector={(state) => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <Button
                  label="Create Activity"
                  onPress={form.handleSubmit}
                  loading={isSubmitting || isPending}
                  className="mt-4"
                />
              )}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
