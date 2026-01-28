import { View } from 'react-native';
import { Text } from '@/components/ui';

/**
 * Web fallback for chat screen
 * GiftedChat doesn't work well on web, show a message instead
 */
export function ChatScreenWebFallback() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
      <Text className="mb-4 text-center text-xl font-bold text-gray-900 dark:text-gray-100">
        Chat on Mobile
      </Text>
      <Text className="text-center text-gray-600 dark:text-gray-300">
        The chat interface is optimized for mobile devices. Please use the iOS or Android app to
        access messaging features.
      </Text>
      <View className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
        <Text className="text-sm text-blue-700 dark:text-blue-300">
          💡 Tip: For development, use the iOS Simulator or Android Emulator for full chat
          functionality.
        </Text>
      </View>
    </View>
  );
}
