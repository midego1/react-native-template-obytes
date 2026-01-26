import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useCrewConnections } from '@/api/crew/use-crew-connections';
import { useCrewRequests } from '@/api/crew/use-crew-requests';
import { CrewMemberCard } from '@/components/crew/crew-member-card';
import { CrewRequestCard } from '@/components/crew/crew-request-card';
import { Text } from '@/components/ui';

export function CrewListScreen() {
  const { data: crew, isLoading: isLoadingCrew } = useCrewConnections();
  const { data: requests, isLoading: isLoadingRequests } = useCrewRequests();

  const isLoading = isLoadingCrew || isLoadingRequests;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">Loading crew...</Text>
      </View>
    );
  }

  const hasRequests = requests && (requests.received.length > 0 || requests.sent.length > 0);
  const hasCrew = crew && crew.length > 0;

  if (!hasRequests && !hasCrew) {
    return (
      <View className="flex-1 bg-gray-50 p-6 dark:bg-gray-900">
        <View className="flex-1 items-center justify-center">
          <Text className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-gray-100">
            No crew yet
          </Text>
          <Text className="mb-6 text-center text-gray-600 dark:text-gray-300">
            Add people to your crew to stay connected and make plans together.
          </Text>
          <Pressable
            onPress={() => router.push('/(app)')}
            className="rounded-full bg-indigo-500 px-6 py-3 dark:bg-indigo-600"
          >
            <Text className="font-semibold text-white">Find Activities</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        {/* Crew Requests Section */}
        {hasRequests && (
          <View className="mb-6">
            {/* Received Requests */}
            {requests.received.length > 0 && (
              <View className="mb-4">
                <Text className="mb-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Requests Received (
                  {requests.received.length}
                  )
                </Text>
                {requests.received.map(request => (
                  <CrewRequestCard key={request.id} request={request} type="received" />
                ))}
              </View>
            )}

            {/* Sent Requests */}
            {requests.sent.length > 0 && (
              <View className="mb-4">
                <Text className="mb-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                  Requests Sent (
                  {requests.sent.length}
                  )
                </Text>
                {requests.sent.map(request => (
                  <CrewRequestCard key={request.id} request={request} type="sent" />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Crew Members Section */}
        {hasCrew && (
          <View>
            <Text className="mb-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              My Crew (
              {crew.length}
              )
            </Text>
            {crew.map(member => (
              <CrewMemberCard key={member.id} member={member} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
