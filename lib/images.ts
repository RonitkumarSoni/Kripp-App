import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

// Compress & resize image before uploading (max 800px wide, quality 0.5)
async function compressImage(uri: string): Promise<string> {
 if (Platform.OS === 'web') return uri; // web doesn't need this
 try {
  const result = await ImageManipulator.manipulateAsync(
   uri,
   [{ resize: { width: 800 } }],
   { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
 } catch {
  return uri; // fallback to original if manipulation fails
 }
}

export async function uploadImage(uri: string): Promise<string> {
 // Already a remote URL — nothing to upload
 if (/^https:\/\//i.test(uri)) return uri;

 const cloud = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
 const preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
 if (!cloud || !preset) throw new Error('Photo uploads are not configured yet.');

 const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`;

 // Compress image first to reduce upload size
 const compressedUri = await compressImage(uri);

 if (Platform.OS === 'web') {
  const body = new FormData();
  body.append('file', await (await fetch(compressedUri)).blob(), 'photo.jpg');
  body.append('upload_preset', preset);
  const response = await fetch(url, { method: 'POST', body });
  const data = await response.json();
  if (!response.ok || !data.secure_url) throw new Error(data.error?.message || 'Photo upload failed.');
  return data.secure_url;
 } else {
  const FileSystem = require('expo-file-system/legacy');
  const base64 = await FileSystem.readAsStringAsync(compressedUri, { encoding: 'base64' });
  const dataUri = `data:image/jpeg;base64,${base64}`;

  const response = await fetch(url, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({
    file: dataUri,
    upload_preset: preset,
   }),
  });

  const data = await response.json();
  if (!response.ok || !data.secure_url) throw new Error(data.error?.message || 'Photo upload failed.');
  return data.secure_url;
 }
}

export async function uploadImages(uris: string[]) {
 return Promise.all(uris.map(uploadImage));
}
