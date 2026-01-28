import * as React from 'react';
import { Pressable } from 'react-native';

import { FocusAwareStatusBar, Text, View } from '../ui';

type ErrorViewProps = {
  onRetry: () => void;
};

export function ErrorView({ onRetry }: ErrorViewProps) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
      <FocusAwareStatusBar />
      <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
        Oops! Something went wrong
      </Text>
      <Text className="text-center text-gray-500 dark:text-gray-400">
        Failed to load activities. Please try again.
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-4 rounded-lg bg-pink-500 px-6 py-3"
      >
        <Text className="font-semibold text-white">Retry</Text>
      </Pressable>
    </View>
  );
}
