import { router } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';
import { useActivities } from '@/api/activities/use-activities';
import { ActivityList } from '@/components/activity/activity-list';
import { FocusAwareStatusBar, Text, View } from '@/components/ui';

export function FeedScreen() {
  const { data, isPending, isError, refetch, isRefetching } = useActivities({
    status: 'active',
    limit: 50,
  });

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          Oops! Something went wrong
        </Text>
        <Text className="text-center text-gray-500 dark:text-gray-400">
          Failed to load activities. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FocusAwareStatusBar />

      {/* Header */}
      <View className="bg-white px-4 pb-4 pt-12 shadow-sm dark:bg-gray-800 dark:shadow-gray-700">
        <Text className="text-3xl font-bold text-gray-900 dark:text-gray-100">Activities</Text>
        <Text className="mt-1 text-gray-500 dark:text-gray-400">
          {data?.count || 0}
          {' '}
          {data?.count === 1 ? 'activity' : 'activities'}
          {' '}
          near you
        </Text>
      </View>

      {/* Activity List */}
      <ActivityList
        activities={data?.activities || []}
        isLoading={isPending}
        isRefreshing={isRefetching}
        onRefresh={refetch}
      />

      {/* Floating Action Button */}
      <Pressable
        onPress={() => router.push('/create-activity')}
        className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-indigo-500 shadow-lg active:bg-indigo-600 dark:bg-indigo-600 dark:active:bg-indigo-700"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 8,
        }}
      >
        <Text className="text-2xl text-white">+</Text>
      </Pressable>
    </View>
  );
}
