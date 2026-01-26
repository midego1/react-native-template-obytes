import { format } from 'date-fns';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useActivity } from '@/api/activities/use-activity';
import { useAttendeeStatus } from '@/api/activities/use-attendee-status';
import { useJoinActivity } from '@/api/activities/use-join-activity';
import { useLeaveActivity } from '@/api/activities/use-leave-activity';
import { ActivityChatButton } from '@/components/activity/activity-chat-button';
import { Text } from '@/components/ui';
import { ACTIVITY_CATEGORIES } from '@/types/activity';

// eslint-disable-next-line max-lines-per-function
export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: activity, isLoading, isError } = useActivity(id || '');
  const { data: attendeeStatus } = useAttendeeStatus(id || '');
  const { mutate: joinActivity, isPending: isJoining } = useJoinActivity();
  const { mutate: leaveActivity, isPending: isLeaving } = useLeaveActivity();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">Loading activity...</Text>
      </View>
    );
  }

  if (isError || !activity) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          Activity not found
        </Text>
        <Text className="mb-4 text-center text-gray-500 dark:text-gray-400">
          This activity may have been removed or doesn't exist.
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

  const category = ACTIVITY_CATEGORIES.find(c => c.value === activity.category);
  const isHappeningNow = activity.is_happening_now;
  const isFull
    = activity.max_attendees && activity.attendee_count
      ? activity.attendee_count >= activity.max_attendees
      : false;

  const isHost = attendeeStatus?.isHost || false;
  const isAttending = attendeeStatus?.isAttending || false;
  const isPast = new Date(activity.starts_at) < new Date();

  const handleJoinActivity = () => {
    if (!id)
      return;

    joinActivity(id, {
      onSuccess: () => {
        Alert.alert('Success', 'You have joined this activity!');
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message || 'Failed to join activity');
      },
    });
  };

  const handleLeaveActivity = () => {
    if (!id)
      return;

    Alert.alert(
      'Leave Activity',
      'Are you sure you want to leave this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveActivity(id, {
              onSuccess: () => {
                Alert.alert('Success', 'You have left this activity');
              },
              onError: (error: any) => {
                Alert.alert('Error', error.message || 'Failed to leave activity');
              },
            });
          },
        },
      ],
    );
  };

  const getButtonConfig = () => {
    if (isHost) {
      return {
        label: 'You\'re hosting this',
        disabled: true,
        onPress: () => {},
        className: 'bg-gray-300 dark:bg-gray-600',
      };
    }

    if (isPast) {
      return {
        label: 'Activity has passed',
        disabled: true,
        onPress: () => {},
        className: 'bg-gray-300 dark:bg-gray-600',
      };
    }

    if (isAttending) {
      return {
        label: 'Leave Activity',
        disabled: isLeaving,
        onPress: handleLeaveActivity,
        className: 'bg-red-500 active:bg-red-600 dark:bg-red-600 dark:active:bg-red-700',
      };
    }

    if (isFull) {
      return {
        label: 'Activity Full',
        disabled: true,
        onPress: () => {},
        className: 'bg-gray-300 dark:bg-gray-600',
      };
    }

    return {
      label: 'Join Activity',
      disabled: isJoining,
      onPress: handleJoinActivity,
      className: 'bg-indigo-500 active:bg-indigo-600 dark:bg-indigo-600 dark:active:bg-indigo-700',
    };
  };

  const buttonConfig = getButtonConfig();

  return (
    <>
      <Stack.Screen
        options={{
          title: activity.title,
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header Card */}
        <View className="bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-700">
          {/* Happening Now Badge */}
          {isHappeningNow && (
            <View className="mb-4 self-start rounded-full bg-red-100 px-4 py-2 dark:bg-red-900">
              <Text className="text-sm font-semibold text-red-600 dark:text-red-300">
                🔥 Happening Now
              </Text>
            </View>
          )}

          {/* Title */}
          <Text className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {activity.title}
          </Text>

          {/* Category */}
          {category && (
            <View className="mb-4 self-start rounded-full bg-indigo-100 px-4 py-2 dark:bg-indigo-900">
              <Text className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                {category.emoji}
                {' '}
                {category.label}
              </Text>
            </View>
          )}

          {/* Description */}
          {activity.description && (
            <Text className="mb-4 text-base leading-6 text-gray-700 dark:text-gray-300">
              {activity.description}
            </Text>
          )}
        </View>

        {/* Details Section */}
        <View className="mt-4 bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-700">
          <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">Details</Text>

          {/* Time */}
          <View className="mb-4 flex-row">
            <Text className="w-24 text-gray-500 dark:text-gray-400">When:</Text>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 dark:text-gray-100">
                {format(new Date(activity.starts_at), 'EEEE, MMMM d, yyyy')}
              </Text>
              <Text className="text-gray-600 dark:text-gray-300">
                {format(new Date(activity.starts_at), 'h:mm a')}
                {activity.ends_at
                  && ` - ${format(new Date(activity.ends_at), 'h:mm a')}`}
              </Text>
              {activity.is_flexible_time && (
                <Text className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  ⏰ Flexible timing
                </Text>
              )}
            </View>
          </View>

          {/* Location */}
          <View className="mb-4 flex-row">
            <Text className="w-24 text-gray-500 dark:text-gray-400">Where:</Text>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 dark:text-gray-100">
                {activity.location_name}
              </Text>
              {activity.location_address && (
                <Text className="text-gray-600 dark:text-gray-300">{activity.location_address}</Text>
              )}
              <Text className="text-gray-600 dark:text-gray-300">
                {activity.city}
                ,
                {activity.country}
              </Text>
            </View>
          </View>

          {/* Attendees */}
          <View className="flex-row">
            <Text className="w-24 text-gray-500 dark:text-gray-400">Who:</Text>
            <View className="flex-1">
              <Text className="font-semibold text-gray-900 dark:text-gray-100">
                {activity.attendee_count || 0}
                {' '}
                {activity.attendee_count === 1 ? 'person' : 'people'}
                {' '}
                going
              </Text>
              {activity.max_attendees && (
                <Text className="text-gray-600 dark:text-gray-300">
                  Max
                  {' '}
                  {activity.max_attendees}
                  {' '}
                  attendees
                  {isFull && ' • Full'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Host Section */}
        {activity.host && (
          <Pressable
            onPress={() => router.push(`/user/${activity.host_id}`)}
            className="mt-4 bg-white p-6 shadow-sm active:opacity-80 dark:bg-gray-800 dark:shadow-gray-700"
          >
            <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
              Hosted by
            </Text>

            <View className="flex-row items-center">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <Text className="text-xl font-bold text-indigo-600 dark:text-indigo-300">
                  {activity.host.full_name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View className="ml-4 flex-1">
                <Text className="font-semibold text-gray-900 dark:text-gray-100">
                  {activity.host.full_name}
                </Text>
                {activity.host.current_city && (
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    From
                    {' '}
                    {activity.host.current_city}
                    {activity.host.current_country
                      && `, ${activity.host.current_country}`}
                  </Text>
                )}
              </View>
            </View>

            {activity.host.bio && (
              <Text className="mt-4 text-gray-600 dark:text-gray-300">{activity.host.bio}</Text>
            )}
          </Pressable>
        )}

        {/* Attendees Section */}
        {activity.attendees && activity.attendees.filter((a: any) => a.status === 'joined').length > 0 && (
          <View className="mt-4 bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-700">
            <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
              Who's Going ({activity.attendees.filter((a: any) => a.status === 'joined').length})
            </Text>

            {activity.attendees
              .filter((a: any) => a.status === 'joined')
              .map((attendee: any) => (
                <Pressable
                  key={attendee.id}
                  onPress={() => router.push(`/user/${attendee.user_id}`)}
                  className="mb-3 flex-row items-center active:opacity-80"
                >
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <Text className="text-lg font-bold text-gray-600 dark:text-gray-300">
                      {attendee.user?.full_name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>

                  <View className="ml-4 flex-1">
                    <Text className="font-semibold text-gray-900 dark:text-gray-100">
                      {attendee.user?.full_name || 'Unknown User'}
                    </Text>
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      Joined {format(new Date(attendee.joined_at), 'MMM d, yyyy')}
                    </Text>
                  </View>
                </Pressable>
              ))}
          </View>
        )}

        {/* Bottom padding */}
        <View className="h-24" />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View className="border-t border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:shadow-gray-700">
        {/* Show chat button for attendees and host */}
        {(isAttending || isHost) && (
          <View className="mb-3">
            <ActivityChatButton activityId={id || ''} />
          </View>
        )}

        {/* Main action button */}
        <Pressable
          disabled={buttonConfig.disabled}
          onPress={buttonConfig.onPress}
          className={`items-center justify-center rounded-full py-4 ${buttonConfig.className}`}
        >
          <Text className="text-lg font-bold text-white">
            {buttonConfig.label}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
