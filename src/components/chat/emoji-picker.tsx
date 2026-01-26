/**
 * Emoji Picker Component
 * Simple emoji selector for message reactions
 */

import { Modal, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui';

type EmojiPickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
};

const EMOJI_CATEGORIES = [
  {
    name: 'Popular',
    emojis: ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥', '👏', '💯'],
  },
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
  },
  {
    name: 'Gestures',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐'],
  },
  {
    name: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '💕', '💖', '💗', '💓', '💞'],
  },
  {
    name: 'Symbols',
    emojis: ['✅', '❌', '⭐', '💯', '🔥', '⚡', '💥', '✨', '💫', '🎉', '🎊', '🏆', '🎯', '💪', '🙌', '👏'],
  },
];

export function EmojiPicker({ visible, onClose, onSelectEmoji }: EmojiPickerProps) {
  const handleSelectEmoji = (emoji: string) => {
    onSelectEmoji(emoji);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl pb-8" style={{ maxHeight: 400 }}>
            {/* Header */}
            <View className="items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              <Text className="mt-2 text-lg font-semibold">Choose Reaction</Text>
            </View>

            {/* Emoji Grid */}
            <ScrollView className="px-4 py-2">
              {EMOJI_CATEGORIES.map((category) => (
                <View key={category.name} className="mb-4">
                  <Text className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {category.name}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {category.emojis.map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        onPress={() => handleSelectEmoji(emoji)}
                        className="w-12 h-12 items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg active:bg-gray-200 dark:active:bg-gray-600"
                      >
                        <Text style={{ fontSize: 28 }}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Close Button */}
            <View className="px-4 pt-2">
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-100 dark:bg-gray-700 rounded-2xl py-3 items-center"
              >
                <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
