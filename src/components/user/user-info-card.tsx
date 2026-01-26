import type { UserProfile } from '@/types/user';
import { View } from 'react-native';
import { Text } from '@/components/ui';

type UserInfoCardProps = {
  user: UserProfile;
};

export function UserInfoCard({ user }: UserInfoCardProps) {
  return (
    <View className="gap-4 p-6">
      {/* Bio */}
      {user.bio && (
        <View>
          <Text className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            About
          </Text>
          <Text className="text-base text-gray-700 dark:text-gray-300">
            {user.bio}
          </Text>
        </View>
      )}

      {/* Stats */}
      <View>
        <Text className="mb-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          Activity
        </Text>
        <View className="flex-row justify-around rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <View className="items-center">
            <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {user.activities_hosted || 0}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              Hosted
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {user.activities_attended || 0}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              Attended
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {user.crew_count || 0}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              Crew
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
