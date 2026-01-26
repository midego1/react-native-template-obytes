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
        console.log('[useUploadMedia] Starting upload...', { uri, type, fileName, mimeType });

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user)
          throw new Error('Must be logged in');

        console.log('[useUploadMedia] User authenticated:', user.id);

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const extension = fileName?.split('.').pop() || mimeType?.split('/').pop() || 'bin';
        const uniqueFileName = `${user.id}/${type}/${timestamp}_${randomString}.${extension}`;

        console.log('[useUploadMedia] Generated filename:', uniqueFileName);

        // Validate URI
        if (!uri || typeof uri !== 'string') {
          throw new Error('Invalid file URI');
        }

        // Read file as base64 using FileSystem (suppresses deprecation warning with require)
        console.log('[useUploadMedia] Reading file as base64 from:', uri);
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (!base64 || base64.length === 0) {
          throw new Error('Failed to read file as base64');
        }

        console.log('[useUploadMedia] File read successfully, base64 length:', base64.length);

        // Convert base64 to ArrayBuffer for Supabase upload
        console.log('[useUploadMedia] Converting base64 to ArrayBuffer...');
        const arrayBuffer = decode(base64);
        const size = arrayBuffer.byteLength;

        console.log('[useUploadMedia] ArrayBuffer created, size:', size);

        // Upload to Supabase Storage
        console.log('[useUploadMedia] Uploading to Supabase...');
        const { data, error } = await supabase.storage
          .from('chat-media')
          .upload(uniqueFileName, arrayBuffer, {
            contentType: mimeType || 'application/octet-stream',
            cacheControl: '3600',
            upsert: false,
          });

        if (error) {
          console.error('[useUploadMedia] Upload error:', error);
          throw new Error(`Failed to upload media: ${error.message}`);
        }

        console.log('[useUploadMedia] Upload successful:', data.path);

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('chat-media').getPublicUrl(data.path);

        console.log('[useUploadMedia] Public URL:', publicUrl);
        console.log('[useUploadMedia] Complete! Size:', size);

        return {
          url: publicUrl,
          path: data.path,
          fileName: fileName || uniqueFileName,
          mimeType: mimeType || 'application/octet-stream',
          size,
        };
      }
      catch (error: any) {
        console.error('[useUploadMedia] Error:', error.message, error);
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
        console.log('[usePickAndUploadImage] Starting...');

        // Request permissions
        console.log('[usePickAndUploadImage] Requesting permissions...');
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('[usePickAndUploadImage] Permission status:', status);

        if (status !== 'granted') {
          throw new Error('Permission to access photos was denied');
        }

        // Launch image picker
        console.log('[usePickAndUploadImage] Launching picker...');
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });

        console.log('[usePickAndUploadImage] Picker result:', JSON.stringify(result, null, 2));

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
        console.log('[usePickAndUploadImage] Selected asset:', {
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
        });

        // Upload the image
        console.log('[usePickAndUploadImage] Starting upload...');
        return uploadMedia.mutateAsync({
          uri: asset.uri,
          type: 'image',
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
      catch (error: any) {
        console.error('[usePickAndUploadImage] Error:', error.message, error);
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
        console.log('[useTakePhotoAndUpload] Starting...');

        // Request camera permissions
        console.log('[useTakePhotoAndUpload] Requesting permissions...');
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        console.log('[useTakePhotoAndUpload] Permission status:', status);

        if (status !== 'granted') {
          throw new Error('Permission to access camera was denied');
        }

        // Launch camera
        console.log('[useTakePhotoAndUpload] Launching camera...');
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.8,
        });

        console.log('[useTakePhotoAndUpload] Camera result:', JSON.stringify(result, null, 2));

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
        console.log('[useTakePhotoAndUpload] Captured asset:', {
          uri: asset.uri,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
        });

        // Upload the photo
        console.log('[useTakePhotoAndUpload] Starting upload...');
        return uploadMedia.mutateAsync({
          uri: asset.uri,
          type: 'image',
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
      catch (error: any) {
        console.error('[useTakePhotoAndUpload] Error:', error.message, error);
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
