/**
 * Chat & Messaging Types
 * Based on Supabase conversations, messages, and conversation_participants tables
 */

import type { User } from './user';

export type ConversationType = 'direct' | 'activity_group';

export type Conversation = {
  id: string;
  type: ConversationType;
  activity_id?: string;
  created_at: string;
  updated_at: string;

  // Computed fields
  last_message?: Message;
  unread_count?: number;
  other_participant?: User;

  // For activity group chats
  activity_title?: string;
};

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'gif' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: MessageType;
  created_at: string;
  edited_at?: string;

  // Rich media support
  media_url?: string;
  media_type?: string; // MIME type: 'image/jpeg', 'video/mp4', 'audio/m4a', etc.
  file_name?: string;
  file_size?: number;
  thumbnail_url?: string; // For videos
  duration?: number; // For audio/video in seconds

  // Message features
  status: MessageStatus;
  reply_to_message_id?: string;
  deleted_at?: string;

  // Joined relationships
  sender?: User;
  reply_to_message?: Message;
  reactions?: MessageReaction[];
};

export type ConversationParticipant = {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at?: string;

  // Joined relationships
  user?: User;
};

export type MessageReaction = {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;

  // Joined relationships
  user?: User;
};

export type TypingIndicator = {
  conversation_id: string;
  user_id: string;
  started_at: string;

  // Joined relationships
  user?: User;
};

// For react-native-gifted-chat integration
export type GiftedChatMessage = {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  // Rich media
  image?: string;
  video?: string;
  audio?: string;
  // System message
  system?: boolean;
  // Quick replies and custom props
  quickReplies?: any;
  [key: string]: any; // Allow custom properties
};

// Helper to convert Message to GiftedChatMessage
export function toGiftedChatMessage(message: Message): GiftedChatMessage {
  // Check if message is deleted
  const isDeleted = !!message.deleted_at;

  const base: GiftedChatMessage = {
    _id: message.id,
    text: isDeleted ? '🚫 Message deleted' : message.content,
    createdAt: new Date(message.created_at),
    user: {
      _id: message.sender_id,
      name: message.sender?.full_name || 'Unknown',
      avatar: message.sender?.avatar_url,
    },
  };

  // Don't show media for deleted messages
  if (!isDeleted) {
    // Add media based on type
    if (message.type === 'image' || message.type === 'gif') {
      base.image = message.media_url;
    }
    else if (message.type === 'video') {
      base.video = message.media_url;
    }
    else if (message.type === 'audio') {
      base.audio = message.media_url;
    }
    else if (message.type === 'system') {
      base.system = true;
    }

    // Add custom fields for file messages
    if (message.type === 'file') {
      base.file = {
        url: message.media_url,
        name: message.file_name,
        size: message.file_size,
      };
    }
  }

  // Add metadata
  base.status = message.status;
  base.pending = message.status === 'sending';
  base.edited = !!message.edited_at;
  base.deleted = isDeleted;
  base.replyToMessageId = message.reply_to_message_id;

  return base;
}
