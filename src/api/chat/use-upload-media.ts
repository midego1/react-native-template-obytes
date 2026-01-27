/**
 * Media Upload Hook
 * Upload images, videos, audio, and files to Supabase Storage
 */

import { useMutation } from '@tanstack/react-query';
import { decode } from 'base64-arraybuffer';
import * as DocumentPicker from 'expo-document-picker';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '@/lib/supabase';

type UploadMediaParams = {
  uri: string;
  type: 'image' | 'video' | 'audio' | 'file';
  fileName?: string;
  mimeType?: string;
};

/**
 * Upload media to Supabase Storage and return public URL
 */
export function useUploadMedia() {
  return useMutation({
    mutationFn: async ({ uri, type, fileName, mimeType }: UploadMediaParams) => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user)
          throw new Error('Must be logged in');

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const extension = fileName?.split('.').pop() || mimeType?.split('/').pop() || 'bin';
        const uniqueFileName = `${user.id}/${type}/${timestamp}_${randomString}.${extension}`;

        // Validate URI
        if (!uri || typeof uri !== 'string') {
          throw new Error('Invalid file URI');
        }

        // Read file as base64 using FileSystem (suppresses deprecation warning with require)
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (!base64 || base64.length === 0) {
          throw new Error('Failed to read file as base64');
        }

        // Convert base64 to ArrayBuffer for Supabase upload
        const arrayBuffer = decode(base64);
        const size = arrayBuffer.byteLength;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('chat-media')
          .upload(uniqueFileName, arrayBuffer, {
            contentType: mimeType || 'application/octet-stream',
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          if (__DEV__) {
            console.error('[useUploadMedia] Upload error:', error);
          }
          throw new Error(`Failed to upload media: ${error.message}`);
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('chat-media').getPublicUrl(data.path);

        return {
          url: publicUrl,
          path: data.path,
          fileName: fileName || uniqueFileName,
          mimeType: mimeType || 'application/octet-stream',
          size,
        };
      }
      catch (error: any) {
        if (__DEV__) {
          console.error('[useUploadMedia] Error:', error.message, error);
        }
        throw error;
      }
    },
  });
}

/**
 * Pick and upload image
 */
export function usePickAndUploadImage() {
  const uploadMedia = useUploadMedia();

  return useMutation({
    mutationFn: async () => {
      try {
        // Request permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
          throw new Error('Permission to access photos was denied');
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        if (result.canceled) {
          throw new Error('Image selection cancelled');
        }

        if (!result.assets || result.assets.length === 0) {
          throw new Error('No image selected');
        }

        const asset = result.assets[0];

        if (!asset.uri) {
          throw new Error('Invalid image: missing URI');
        }

        // Upload the image
        return uploadMedia.mutateAsync({
          uri: asset.uri,
          type: 'image',
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
      catch (error: any) {
        if (__DEV__) {
          console.error('[usePickAndUploadImage] Error:', error.message, error);
        }
        throw error;
      }
    },
  });
}

/**
 * Take photo with camera and upload
 */
export function useTakePhotoAndUpload() {
  const uploadMedia = useUploadMedia();

  return useMutation({
    mutationFn: async () => {
      try {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
          throw new Error('Permission to access camera was denied');
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.8,
        });

        if (result.canceled) {
          throw new Error('Photo capture cancelled');
        }

        if (!result.assets || result.assets.length === 0) {
          throw new Error('No photo captured');
        }

        const asset = result.assets[0];

        if (!asset.uri) {
          throw new Error('Invalid photo: missing URI');
        }

        // Upload the photo
        return uploadMedia.mutateAsync({
          uri: asset.uri,
          type: 'image',
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
      catch (error: any) {
        if (__DEV__) {
          console.error('[useTakePhotoAndUpload] Error:', error.message, error);
        }
        throw error;
      }
    },
  });
}

/**
 * Pick and upload video
 */
export function usePickAndUploadVideo() {
  const uploadMedia = useUploadMedia();

  return useMutation({
    mutationFn: async () => {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access videos was denied');
      }

      // Launch video picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) {
        throw new Error('Video selection cancelled');
      }

      const asset = result.assets[0];

      // Upload the video
      return uploadMedia.mutateAsync({
        uri: asset.uri,
        type: 'video',
        fileName: asset.fileName || `video_${Date.now()}.mp4`,
        mimeType: asset.mimeType || 'video/mp4',
      });
    },
  });
}

/**
 * Pick and upload file/document
 */
export function usePickAndUploadFile() {
  const uploadMedia = useUploadMedia();

  return useMutation({
    mutationFn: async () => {
      // Launch document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        throw new Error('File selection cancelled');
      }

      const file = result.assets[0];

      // Upload the file
      return uploadMedia.mutateAsync({
        uri: file.uri,
        type: 'file',
        fileName: file.name,
        mimeType: file.mimeType || 'application/octet-stream',
      });
    },
  });
}
