import { Platform } from 'react-native';

export async function uploadImage(uri: string): Promise<string> {
 if (/^https:\/\//i.test(uri)) return uri;
 const cloud = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
 const preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
 if (!cloud || !preset) throw new Error('Photo uploads are not configured yet.');
 const body = new FormData();
 if (Platform.OS === 'web') body.append('file', await (await fetch(uri)).blob(), 'photo.jpg');
 else body.append('file', { uri, name: 'photo.jpg', type: uri.startsWith('data:') ? (uri.slice(5).split(';')[0] || 'image/jpeg') : (/\.png(?:[?#]|$)/i.test(uri) ? 'image/png' : 'image/jpeg') } as any);
 body.append('upload_preset', preset);
 const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, { method: 'POST', body });
 const data = await response.json();
 if (!response.ok || !data.secure_url) throw new Error(data.error?.message || 'Photo upload failed.');
 return data.secure_url;
}
export async function uploadImages(uris: string[]) { return Promise.all(uris.map(uploadImage)); }
