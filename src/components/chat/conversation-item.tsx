import type { Conversation } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';
import { Image, Pressable, View } from 'react-native';
import { Text } from '@/components/ui';
import { UnreadBadge } from './unread-badge';

type ConversationItemProps = {
  conversation: Conversation;
};

export function ConversationItem({ conversation }: ConversationItemProps) {
  const title
    = conversation.type === 'direct'
      ? conversation.other_participant?.full_name || 'Unknown'
      : conversation.activity_title || 'Group Chat';

  const avatarUrl = conversation.other_participant?.avatar_url;

  const initials = title
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const lastMessageText = conversation.last_message?.content || 'No messages yet';
  const lastMessageTime = conversation.last_message
    ? formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })
    : '';

  return (
    <Pressable
      onPress={() => router.push(`/chats/${conversation.id}`)}
      className="mb-2 flex-row items-center rounded-xl bg-white p-4 active:opacity-80 dark:bg-gray-800"
    >
      {/* Avatar */}
      <View className="relative">
        {avatarUrl
          ? (
              <Image source={{ uri: avatarUrl }} className="h-14 w-14 rounded-full" />
            )
          : (
              <View className="h-14 w-14 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <Text className="text-lg font-bold text-indigo-600 dark:text-indigo-300">
                  {initials}
                </Text>
              </View>
            )}
        {(conversation.unread_count ?? 0) > 0 && (
          <UnreadBadge count={conversation.unread_count!} />
        )}
      </View>

      {/* Content */}
      <View className="ml-3 flex-1">
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="flex-1 font-semibold text-gray-900 dark:text-gray-100" numberOfLines={1}>
            {title}
          </Text>
          {lastMessageTime && (
            <Text className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {lastMessageTime}
            </Text>
          )}
        </View>
        <Text
          className={`text-sm ${
            conversation.unread_count && conversation.unread_count > 0
              ? 'font-semibold text-gray-900 dark:text-gray-100'
              : 'text-gray-600 dark:text-gray-300'
          }`}
          numberOfLines={1}
        >
          {lastMessageText}
        </Text>
      </View>
    </Pressable>
  );
}
