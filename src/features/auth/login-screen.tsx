import type { LoginFormProps } from './components/login-form';
import { useRouter } from 'expo-router';

import * as React from 'react';
import { Alert } from 'react-native';
import { FocusAwareStatusBar } from '@/components/ui';
import { LoginForm } from './components/login-form';
import { loginWithEmail } from '@/lib/auth/supabase-auth';

export function LoginScreen() {
  const router = useRouter();

  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    try {
      // Login with Supabase
      await loginWithEmail(data.email, data.password);

      // Navigate to home on success
      router.push('/');
    } catch (error: any) {
      // Handle authentication errors
      const errorMessage = error?.message || 'Failed to login. Please try again.';
      Alert.alert('Login Error', errorMessage);
      console.error('Login error:', error);
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} />
    </>
  );
}
