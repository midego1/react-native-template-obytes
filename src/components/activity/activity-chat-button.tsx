import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { useActivityConversation } from '@/api/chat/use-activity-conversation';
import { Text } from '@/components/ui';

type ActivityChatButtonProps = {
  activityId: string;
};

export function ActivityChatButton({ activityId }: ActivityChatButtonProps) {
  const { data: conversation, isLoading, error } = useActivityConversation(activityId);

  if (isLoading)
    return null;

  // Log error for debugging
  if (error) {
    console.error('[ActivityChatButton] Error fetching conversation:', error);
  }

  // User is not attending - don't show chat button
  if (!conversation) {
    console.log('[ActivityChatButton] No conversation for activity:', activityId);
    return null;
  }

  console.log('[ActivityChatButton] Showing chat button for conversation:', conversation.id);

  const handlePress = () => {
    router.push(`/chats/${conversation.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="items-center rounded-full bg-indigo-500 px-6 py-4 active:opacity-80 dark:bg-indigo-600"
    >
      <Text className="text-lg font-bold text-white">Open Group Chat</Text>
    </Pressable>
  );
}
