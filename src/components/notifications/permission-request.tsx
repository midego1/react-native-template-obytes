import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';

type PermissionRequestProps = {
  onRequestPermission: () => void;
  onDismiss: () => void;
};

export function PermissionRequest({ onRequestPermission, onDismiss }: PermissionRequestProps) {
  return (
    <View className="m-4 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
      <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
        Stay Connected
      </Text>
      <Text className="mb-6 text-gray-600 dark:text-gray-300">
        Enable notifications to get updates about messages, crew requests, and activity invites.
      </Text>

      <View className="gap-2">
        <Pressable
          onPress={onRequestPermission}
          className="items-center rounded-full bg-indigo-500 py-3 active:opacity-80 dark:bg-indigo-600"
        >
          <Text className="font-semibold text-white">Enable Notifications</Text>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          className="items-center rounded-full bg-gray-200 py-3 active:opacity-80 dark:bg-gray-700"
        >
          <Text className="font-semibold text-gray-900 dark:text-gray-100">Not Now</Text>
        </Pressable>
      </View>
    </View>
  );
}
