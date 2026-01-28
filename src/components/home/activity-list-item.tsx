import type { Activity } from '@/types/activity';
import { router } from 'expo-router';
import * as React from 'react';

import { Pressable } from 'react-native';
import { ACTIVITY_CATEGORIES } from '@/types/activity';

import { Image, Text, View } from '../ui';
import { AttendeeStack } from './attendee-stack';

type ActivityListItemProps = {
  activity: Activity;
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday)
    return 'Today';
  if (isTomorrow)
    return 'Tomorrow';

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
  const category = ACTIVITY_CATEGORIES.find(
    c => c.value === activity.category,
  );
  const emoji = category?.emoji || '📍';

  // Get attendee avatars (mock for now - would come from activity.attendees)
  const attendeeAvatars: string[] = activity.host?.avatar_url
    ? [activity.host.avatar_url]
    : [];

  return (
    <Pressable
      onPress={() => router.push(`/activity/${activity.id}`)}
      className="mx-4 mb-3 flex-row items-center rounded-xl bg-white px-4 py-3 shadow-sm active:opacity-80"
    >
      {/* Left: Emoji/Avatar */}
      <View className="mr-3">
        {activity.host?.avatar_url
          ? (
              <View className="relative">
                <Image
                  source={{ uri: activity.host.avatar_url }}
                  className="size-12 rounded-xl"
                  contentFit="cover"
                />
                <View className="absolute -right-1 -bottom-1 rounded-full bg-white p-0.5">
                  <Text className="text-xs">{emoji}</Text>
                </View>
              </View>
            )
          : (
              <View className="size-12 items-center justify-center rounded-xl bg-gray-100">
                <Text className="text-2xl">{emoji}</Text>
              </View>
            )}
      </View>

      {/* Middle: Content */}
      <View className="flex-1">
        <Text
          className="text-base font-semibold text-gray-900"
          numberOfLines={1}
        >
          {activity.title}
        </Text>
        <View className="mt-1 flex-row items-center">
          <Text className="text-sm text-gray-500">🕐</Text>
          <Text className="ml-1 text-sm text-gray-500">
            {formatDate(activity.starts_at)}
          </Text>
        </View>
      </View>

      {/* Right: Attendees and Arrow */}
      <View className="flex-row items-center">
        <AttendeeStack
          avatars={attendeeAvatars}
          totalCount={activity.attendee_count || 0}
        />
        <Text className="ml-2 text-xl text-gray-300">›</Text>
      </View>
    </Pressable>
  );
}
