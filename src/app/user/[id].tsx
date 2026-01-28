import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useUser } from '@/api/users/use-user';
import { Text } from '@/components/ui';
import { UserProfileScreen } from '@/features/users/user-profile-screen';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, isLoading, isError } = useUser(id || '');

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Stack.Screen options={{ title: 'Profile' }} />
        <Text className="text-gray-500 dark:text-gray-400">Loading profile...</Text>
      </View>
    );
  }

  if (isError || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
        <Stack.Screen options={{ title: 'Profile' }} />
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          User not found
        </Text>
        <Text className="mb-4 text-center text-gray-500 dark:text-gray-400">
          This user may not exist or their profile is unavailable.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="rounded-full bg-indigo-500 px-6 py-3 dark:bg-indigo-600"
        >
          <Text className="font-semibold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: user.full_name }} />
      <UserProfileScreen user={user} />
    </>
  );
}
