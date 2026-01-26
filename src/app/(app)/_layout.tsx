import { Redirect, SplashScreen, Tabs } from 'expo-router';
import * as React from 'react';
import { useCallback, useEffect } from 'react';

import { useConversations } from '@/api/chat/use-conversations';
import { useCrewRequests } from '@/api/crew/use-crew-requests';
import {
  Chat as ChatIcon,
  Crew as CrewIcon,
  Feed as FeedIcon,
  Profile as ProfileIcon,
} from '@/components/ui/icons';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const { data: requests } = useCrewRequests();
  const { data: conversations } = useConversations();
  const pendingCount = requests?.received.length || 0;
  const unreadCount
    = conversations?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0;

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, status]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Activities',
          tabBarIcon: ({ color }) => <FeedIcon color={color} />,
          tabBarButtonTestID: 'feed-tab',
        }}
      />

      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          headerShown: false,
          tabBarIcon: ({ color }) => <ChatIcon color={color} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarButtonTestID: 'chats-tab',
        }}
      />

      <Tabs.Screen
        name="crew"
        options={{
          title: 'Crew',
          headerShown: false,
          tabBarIcon: ({ color }) => <CrewIcon color={color} />,
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarButtonTestID: 'crew-tab',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
          tabBarButtonTestID: 'profile-tab',
        }}
      />

      {/* Hidden routes - not shown in tab bar */}
      <Tabs.Screen
        name="chat-beta"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="style"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
