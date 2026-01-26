import { router } from 'expo-router';
import { ScrollView, View, Pressable, Alert } from 'react-native';
import { Text, Button } from '@/components/ui';
import { useUserProfile } from '@/api/users/use-user-profile';
import { logout } from '@/lib/auth/supabase-auth';

// eslint-disable-next-line max-lines-per-function
export function ProfileScreen() {
  const { data: profile, isLoading, isError } = useUserProfile();

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to sign out');
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Text className="text-gray-500 dark:text-gray-400">Loading profile...</Text>
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-8 dark:bg-gray-900">
        <Text className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-100">
          Failed to load profile
        </Text>
        <Text className="mb-4 text-center text-gray-500 dark:text-gray-400">
          Please try again later
        </Text>
        <Button label="Sign Out" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white px-4 pb-6 pt-12 shadow-sm dark:bg-gray-800 dark:shadow-gray-700">
        <View className="items-center">
          {/* Avatar */}
          <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
            <Text className="text-4xl font-bold text-indigo-600 dark:text-indigo-300">
              {profile.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Name */}
          <Text className="mb-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {profile.full_name}
          </Text>

          {/* Location */}
          {profile.current_city && (
            <View className="mb-4 flex-row items-center">
              <Text className="text-gray-600 dark:text-gray-300">
                📍 {profile.current_city}
                {profile.current_country && `, ${profile.current_country}`}
              </Text>
            </View>
          )}

          {/* Edit Profile Button */}
          <Pressable
            onPress={() => router.push('/edit-profile')}
            className="rounded-full bg-indigo-100 px-6 py-2 dark:bg-indigo-900"
          >
            <Text className="font-semibold text-indigo-600 dark:text-indigo-300">
              Edit Profile
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Bio Section */}
      {profile.bio && (
        <View className="mt-4 bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-700">
          <Text className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100">Bio</Text>
          <Text className="leading-6 text-gray-700 dark:text-gray-300">{profile.bio}</Text>
        </View>
      )}

      {/* Stats Section */}
      <View className="mt-4 bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-700">
        <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
          Activity Stats
        </Text>

        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="mb-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              0
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">Hosted</Text>
          </View>

          <View className="items-center">
            <Text className="mb-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              0
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">Attended</Text>
          </View>

          <View className="items-center">
            <Text className="mb-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              0
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">Connections</Text>
          </View>
        </View>
      </View>

      {/* Account Section */}
      <View className="mt-4 bg-white p-6 shadow-sm dark:bg-gray-800 dark:shadow-gray-700">
        <Text className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">Account</Text>

        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-500 dark:text-gray-400">Email</Text>
          <Text className="text-gray-900 dark:text-gray-100">{profile.email}</Text>
        </View>

        <View className="mb-4">
          <Text className="mb-1 text-sm text-gray-500 dark:text-gray-400">Member Since</Text>
          <Text className="text-gray-900 dark:text-gray-100">
            {new Date(profile.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        <Button label="Sign Out" onPress={handleLogout} variant="outline" />
      </View>

      {/* Bottom padding */}
      <View className="h-8" />
    </ScrollView>
  );
}
