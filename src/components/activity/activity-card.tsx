import type { Activity } from '@/types/activity';
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { ACTIVITY_CATEGORIES } from '@/types/activity';

type ActivityCardProps = {
  activity: Activity;
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const category = ACTIVITY_CATEGORIES.find(c => c.value === activity.category);
  const isHappeningNow = activity.is_happening_now;
  const startDate = new Date(activity.starts_at);

  // Format the start time
  const formatStartTime = () => {
    if (isToday(startDate)) {
      return `Today ${format(startDate, 'h:mm a')}`;
    }
    if (isTomorrow(startDate)) {
      return `Tomorrow ${format(startDate, 'h:mm a')}`;
    }
    return format(startDate, 'MMM d, h:mm a');
  };

  const handlePress = () => {
    router.push(`/activity/${activity.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="mb-3 rounded-xl bg-white px-4 py-3 shadow-sm active:opacity-80 dark:bg-gray-800 dark:shadow-gray-700"
    >
      {/* Line 1: Category emoji + Title + Badge */}
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="flex-1 text-base font-bold text-gray-900 dark:text-gray-100" numberOfLines={1}>
          {category?.emoji}
          {' '}
          {activity.title}
        </Text>

        {isHappeningNow && (
          <View className="ml-2 rounded-full bg-red-100 px-2 py-0.5 dark:bg-red-900">
            <Text className="text-xs font-semibold text-red-600 dark:text-red-300">
              🔥 Now
            </Text>
          </View>
        )}
      </View>

      {/* Line 2: Host · Start time · Relative time */}
      <View className="mb-1 flex-row items-center">
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            if (activity.host_id) {
              router.push(`/user/${activity.host_id}`);
            }
          }}
        >
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            {activity.host?.full_name || 'Unknown Host'}
          </Text>
        </Pressable>
        <Text className="text-xs text-gray-400 dark:text-gray-500"> · </Text>
        <Text className="text-xs text-gray-600 dark:text-gray-400">
          {formatStartTime()}
        </Text>
        {!isHappeningNow && (
          <>
            <Text className="text-xs text-gray-400 dark:text-gray-500"> · </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(startDate, { addSuffix: true })}
            </Text>
          </>
        )}
      </View>

      {/* Line 3: Description */}
      {activity.description && (
        <Text className="mb-1 text-sm text-gray-600 dark:text-gray-400" numberOfLines={1}>
          {activity.description}
        </Text>
      )}

      {/* Line 4: Location · Attendee count */}
      <View className="flex-row items-center">
        <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
          📍 {activity.location_name}
        </Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500"> · </Text>
        <Text className="text-xs text-gray-600 dark:text-gray-400">
          {activity.attendee_count || 0}/{activity.max_attendees || '∞'} going
        </Text>
      </View>
    </Pressable>
  );
}
