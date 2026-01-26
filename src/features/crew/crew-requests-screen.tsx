import { ScrollView, View } from 'react-native';
import { useCrewRequests } from '@/api/crew/use-crew-requests';
import { CrewRequestCard } from '@/components/crew/crew-request-card';
import { Text } from '@/components/ui';

export function CrewRequestsScreen() {
  const { data: requests, isLoading } = useCrewRequests();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">Loading requests...</Text>
      </View>
    );
  }

  const hasRequests
    = requests && (requests.received.length > 0 || requests.sent.length > 0);

  if (!hasRequests) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
        <Text className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-gray-100">
          No pending requests
        </Text>
        <Text className="text-center text-gray-600 dark:text-gray-300">
          You don't have any crew requests at the moment.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        {/* Received Requests */}
        {requests.received.length > 0 && (
          <View className="mb-6">
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
          <View>
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
    </ScrollView>
  );
}
