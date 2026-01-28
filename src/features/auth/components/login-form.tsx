import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { KeyboardAvoidingView, Pressable } from 'react-native';
import * as z from 'zod';

import { Button, Input, Text, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';

const schema = z.object({
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
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: (data: FormType) => void;
};

// eslint-disable-next-line max-lines-per-function
export function LoginForm({ onSubmit = () => {} }: LoginFormProps) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onChange: schema as any,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center p-4">
        <View className="items-center justify-center">
          <Text
            testID="form-title"
            className="pb-6 text-center text-4xl font-bold text-gray-900 dark:text-gray-100"
          >
            Welcome Back
          </Text>

          <Text className="mb-6 max-w-xs text-center text-gray-500 dark:text-gray-400">
            Sign in to continue exploring activities and connecting with travelers
          </Text>
        </View>

        <form.Field
          name="email"
          children={field => (
            <Input
              testID="email-input"
              label="Email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        <form.Field
          name="password"
          children={field => (
            <Input
              testID="password-input"
              label="Password"
              placeholder="***"
              secureTextEntry={true}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        <form.Subscribe
          selector={state => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button
              testID="login-button"
              label="Sign In"
              onPress={form.handleSubmit}
              loading={isSubmitting}
              className="mb-4"
            />
          )}
        />

        {/* Register Link */}
        <View className="flex-row items-center justify-center">
          <Text className="text-gray-600 dark:text-gray-400">Don't have an account? </Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text className="font-semibold text-indigo-600 dark:text-indigo-400">Create Account</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
