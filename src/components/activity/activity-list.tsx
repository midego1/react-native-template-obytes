import { FlatList, RefreshControl, View } from 'react-native';
import { ActivityCard } from './activity-card';
import { Text } from '@/components/ui';
import type { Activity } from '@/types/activity';

interface ActivityListProps {
  activities: Activity[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: React.ReactElement;
}

export function ActivityList({
  activities,
  isLoading = false,
  isRefreshing = false,
  onRefresh,
  ListEmptyComponent,
}: ActivityListProps) {
  if (isLoading && !isRefreshing && activities.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-gray-500 dark:text-gray-400">Loading activities...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activities}
      renderItem={({ item }) => <ActivityCard activity={item} />}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        padding: 16,
        flexGrow: 1,
      }}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      ListEmptyComponent={
        ListEmptyComponent || (
          <View className="flex-1 items-center justify-center p-8">
            <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
              No activities yet
            </Text>
            <Text className="text-center text-gray-500 dark:text-gray-400">
              Be the first to create an activity!
            </Text>
          </View>
        )
      }
      showsVerticalScrollIndicator={false}
    />
  );
}
