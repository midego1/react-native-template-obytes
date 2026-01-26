import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { Text } from '@/components/ui';
import type { Activity } from '@/types/activity';
import { ACTIVITY_CATEGORIES } from '@/types/activity';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const category = ACTIVITY_CATEGORIES.find((c) => c.value === activity.category);
  const isHappeningNow = activity.is_happening_now;

  const handlePress = () => {
    router.push(`/activity/${activity.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="mb-4 rounded-2xl bg-white p-4 shadow-sm active:opacity-80 dark:bg-gray-800 dark:shadow-gray-700"
    >
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {activity.host?.full_name || 'Unknown Host'}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(activity.starts_at), { addSuffix: true })}
          </Text>
        </View>

        {isHappeningNow && (
          <View className="rounded-full bg-red-100 px-3 py-1 dark:bg-red-900">
            <Text className="text-xs font-semibold text-red-600 dark:text-red-300">
              🔥 Happening Now
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="mb-3">
        <Text className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">
          {activity.title}
        </Text>

        {activity.description && (
          <Text className="text-sm text-gray-600 dark:text-gray-300" numberOfLines={2}>
            {activity.description}
          </Text>
        )}
      </View>

      {/* Category & Location */}
      <View className="mb-3 flex-row items-center gap-2">
        {category && (
          <View className="rounded-full bg-indigo-100 px-3 py-1 dark:bg-indigo-900">
            <Text className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {category.emoji} {category.label}
            </Text>
          </View>
        )}

        <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
          📍 {activity.location_name}
        </Text>
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-600 dark:text-gray-300">
            {activity.attendee_count || 0}{' '}
            {activity.attendee_count === 1 ? 'person' : 'people'} going
          </Text>
          {activity.max_attendees && (
            <Text className="text-sm text-gray-400 dark:text-gray-500">
              {' '}
              · {activity.max_attendees} max
            </Text>
          )}
        </View>

        <View className="rounded-full bg-indigo-500 px-4 py-2 dark:bg-indigo-600">
          <Text className="text-sm font-semibold text-white">View</Text>
        </View>
      </View>
    </Pressable>
  );
}
