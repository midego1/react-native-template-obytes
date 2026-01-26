import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import * as z from 'zod';
import { Button, Input, Text, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';

const schema = z.object({
  full_name: z
    .string({
      message: 'Full name is required',
    })
    .min(2, 'Full name must be at least 2 characters'),
  email: z
    .string({
      message: 'Email is required',
    })
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string({
      message: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters'),
  current_city: z
    .string({
      message: 'City is required',
    })
    .min(1, 'City is required'),
  current_country: z
    .string({
      message: 'Country is required',
    })
    .min(1, 'Country is required'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export type FormType = z.infer<typeof schema>;

export type RegisterFormProps = {
  onSubmit?: (data: FormType) => void;
};

// eslint-disable-next-line max-lines-per-function
export function RegisterForm({ onSubmit = () => {} }: RegisterFormProps) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      current_city: '',
      current_country: '',
      bio: '',
    },
    validators: {
      onChange: schema as any,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={10}>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 p-4 pt-12">
          {/* Header */}
          <View className="mb-8 items-center">
            <Text className="mb-2 text-center text-4xl font-bold text-gray-900 dark:text-gray-100">
              Join CityCrew
            </Text>
            <Text className="max-w-xs text-center text-gray-500 dark:text-gray-400">
              Connect with fellow travelers and discover activities around the world
            </Text>
          </View>

          {/* Full Name */}
          <form.Field
            name="full_name"
            children={field => (
              <View className="mb-4">
                <Input
                  testID="full-name-input"
                  label="Full Name *"
                  placeholder="John Doe"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  error={getFieldError(field)}
                />
              </View>
            )}
          />

          {/* Email */}
          <form.Field
            name="email"
            children={field => (
              <View className="mb-4">
                <Input
                  testID="email-input"
                  label="Email *"
                  placeholder="john@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  error={getFieldError(field)}
                />
              </View>
            )}
          />

          {/* Password */}
          <form.Field
            name="password"
            children={field => (
              <View className="mb-4">
                <Input
                  testID="password-input"
                  label="Password *"
                  placeholder="Minimum 6 characters"
                  secureTextEntry={true}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  error={getFieldError(field)}
                />
              </View>
            )}
          />

          {/* Location Header */}
          <Text className="mb-4 mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Where are you currently?
          </Text>

          {/* City & Country */}
          <View className="mb-4 flex-row gap-2">
            <form.Field
              name="current_city"
              children={field => (
                <View className="flex-1">
                  <Input
                    testID="city-input"
                    label="City *"
                    placeholder="Barcelona"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    error={getFieldError(field)}
                  />
                </View>
              )}
            />

            <form.Field
              name="current_country"
              children={field => (
                <View className="flex-1">
                  <Input
                    testID="country-input"
                    label="Country *"
                    placeholder="Spain"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    error={getFieldError(field)}
                  />
                </View>
              )}
            />
          </View>

          {/* Bio */}
          <form.Field
            name="bio"
            children={field => (
              <View className="mb-6">
                <Input
                  testID="bio-input"
                  label="Bio (optional)"
                  placeholder="Tell other travelers about yourself..."
                  multiline
                  numberOfLines={4}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChangeText={field.handleChange}
                  error={getFieldError(field)}
                />
              </View>
            )}
          />

          {/* Submit Button */}
          <form.Subscribe
            selector={state => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <Button
                testID="register-button"
                label="Create Account"
                onPress={form.handleSubmit}
                loading={isSubmitting}
                className="mb-4"
              />
            )}
          />

          {/* Login Link */}
          <View className="mb-8 flex-row items-center justify-center">
            <Text className="text-gray-600 dark:text-gray-400">Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text className="font-semibold text-indigo-600 dark:text-indigo-400">Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
