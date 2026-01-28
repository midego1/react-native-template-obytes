import { router } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useConversations } from '@/api/chat/use-conversations';
import { useCrewRequests } from '@/api/crew/use-crew-requests';
import { useUserProfile } from '@/api/users/use-user-profile';

import { Image, Text, View } from '../ui';

export function HomeHeader() {
  const insets = useSafeAreaInsets();
  const { data: user } = useUserProfile();

  // Calculate unread count from conversations and crew requests
  const { data: conversations } = useConversations();
  const { data: crewRequests } = useCrewRequests();

  const unreadMessages = conversations?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0;
  const pendingRequests = crewRequests?.received?.length || 0;
  const unreadCount = unreadMessages + pendingRequests;

  return (
    <View
      className="absolute top-0 right-0 left-0 z-10 flex-row items-center justify-between bg-white/95 px-4 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      {/* Profile Avatar */}
      <Pressable
        onPress={() => router.push('/profile')}
        className="active:opacity-70"
      >
        <View className="size-11 rounded-full border-2 border-pink-400 p-0.5">
          {user?.avatar_url
            ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  className="size-full rounded-full"
                  contentFit="cover"
                />
              )
            : (
                <View className="size-full items-center justify-center rounded-full bg-gray-200">
                  <Text className="text-lg font-semibold text-gray-500">
                    {user?.full_name?.[0] || '?'}
                  </Text>
                </View>
              )}
        </View>
      </Pressable>

      {/* Logo */}
      <View className="flex-row items-center">
        <View className="mr-2 size-8 items-center justify-center">
          <Text className="text-2xl">🏙️</Text>
        </View>
        <Text className="text-xl font-bold text-gray-900">CityCrew</Text>
      </View>

      {/* Right Icons */}
      <View className="flex-row items-center gap-3">
        {/* Notifications Bell */}
        <Pressable
          onPress={() => router.push('/notifications' as never)}
          className="relative active:opacity-70"
        >
          <View className="size-10 items-center justify-center">
            <Text className="text-2xl">🔔</Text>
          </View>
          {unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1">
              <Text className="text-xs font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>

        {/* Crew Icon */}
        <Pressable
          onPress={() => router.push('/crew')}
          className="active:opacity-70"
        >
          <View className="size-10 items-center justify-center">
            <Text className="text-2xl">👥</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
