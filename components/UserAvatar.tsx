import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function UserAvatar({ uri, name, email, size = 96 }: { uri?: string; name?: string; email?: string; size?: number }) {
 const { theme } = useTheme();
 const [failed, setFailed] = useState(false);
 useEffect(() => setFailed(false), [uri]);
 const hasValidUri = !!uri && uri.trim().length > 0;
 const initials = (name?.trim() || email?.split('@')[0] || 'User').split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
 return <View accessibilityLabel="Profile photo" style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: theme.accentLight, alignItems: 'center', justifyContent: 'center', borderWidth: hasValidUri && !failed ? 0 : 1.5, borderColor: theme.accent + '40' }}>
  {hasValidUri && !failed ? <Image source={{ uri }} onError={() => setFailed(true)} style={{ width: size, height: size }} /> : <Text style={{ color: theme.accent, fontSize: size * 0.35, fontWeight: '700' }}>{initials}</Text>}
 </View>;
}

