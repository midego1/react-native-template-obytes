import type { UserProfile } from '@/types/user';
import { ScrollView } from 'react-native';
import { CrewActionButton } from '@/components/user/crew-action-button';
import { UserHeader } from '@/components/user/user-header';
import { UserInfoCard } from '@/components/user/user-info-card';

type UserProfileScreenProps = {
  user: UserProfile;
};

export function UserProfileScreen({ user }: UserProfileScreenProps) {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <UserHeader user={user} />
      <CrewActionButton userId={user.id} />
      <UserInfoCard user={user} />
    </ScrollView>
  );
}
