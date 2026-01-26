/**
 * Chat Beta Screen
 * Full GiftedChat implementation with all CRUD features + Supabase
 * Based on official example with our custom features added
 */

import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Platform, View, Alert, ActionSheetIOS, Clipboard, TouchableOpacity } from 'react-native';
import {
  GiftedChat,
  Actions,
  Bubble,
  SystemMessage,
  MessageImage,
  MessageText,
  Send,
  InputToolbar,
} from 'react-native-gifted-chat';
import { Text } from '@/components/ui';
import { useMarkAsRead } from '@/api/chat/use-mark-as-read';
import { useMessages } from '@/api/chat/use-messages';
import { useSendMessage } from '@/api/chat/use-send-message';
import { useEditMessage } from '@/api/chat/use-edit-message';
import { useDeleteMessage } from '@/api/chat/use-delete-message';
import { useAddReaction, useRemoveReaction } from '@/api/chat/use-message-reactions';
import { useClearTyping, useSetTyping, useTypingIndicators } from '@/api/chat/use-typing-indicator';
import { usePickAndUploadImage, useTakePhotoAndUpload } from '@/api/chat/use-upload-media';
import { EmojiPicker } from '@/components/chat/emoji-picker';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';
import { supabase } from '@/lib/supabase';
import { toGiftedChatMessage } from '@/types/chat';

type ChatBetaScreenProps = {
  conversationId?: string;
};

