import { Stack } from 'expo-router';

export default function CrewLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'My Crew',
        }}
      />
      <Stack.Screen
        name="requests"
        options={{
          title: 'Crew Requests',
        }}
      />
    </Stack>
  );
}
