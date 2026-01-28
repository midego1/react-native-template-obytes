import { Ionicons } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';

import { useMarkAsRead } from '@/api/chat/use-mark-as-read';
import { useMessages } from '@/api/chat/use-messages';
import { useSendMessage } from '@/api/chat/use-send-message';
import { usePickAndUploadImage, useTakePhotoAndUpload } from '@/api/chat/use-upload-media';
import { Text } from '@/components/ui';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';
import { supabase } from '@/lib/supabase';
import { toGiftedChatMessage } from '@/types/chat';
import { ChatScreenWebFallback } from './chat-screen-web-fallback';

// Only import GiftedChat on native platforms
const GiftedChat = Platform.OS !== 'web'
  ? require('react-native-gifted-chat').GiftedChat
  : null;
const { Send } = Platform.OS !== 'web'
  ? require('react-native-gifted-chat')
  : { Send: null };

type IMessage = {
  _id: string | number;
  text: string;
  createdAt: Date | number;
  user: {
    _id: string | number;
    name?: string;
    avatar?: string;
  };
  image?: string;
  system?: boolean;
};

type ChatScreenProps = {
  conversationId: string;
};

export function ChatScreen({ conversationId }: ChatScreenProps) {
  // Show fallback on web
  if (Platform.OS === 'web') {
    return <ChatScreenWebFallback />;
  }

  // Get header height for keyboard offset
  const headerHeight = useHeaderHeight();

  const { data: messages, isLoading } = useMessages(conversationId);
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: markAsRead } = useMarkAsRead();

  // Media upload hooks
  const pickImage = usePickAndUploadImage();
  const takePhoto = useTakePhotoAndUpload();

  // Subscribe to real-time updates
  useRealtimeMessages(conversationId);

  // Mark conversation as read when screen is opened
  useEffect(() => {
    markAsRead(conversationId);
  }, [conversationId, markAsRead]);

  // State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });
  }, []);

  // Convert messages to GiftedChat format
  const giftedMessages: IMessage[] = useMemo(() => {
    if (!messages) return [];
    return messages.map(toGiftedChatMessage);
  }, [messages]);

  const onSend = useCallback(
    (newMessages: IMessage[]) => {
      if (newMessages.length > 0 && newMessages[0].text) {
        sendMessage({
          conversationId,
          content: newMessages[0].text,
        });
      }
    },
    [conversationId, sendMessage]
  );

  // Handle taking a photo
  const handleTakePhoto = useCallback(async () => {
    try {
      const result = await takePhoto.mutateAsync();

      sendMessage({
        conversationId,
        content: '',
        type: 'image',
        mediaUrl: result.url,
        mediaType: result.mimeType,
        fileName: result.fileName,
        fileSize: result.size,
      });
    } catch (error: any) {
      if (!error.message?.includes('cancelled')) {
        Alert.alert('Error', error.message || 'Failed to take photo');
      }
    }
  }, [conversationId, sendMessage, takePhoto]);

  // Handle picking an image
  const handlePickImage = useCallback(async () => {
    try {
      const result = await pickImage.mutateAsync();

      sendMessage({
        conversationId,
        content: '',
        type: 'image',
        mediaUrl: result.url,
        mediaType: result.mimeType,
        fileName: result.fileName,
        fileSize: result.size,
      });
    } catch (error: any) {
      if (!error.message?.includes('cancelled')) {
        Alert.alert('Error', error.message || 'Failed to pick image');
      }
    }
  }, [conversationId, sendMessage, pickImage]);

  // Handle media action button press
  const handleMediaAction = useCallback(() => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handlePickImage();
          }
        }
      );
    } else {
      Alert.alert('Send Media', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handlePickImage },
      ]);
    }
  }, [handleTakePhoto, handlePickImage]);

  // Custom actions button (+ button for media)
  const renderActions = useCallback(
    () => (
      <TouchableOpacity
        onPress={handleMediaAction}
        style={{
          marginLeft: 10,
          marginBottom: 5,
          width: 40,
          height: 40,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name="add-circle" size={32} color="#007AFF" />
      </TouchableOpacity>
    ),
    [handleMediaAction]
  );

  // Custom send button
  const renderSend = useCallback(
    (props: any) => (
      <Send
        {...props}
        containerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10,
          marginBottom: 5,
        }}
      >
        <Ionicons name="send" size={24} color="#007AFF" />
      </Send>
    ),
    []
  );

  // Custom message image renderer
  const renderMessageImage = useCallback((props: any) => {
    const { currentMessage } = props;
    if (!currentMessage?.image) return null;

    return (
      <View style={{ borderRadius: 13, padding: 2 }}>
        <Image
          source={{ uri: currentMessage.image }}
          style={{
            width: 200,
            height: 200,
            borderRadius: 13,
          }}
          resizeMode="cover"
        />
      </View>
    );
  }, []);

  // Check if we should show username (only for first message in a sequence from same user)
  const shouldShowUsername = useCallback(
    (currentMessage: IMessage, allMessages: IMessage[]) => {
      if (!currentMessage || currentMessage.user._id === currentUserId) {
        // Don't show username for own messages
        return false;
      }

      const messageIndex = allMessages.findIndex(
        (m) => m._id === currentMessage._id
      );

      // If it's the last message (first in display due to reverse order) or
      // the next message (previous in display) is from a different user, show username
      if (messageIndex === allMessages.length - 1) {
        return true;
      }

      const nextMessage = allMessages[messageIndex + 1];
      return nextMessage?.user._id !== currentMessage.user._id;
    },
    [currentUserId]
  );

  // Custom bubble renderer to show username only at start of message sequence
  const renderBubble = useCallback(
    (props: any) => {
      const { Bubble } = require('react-native-gifted-chat');
      const { currentMessage } = props;
      const showName = shouldShowUsername(currentMessage, giftedMessages);

      return (
        <View>
          {showName && currentMessage.user.name && (
            <Text
              style={{
                fontSize: 12,
                color: '#666',
                marginLeft: 10,
                marginBottom: 2,
              }}
            >
              {currentMessage.user.name}
            </Text>
          )}
          <Bubble {...props} />
        </View>
      );
    },
    [shouldShowUsername, giftedMessages]
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading messages...</Text>
      </View>
    );
  }

  if (!currentUserId) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  // Use KeyboardAvoidingView with header height offset
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <GiftedChat
        messages={giftedMessages}
        onSend={onSend}
        user={{ _id: currentUserId }}
        renderActions={renderActions}
        renderSend={renderSend}
        renderMessageImage={renderMessageImage}
        renderBubble={renderBubble}
        alwaysShowSend
        placeholder="Type a message..."
        scrollToBottom
        scrollToBottomComponent={() => (
          <Ionicons name="chevron-down-circle" size={36} color="#007AFF" />
        )}
        isKeyboardInternallyHandled={false}
      />
    </KeyboardAvoidingView>
  );
}
