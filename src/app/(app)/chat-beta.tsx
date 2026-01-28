import { Stack } from 'expo-router';
import { ChatBetaScreen } from '@/features/chat/chat-beta-screen';

export default function ChatBetaRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatBetaScreen />
    </>
  );
}
