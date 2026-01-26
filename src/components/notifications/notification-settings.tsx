import { Switch, View } from 'react-native';
import { Text } from '@/components/ui';
import { usePushNotifications } from '@/hooks/use-push-notifications';

export function NotificationSettings() {
  const { permissionStatus, requestPermissions } = usePushNotifications();

  const isEnabled = permissionStatus === 'granted';

  const handleToggle = async () => {
    if (permissionStatus === 'undetermined' || permissionStatus === 'denied') {
      await requestPermissions();
    }
  };

  return (
    <View className="rounded-xl bg-white p-4 dark:bg-gray-800">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="mb-1 font-semibold text-gray-900 dark:text-gray-100">
            Push Notifications
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            Get notified about messages, crew requests, and activities
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: '#d1d5db', true: '#6366f1' }}
          thumbColor="#ffffff"
        />
      </View>

      {permissionStatus === 'denied' && (
        <View className="mt-3 rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/30">
          <Text className="text-sm text-yellow-700 dark:text-yellow-300">
            Notifications are disabled. Please enable them in your device settings.
          </Text>
        </View>
      )}
    </View>
  );
}
