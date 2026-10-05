import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { notificationModule, notificationsEnabled, setNotificationsEnabled } from '../lib/notifications';
type NotificationType = 'info' | 'success' | 'warning' | 'error';
interface NotificationConfig { title: string; body: string; type?: NotificationType }
export interface NotificationItem extends NotificationConfig { id: string; time: string; read: boolean }
interface Value {
 showNotification: (config: NotificationConfig) => void;
 notifications: NotificationItem[]; markAllAsRead: () => void; clearAll: () => void;
 pushEnabled: boolean; setPushEnabled: (enabled: boolean) => Promise<void>;
}
const Context = createContext<Value | undefined>(undefined);
export function useInAppNotification() { const value = useContext(Context); if (!value) throw new Error('NotificationProvider is required'); return value; }
export function NotificationProvider({ children }: { children: React.ReactNode }) {
 const { userId } = useAuth(); const { theme } = useTheme(); const insets = useSafeAreaInsets();
 const [notifications, setNotifications] = useState<NotificationItem[]>([]);
 const [pushEnabled, setPushState] = useState(false);
 const [config, setConfig] = useState<NotificationConfig | null>(null);
 const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
 const loaded = useRef<string | null>(null);
 const key = userId ? `@kribb_notifications:${userId}` : null;
 useEffect(() => {
  let active = true; loaded.current = null; setNotifications([]); setConfig(null);
  if (timer.current) clearTimeout(timer.current);
  if (key) AsyncStorage.getItem(key).then(raw => {
   if (!active) return;
   let items: NotificationItem[] = [];
   try { const parsed = JSON.parse(raw || '[]'); if (Array.isArray(parsed)) items = parsed; } catch {}
   loaded.current = key; setNotifications(items.slice(0, 100));
  }).catch(() => { if (active) loaded.current = key; });
  notificationsEnabled().then(value => { if (active) setPushState(value); }).catch(() => {});
  return () => { active = false; if (timer.current) clearTimeout(timer.current); };
 }, [key]);
 useEffect(() => { if (key && loaded.current === key) AsyncStorage.setItem(key, JSON.stringify(notifications)).catch(() => {}); }, [notifications, key]);
 useEffect(() => {
  let active = true;
  notificationModule().then(module => {
   if (active && module) module.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
  }).catch(() => {});
  return () => { active = false; };
 }, []);
 const showNotification = (next: NotificationConfig) => {
  if (!next.title && !next.body) return;
  setNotifications(previous => [{ ...next, id: `${Date.now()}-${Math.random()}`, time: new Date().toISOString(), read: false }, ...previous].slice(0, 100));
  setConfig(next); if (timer.current) clearTimeout(timer.current);
  timer.current = setTimeout(() => setConfig(null), 4500);
 };
 const colors = { info: theme.accent, success: '#10B981', warning: '#F59E0B', error: '#EF4444' };
 return <Context.Provider value={{ notifications, showNotification, pushEnabled,
  setPushEnabled: async enabled => { await setNotificationsEnabled(enabled); setPushState(enabled); },
  markAllAsRead: () => setNotifications(items => items.map(item => ({ ...item, read: true }))), clearAll: () => setNotifications([]),
 }}>
  {children}
  {config && <View style={{ position: 'absolute', left: 16, right: 16, top: insets.top + 8, padding: 16, borderRadius: 16, backgroundColor: theme.card, borderColor: theme.cardBorder, borderWidth: 1, elevation: 15, zIndex: 9999 }}>
   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
    <Ionicons name="notifications" size={24} color={colors[config.type || 'info']} />
    <View style={{ flex: 1 }}><Text style={{ color: theme.text, fontSize: 14, fontWeight: '700' }}>{config.title}</Text><Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>{config.body}</Text></View>
    <TouchableOpacity accessibilityLabel="Dismiss notification" onPress={() => setConfig(null)}><Ionicons name="close" size={22} color={theme.text} /></TouchableOpacity>
   </View>
  </View>}
 </Context.Provider>;
}
