import type { Activity } from '@/types/activity';

import { View } from 'react-native';

import { useUserProfile } from '@/api/users/use-user-profile';
import { ActivityCard } from '@/components/activity/activity-card';
import { Button, Text } from '@/components/ui';

import { useWizard } from './wizard-context';

export function StepPreview() {
  const { form, goToStep, isPending, handleSubmit } = useWizard();
  const { data: user } = useUserProfile();

  const values = form.state.values;

  // Build a preview activity object
  const previewActivity: Activity = {
    id: 'preview',
    host_id: user?.id || '',
    host: user
      ? {
          id: user.id,
          email: user.email || '',
          full_name: user.full_name || 'You',
          avatar_url: user.avatar_url,
          created_at: user.created_at || new Date().toISOString(),
        }
      : undefined,
    title: values.title || 'Untitled Activity',
    description: values.description || undefined,
    category: values.category || 'other',
    location_name: values.location_name || 'Location TBD',
    location_address: values.location_address || undefined,
    city: values.city || 'City',
    country: values.country || 'Country',
    latitude: values.latitude,
    longitude: values.longitude,
    starts_at: values.starts_at?.toISOString() || new Date().toISOString(),
    ends_at: values.ends_at?.toISOString(),
    is_flexible_time: values.is_flexible_time || false,
    max_attendees: values.max_attendees ? Number.parseInt(values.max_attendees) : undefined,
    is_public: true,
    requires_approval: false,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    attendee_count: 0,
    is_attending: false,
    is_happening_now: false,
  };

  return (
    <View className="p-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          Preview
        </Text>
        <Text className="mt-1 text-gray-500 dark:text-gray-400">
          This is how your activity will appear to others
        </Text>
      </View>

      {/* Activity Card Preview */}
      <View className="mb-6" pointerEvents="none">
        <ActivityCard activity={previewActivity} />
      </View>

      {/* Edit Buttons */}
      <View className="mb-6 flex-row gap-3">
        <View className="flex-1">
          <Button
            label="Edit Details"
            variant="outline"
            onPress={() => goToStep(1)}
          />
        </View>
        <View className="flex-1">
          <Button
            label="Edit Time"
            variant="outline"
            onPress={() => goToStep(2)}
          />
        </View>
      </View>

      {/* Create Button */}
      <Button
        label="Create Activity"
        onPress={handleSubmit}
        loading={isPending}
        className="w-full"
      />
    </View>
  );
}
