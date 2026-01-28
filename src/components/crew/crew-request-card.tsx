import type { CrewRequest, CrewRequestType } from '@/types/crew';
import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { useAcceptCrewRequest } from '@/api/crew/use-accept-crew-request';
import { useDeclineCrewRequest } from '@/api/crew/use-decline-crew-request';
import { Text } from '@/components/ui';

type CrewRequestCardProps = {
  request: CrewRequest;
  type: CrewRequestType;
};

export function CrewRequestCard({ request, type }: CrewRequestCardProps) {
  const { mutate: acceptRequest, isPending: isAccepting } = useAcceptCrewRequest();
  const { mutate: declineRequest, isPending: isDeclining } = useDeclineCrewRequest();

  const otherUser = type === 'received' ? request.requester : request.addressee;
  if (!otherUser)
    return null;

  const initials = otherUser.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Pressable
      onPress={() => router.push(`/user/${otherUser.id}`)}
      className="mb-3 rounded-xl bg-white p-4 active:opacity-80 dark:bg-gray-800"
    >
      <View className="mb-3 flex-row items-center">
        {/* Avatar */}
        {otherUser.avatar_url
          ? (
              <Image source={{ uri: otherUser.avatar_url }} className="h-12 w-12 rounded-full" />
            )
          : (
              <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <Text className="font-bold text-indigo-600 dark:text-indigo-300">{initials}</Text>
              </View>
            )}

        {/* Info */}
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900 dark:text-gray-100">
            {otherUser.full_name}
          </Text>
          {otherUser.current_city && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {otherUser.current_city}
              {otherUser.current_country && `, ${otherUser.current_country}`}
            </Text>
          )}
        </View>
      </View>

      {/* Actions */}
      {type === 'received'
        ? (
            <View className="flex-row gap-2">
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  acceptRequest(request.id);
                }}
                disabled={isAccepting || isDeclining}
                className="flex-1 items-center rounded-lg bg-indigo-500 py-3 active:opacity-80 dark:bg-indigo-600"
              >
                <Text className="font-semibold text-white">
                  {isAccepting ? 'Accepting...' : 'Accept'}
                </Text>
              </Pressable>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  declineRequest(request.id);
                }}
                disabled={isAccepting || isDeclining}
                className="flex-1 items-center rounded-lg bg-gray-200 py-3 active:opacity-80 dark:bg-gray-700"
              >
                <Text className="font-semibold text-gray-900 dark:text-gray-100">
                  {isDeclining ? 'Declining...' : 'Decline'}
                </Text>
              </Pressable>
            </View>
          )
        : (
            <View className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/30">
              <Text className="text-center text-sm text-yellow-700 dark:text-yellow-300">
                Request sent • Waiting for response
              </Text>
            </View>
          )}
    </Pressable>
  );
}
