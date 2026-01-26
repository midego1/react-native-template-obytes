import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { ChatScreen } from '@/features/chat/chat-screen';

export default function ChatRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          Invalid conversation
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

  return (
    <View style={{ flex: 1 }}>
      <ChatScreen conversationId={id} />
    </View>
  );
}