export function ChatBetaScreen({ conversationId = 'demo' }: ChatBetaScreenProps) {
  // Use demo mode if no conversation ID provided
  const isDemo = conversationId === 'demo';
  const queryConversationId = isDemo ? 'demo-disabled' : conversationId;

  // API Hooks (disabled in demo mode via enabled flag)
  const { data: messages, isLoading } = useMessages(queryConversationId, 50, 0);
  const { mutate: sendMessage } = useSendMessage();
  const { mutate: editMessage } = useEditMessage();
  const { mutate: deleteMessage } = useDeleteMessage();
  const { mutate: addReaction } = useAddReaction();
  const { mutate: markAsRead } = useMarkAsRead();
  const { data: typingIndicators } = useTypingIndicators(queryConversationId);
  const { mutate: setTyping } = useSetTyping();
  const { mutate: clearTyping } = useClearTyping();
  const pickImage = usePickAndUploadImage();
  const takePhoto = useTakePhotoAndUpload();

  // Real-time subscriptions
  useRealtimeMessages(queryConversationId);

  // State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [demoMessages, setDemoMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{ id: string; text: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id || null);
    });

    // Mark as read when opening
    if (!isDemo) {
      markAsRead(conversationId);
    }

    // Load demo messages if in demo mode
    if (isDemo) {
      setDemoMessages([
        {
          _id: 1,
          text: 'Welcome to Chat Beta! 🎉\n\nFull GiftedChat with Supabase integration.',
          createdAt: new Date(Date.now() - 5 * 60000),
          user: { _id: 'system', name: 'System' },
          system: true,
        },
        {
          _id: 2,
          text: 'Long press this message to see all options!',
          createdAt: new Date(Date.now() - 4 * 60000),
          user: { _id: 2, name: 'Demo Bot', avatar: 'https://placeimg.com/140/140/tech' },
        },
        {
          _id: 3,
          text: 'You can: Edit, Delete, Reply, React, Copy',
          createdAt: new Date(Date.now() - 3 * 60000),
          user: { _id: 2, name: 'Demo Bot' },
        },
      ]);
    }
  }, [conversationId, isDemo, markAsRead]);

  // Convert messages to GiftedChat format
  const giftedMessages = React.useMemo(() => {
    if (isDemo) return demoMessages;
    if (!messages) return [];
    return messages.map(toGiftedChatMessage);
  }, [isDemo, demoMessages, messages]);

  // Handle typing
  const handleInputTextChanged = useCallback((text: string) => {
    if (!isDemo && text.length > 0) {
      setTyping(conversationId);
      setTimeout(() => clearTyping(conversationId), 3000);
    }
  }, [isDemo, conversationId, setTyping, clearTyping]);

  // Send message
  const onSend = useCallback((newMessages: any[] = []) => {
    if (newMessages.length === 0 || !newMessages[0].text) return;

    if (isDemo) {
      // Demo mode: Just add to local state
      setDemoMessages(prev => GiftedChat.append(prev, newMessages));

      // Simulate response
      setTimeout(() => {
        const response = {
          _id: Math.round(Math.random() * 1000000),
          text: 'This is a demo response. Connect to real conversation to use Supabase!',
          createdAt: new Date(),
          user: { _id: 2, name: 'Demo Bot' },
        };
        setDemoMessages(prev => GiftedChat.append(prev, [response]));
      }, 1000);
    } else {
      // Real mode: Save to Supabase
      if (editingMessage) {
        // Edit existing message
        editMessage({
          messageId: editingMessage.id,
          content: newMessages[0].text,
        });
        setEditingMessage(null);
      } else {
        // Send new message
        sendMessage({
          conversationId,
          content: newMessages[0].text,
          replyToMessageId: replyingTo?._id,
        });
        setReplyingTo(null);
      }
      clearTyping(conversationId);
    }
  }, [isDemo, conversationId, sendMessage, editMessage, clearTyping, editingMessage, replyingTo]);

  // Handle long press
  const onLongPress = useCallback((context: any, message: any) => {
    const isOwnMessage = message.user._id === currentUserId;
    const isDeleted = message.deleted;

    if (isDeleted) return;

    const options = ['Cancel', 'Copy', 'Reply', 'React'];
    if (isOwnMessage) {
      options.push('Edit', 'Delete');
    }

    const cancelButtonIndex = 0;
    const destructiveButtonIndex = isOwnMessage ? options.length - 1 : -1;

    const handleAction = (index: number) => {
      switch (index) {
        case 1: // Copy
          Clipboard.setString(message.text);
          Alert.alert('Copied', 'Message copied to clipboard');
          break;
        case 2: // Reply
          setReplyingTo(message);
          break;
        case 3: // React
          setSelectedMessageForReaction(message._id);
          setEmojiPickerVisible(true);
          break;
        case 4: // Edit (own message only)
          if (isOwnMessage) {
            setEditingMessage({ id: message._id, text: message.text });
          }
          break;
        case 5: // Delete (own message only)
          if (isOwnMessage) {
            Alert.alert(
              'Delete Message',
              'Are you sure you want to delete this message?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    if (isDemo) {
                      setDemoMessages(prev => prev.filter(m => m._id !== message._id));
                    } else {
                      deleteMessage({ messageId: message._id, conversationId });
                    }
                  },
                },
              ],
            );
          }
          break;
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex, destructiveButtonIndex },
        handleAction,
      );
    } else {
      Alert.alert('Message Actions', message.text, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Copy', onPress: () => handleAction(1) },
        { text: 'Reply', onPress: () => handleAction(2) },
        { text: 'React', onPress: () => handleAction(3) },
        ...(isOwnMessage ? [
          { text: 'Edit', onPress: () => handleAction(4) },
          { text: 'Delete', onPress: () => handleAction(5), style: 'destructive' as const },
        ] : []),
      ]);
    }
  }, [currentUserId, conversationId, isDemo, deleteMessage]);

  // Handle emoji selection
  const handleSelectEmoji = useCallback((emoji: string) => {
    if (selectedMessageForReaction) {
      if (!isDemo) {
        addReaction({ messageId: selectedMessageForReaction, emoji });
      }
      setSelectedMessageForReaction(null);
    }
  }, [selectedMessageForReaction, addReaction, isDemo]);

  // Handle media upload
  const handleMediaAction = useCallback(() => {
    if (isDemo) {
      Alert.alert('Demo Mode', 'Image upload works in real conversations only');
      return;
    }

    const options = ['Cancel', 'Camera', 'Photo Library'];
    const cancelButtonIndex = 0;

    const handleAction = async (index: number) => {
      if (index === 1) {
        // Camera
        try {
          setUploadProgress(0);
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => (prev !== null && prev < 80 ? prev + 10 : prev));
          }, 300);

          const result = await takePhoto.mutateAsync();
          clearInterval(progressInterval);
          setUploadProgress(100);

          sendMessage({
            conversationId,
            content: '',
            type: 'image',
            mediaUrl: result.url,
            mediaType: result.mimeType,
            fileName: result.fileName,
            fileSize: result.size,
          });

          setTimeout(() => setUploadProgress(null), 500);
        } catch (error: any) {
          setUploadProgress(null);
          if (!error.message?.includes('cancel')) {
            Alert.alert('Error', error.message);
          }
        }
      } else if (index === 2) {
        // Photo Library
        try {
          setUploadProgress(0);
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => (prev !== null && prev < 80 ? prev + 10 : prev));
          }, 300);

          const result = await pickImage.mutateAsync();
          clearInterval(progressInterval);
          setUploadProgress(100);

          sendMessage({
            conversationId,
            content: '',
            type: 'image',
            mediaUrl: result.url,
            mediaType: result.mimeType,
            fileName: result.fileName,
            fileSize: result.size,
          });

          setTimeout(() => setUploadProgress(null), 500);
        } catch (error: any) {
          setUploadProgress(null);
          if (!error.message?.includes('cancel')) {
            Alert.alert('Error', error.message);
          }
        }
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex },
        handleAction,
      );
    } else {
      Alert.alert('Send Media', '', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: () => handleAction(1) },
        { text: 'Photo Library', onPress: () => handleAction(2) },
      ]);
    }
  }, [isDemo, conversationId, sendMessage, pickImage, takePhoto]);

  // Render components
  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: '#007AFF' },
          left: { backgroundColor: '#E5E5EA' },
        }}
        textStyle={{
          right: { color: '#fff' },
          left: { color: '#000' },
        }}
        timeTextStyle={{
          right: { color: 'rgba(255, 255, 255, 0.7)' },
          left: { color: 'rgba(0, 0, 0, 0.5)' },
        }}
      />
    );
  };

  const renderSystemMessage = (props: any) => {
    return (
      <SystemMessage
        {...props}
        containerStyle={{ marginBottom: 15 }}
        textStyle={{ fontSize: 14, color: '#999' }}
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props}>
        <View style={{ marginRight: 10, marginBottom: 5 }}>
          <Ionicons name="send" size={28} color="#007AFF" />
        </View>
      </Send>
    );
  };

  const renderActions = () => {
    return (
      <Actions
        containerStyle={{
          width: 44,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 4,
          marginRight: 4,
          marginBottom: 0,
        }}
        icon={() => <Ionicons name="add-circle" size={32} color="#007AFF" />}
        onPressActionButton={handleMediaAction}
      />
    );
  };

  const renderMessageImage = (props: any) => {
    return (
      <MessageImage
        {...props}
        imageStyle={{
          width: 200,
          height: 200,
          borderRadius: 13,
          margin: 3,
          resizeMode: 'cover',
        }}
      />
    );
  };

  const renderMessageText = (props: any) => {
    const { currentMessage } = props;
    return (
      <View>
        <MessageText
          {...props}
          customTextStyle={{ fontSize: 16, lineHeight: 20 }}
        />
        {currentMessage?.edited && (
          <Text className="text-xs text-gray-400 dark:text-gray-500 px-3 pb-1">
            (edited)
          </Text>
        )}
      </View>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <View>
        {/* Edit mode banner */}
        {editingMessage && (
          <View className="flex-row items-center justify-between px-3 py-2 bg-blue-100 dark:bg-blue-900 border-b border-blue-200">
            <View className="flex-1">
              <Text className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Editing message
              </Text>
            </View>
            <TouchableOpacity onPress={() => setEditingMessage(null)}>
              <Ionicons name="close-circle" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Reply mode banner */}
        {replyingTo && (
          <View className="flex-row items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200">
            <View className="flex-1">
              <Text className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Replying to {replyingTo.user.name}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                {replyingTo.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        <InputToolbar
          {...props}
          containerStyle={{
            backgroundColor: Platform.OS === 'ios' ? '#f9f9f9' : '#fff',
            borderTopColor: '#e8e8e8',
            borderTopWidth: 1,
            paddingVertical: 4,
          }}
          primaryStyle={{ alignItems: 'center' }}
        />
      </View>
    );
  };

  const renderFooter = useCallback(() => {
    if (typingIndicators && typingIndicators.length > 0) {
      const names = typingIndicators.map(t => t.user?.full_name || 'Someone').join(', ');
      return (
        <View className="px-4 py-2">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            {names} {typingIndicators.length === 1 ? 'is' : 'are'} typing...
          </Text>
        </View>
      );
    }
    return null;
  }, [typingIndicators]);

  const scrollToBottomComponent = () => {
    return <Ionicons name="chevron-down-circle" size={36} color="#007AFF" />;
  };

  if (isLoading && !isDemo) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">Loading messages...</Text>
      </View>
    );
  }

  if (!currentUserId) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header */}
        <View className="pt-12 pb-3 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <Text className="text-2xl font-bold">Chat Beta</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isDemo ? 'Demo Mode • Try all features!' : 'Connected to Supabase'}
          </Text>
        </View>

        {/* GiftedChat */}
        <GiftedChat
          messages={giftedMessages}
          onSend={onSend}
          onLongPress={onLongPress}
          onInputTextChanged={handleInputTextChanged}
          text={editingMessage?.text}
          user={{ _id: currentUserId }}
          placeholder="Type a message..."
          alwaysShowSend
          showUserAvatar
          showAvatarForEveryMessage={false}
          renderBubble={renderBubble}
          renderSystemMessage={renderSystemMessage}
          renderSend={renderSend}
          renderActions={renderActions}
          renderMessageImage={renderMessageImage}
          renderMessageText={renderMessageText}
          renderInputToolbar={renderInputToolbar}
          renderFooter={renderFooter}
          scrollToBottom
          scrollToBottomComponent={scrollToBottomComponent}
          parsePatterns={(linkStyle: any) => [
            { type: 'url', style: linkStyle },
            { type: 'phone', style: linkStyle },
            { type: 'email', style: linkStyle },
          ]}
          textInputProps={{
            returnKeyType: 'send',
            blurOnSubmit: false,
          }}
          maxComposerHeight={100}
          bottomOffset={Platform.OS === 'ios' ? 34 : 0}
          minComposerHeight={44}
          renderUsernameOnMessage={true}
          timeFormat="HH:mm"
          dateFormat="MMM DD"
          inverted={true}
          infiniteScroll
        />
      </View>

      {/* Emoji Picker */}
      <EmojiPicker
        visible={emojiPickerVisible}
        onClose={() => {
          setEmojiPickerVisible(false);
          setSelectedMessageForReaction(null);
        }}
        onSelectEmoji={handleSelectEmoji}
      />
    </>
  );
}
