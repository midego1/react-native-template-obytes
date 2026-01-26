import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Stack, router } from 'expo-router';
import { ScrollView, View, Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { z } from 'zod';
import { Text, Input, Button } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { useUserProfile } from '@/api/users/use-user-profile';
import { useUpdateProfile } from '@/api/users/use-update-profile';

const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  current_city: z.string().min(1, 'City is required'),
  current_country: z.string().min(1, 'Country is required'),
});

// eslint-disable-next-line max-lines-per-function
export default function EditProfileScreen() {
  const { data: profile, isLoading } = useUserProfile();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const form = useForm({
    defaultValues: {
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      current_city: profile?.current_city || '',
      current_country: profile?.current_country || '',
    },
    validators: {
      onChange: updateProfileSchema as any,
    },
    onSubmit: async ({ value }) => {
      updateProfile(value, {
        onSuccess: () => {
          Alert.alert('Success', 'Your profile has been updated', [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]);
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to update profile');
        },
      });
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Cancel',
        }}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
          <View className="p-4">
            {/* Full Name */}
            <form.Field
              name="full_name"
              children={(field) => (
                <View className="mb-4">
                  <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    Full Name *
                  </Text>
                  <Input
                    placeholder="John Doe"
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    error={getFieldError(field)}
                  />
                </View>
              )}
            />

            {/* Bio */}
            <form.Field
              name="bio"
              children={(field) => (
                <View className="mb-4">
                  <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    Bio (optional)
                  </Text>
                  <Input
                    placeholder="Tell other travelers about yourself..."
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

            {/* Current Location Header */}
            <Text className="mb-4 mt-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Current Location
            </Text>

            {/* City & Country */}
            <View className="mb-4 flex-row gap-2">
              <form.Field
                name="current_city"
                children={(field) => (
                  <View className="flex-1">
                    <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                      City *
                    </Text>
                    <Input
                      placeholder="Barcelona"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      error={getFieldError(field)}
                    />
                  </View>
                )}
              />

              <form.Field
                name="current_country"
                children={(field) => (
                  <View className="flex-1">
                    <Text className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                      Country *
                    </Text>
                    <Input
                      placeholder="Spain"
                      value={field.state.value}
                      onChangeText={field.handleChange}
                      onBlur={field.handleBlur}
                      error={getFieldError(field)}
                    />
                  </View>
                )}
              />
            </View>

            {/* Submit Button */}
            <form.Subscribe
              selector={(state) => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <Button
                  label="Save Changes"
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
