import type { RegisterFormProps } from './components/register-form';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert } from 'react-native';
import { FocusAwareStatusBar } from '@/components/ui';
import { registerWithEmail } from '@/lib/auth/supabase-auth';
import { RegisterForm } from './components/register-form';

export function RegisterScreen() {
  const router = useRouter();

  const onSubmit: RegisterFormProps['onSubmit'] = async (data) => {
    try {
      // Register with Supabase and create profile
      await registerWithEmail({
        email: data.email,
        password: data.password,
        fullName: data.full_name,
        profileData: {
          current_city: data.current_city,
          current_country: data.current_country,
          bio: data.bio || undefined,
        },
      });

      // Show success message
      Alert.alert(
        'Success!',
        'Your account has been created. Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/'),
          },
        ],
      );
    }
    catch (error: any) {
      // Handle registration errors
      const errorMessage = error?.message || 'Failed to create account. Please try again.';
      Alert.alert('Registration Error', errorMessage);
      if (__DEV__) {
        console.error('Registration error:', error);
      }
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <RegisterForm onSubmit={onSubmit} />
    </>
  );
}
