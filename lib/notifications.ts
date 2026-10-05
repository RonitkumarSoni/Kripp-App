import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
const key = '@kribb_notifications_enabled';
export async function notificationModule() {
 if (Platform.OS === 'web' || Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient') return null;
 return import('expo-notifications');
}
export async function notificationsEnabled() { return await AsyncStorage.getItem(key) === 'true'; }
export async function setNotificationsEnabled(enabled: boolean) {
 if (enabled) {
  const module = await notificationModule();
  if (!module) throw new Error('Phone notifications require an installed APK or development build.');
  if (Platform.OS === 'android') await module.setNotificationChannelAsync('default', { name: 'Kribb updates', importance: module.AndroidImportance.HIGH });
  let permission = await module.getPermissionsAsync();
  if (!permission.granted) permission = await module.requestPermissionsAsync();
  if (!permission.granted) throw new Error('Allow notifications in your phone settings.');
 }
 await AsyncStorage.setItem(key, String(enabled));
}
export async function sendLocalNotification(title: string, body: string, data = {}) {
 try {
  const module = await notificationModule();
  if (!module) return { sent: false, reason: 'Phone notifications require a new installed APK or development build.' };
  // Ask once on the first successful property action; an explicit opt-out is respected.
  if (await AsyncStorage.getItem(key) === null) await setNotificationsEnabled(true);
  if (!await notificationsEnabled()) return;
  if (!module || !(await module.getPermissionsAsync()).granted) return;
  await module.scheduleNotificationAsync({ content: { title, body, data, sound: 'default' }, trigger: Platform.OS === 'android' ? { channelId: 'default' } : null });
  return { sent: true };
 } catch (error) {
  return { sent: false, reason: error instanceof Error ? error.message : 'Unable to display phone notification.' };
 }
}
