import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useCreateConversation } from '@/api/chat/use-create-conversation';
import { useCrewConnectionStatus } from '@/api/crew/use-crew-connection-status';
import { useSendCrewRequest } from '@/api/crew/use-send-crew-request';
import { Text } from '@/components/ui';
import { supabase } from '@/lib/supabase';

type CrewActionButtonProps = {
  userId: string;
};

export function CrewActionButton({ userId }: CrewActionButtonProps) {
  const { data: status, isLoading } = useCrewConnectionStatus(userId);
  const { mutate: sendRequest, isPending } = useSendCrewRequest();
  const { mutate: createConversation, isPending: isCreatingConversation }
    = useCreateConversation();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  if (isLoading || !currentUserId)
    return null;

  // Don't show button on own profile
  if (currentUserId === userId)
    return null;

  const handleMessage = () => {
    createConversation(userId, {
      onSuccess: (conversation) => {
        router.push(`/chats/${conversation.id}`);
      },
    });
  };

  if (status === 'none') {
    return (
      <Pressable
        onPress={() => sendRequest(userId)}
        disabled={isPending}
        className="mt-4 mx-6 items-center rounded-full bg-indigo-500 py-3 active:opacity-80 dark:bg-indigo-600"
      >
        <Text className="font-semibold text-white">
          {isPending ? 'Sending...' : 'Add to Crew'}
        </Text>
      </Pressable>
    );
  }

  if (status === 'pending_sent') {
    return (
      <Pressable
        disabled
        className="mt-4 mx-6 items-center rounded-full bg-gray-300 py-3 dark:bg-gray-700"
      >
        <Text className="font-semibold text-gray-600 dark:text-gray-300">Request Sent</Text>
      </Pressable>
    );
  }

  if (status === 'pending_received') {
    return (
      <Pressable
        disabled
        className="mt-4 mx-6 items-center rounded-full bg-yellow-500 py-3 dark:bg-yellow-600"
      >
        <Text className="font-semibold text-white">Request Pending</Text>
      </Pressable>
    );
  }

  if (status === 'accepted') {
    return (
      <View className="mx-6 mt-4 gap-2">
        <View className="flex-row items-center justify-center gap-2 rounded-full bg-green-500 py-3 dark:bg-green-600">
          <Text className="font-semibold text-white">✓ In Your Crew</Text>
        </View>
        <Pressable
          onPress={handleMessage}
          disabled={isCreatingConversation}
          className="items-center rounded-full bg-indigo-500 py-3 active:opacity-80 dark:bg-indigo-600"
        >
          <Text className="font-semibold text-white">
            {isCreatingConversation ? 'Opening chat...' : 'Send Message'}
          </Text>
        </Pressable>
      </View>
    );
  }

  return null;
}
