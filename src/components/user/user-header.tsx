import type { User } from '@/types/user';
import { Image, View } from 'react-native';
import { Text } from '@/components/ui';

type UserHeaderProps = {
  user: User;
};

export function UserHeader({ user }: UserHeaderProps) {
  const initials = user.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View className="items-center border-b border-gray-200 bg-white px-6 pb-6 pt-4 dark:border-gray-700 dark:bg-gray-800">
      {/* Avatar */}
      <View className="mb-4">
        {user.avatar_url
          ? (
              <Image
                source={{ uri: user.avatar_url }}
                className="h-24 w-24 rounded-full"
              />
            )
          : (
              <View className="h-24 w-24 items-center justify-center rounded-full bg-indigo-500 dark:bg-indigo-600">
                <Text className="text-3xl font-bold text-white">{initials}</Text>
              </View>
            )}
      </View>

      {/* Name */}
      <Text className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {user.full_name}
      </Text>

      {/* Username */}
      {user.username && (
        <Text className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          @
          {user.username}
        </Text>
      )}

      {/* Location */}
      {user.current_city && (
        <Text className="text-sm text-gray-600 dark:text-gray-300">
          {user.current_city}
          {user.current_country && `, ${user.current_country}`}
        </Text>
      )}
    </View>
  );
}
