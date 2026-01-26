import type { CrewMember } from '@/types/crew';
import { router } from 'expo-router';
import { Alert, Image, Pressable, View } from 'react-native';
import { useRemoveCrewMember } from '@/api/crew/use-remove-crew-member';
import { Text } from '@/components/ui';

type CrewMemberCardProps = {
  member: CrewMember;
};

export function CrewMemberCard({ member }: CrewMemberCardProps) {
  const { mutate: removeMember, isPending } = useRemoveCrewMember();

  const initials = member.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleRemove = () => {
    Alert.alert(
      'Remove from Crew',
      `Are you sure you want to remove ${member.full_name} from your crew?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeMember(member.id),
        },
      ],
    );
  };

  return (
    <Pressable
      onPress={() => router.push(`/user/${member.id}`)}
      className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-4 active:opacity-80 dark:bg-gray-800"
    >
      <View className="flex-1 flex-row items-center">
        {/* Avatar */}
        {member.avatar_url
          ? (
              <Image source={{ uri: member.avatar_url }} className="h-12 w-12 rounded-full" />
            )
          : (
              <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                <Text className="font-bold text-indigo-600 dark:text-indigo-300">{initials}</Text>
              </View>
            )}

        {/* Info */}
        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900 dark:text-gray-100">
            {member.full_name}
          </Text>
          {member.current_city && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {member.current_city}
              {member.current_country && `, ${member.current_country}`}
            </Text>
          )}
        </View>
      </View>

      {/* Remove Button */}
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        disabled={isPending}
        className="ml-2 rounded-lg bg-red-50 px-3 py-2 active:opacity-80 dark:bg-red-900/30"
      >
        <Text className="text-sm font-semibold text-red-600 dark:text-red-400">Remove</Text>
      </Pressable>
    </Pressable>
  );
}
