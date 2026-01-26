import { FlatList, View } from 'react-native';
import { useConversations } from '@/api/chat/use-conversations';
import { ConversationItem } from '@/components/chat/conversation-item';
import { Text } from '@/components/ui';

export function ConversationsScreen() {
  const { data: conversations, isLoading } = useConversations();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">Loading conversations...</Text>
      </View>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
        <Text className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-gray-100">
          No conversations yet
        </Text>
        <Text className="text-center text-gray-600 dark:text-gray-300">
          Start a conversation with a crew member or join an activity to chat with the group.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ConversationItem conversation={item} />}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}
