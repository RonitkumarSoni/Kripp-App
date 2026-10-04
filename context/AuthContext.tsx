import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut, updateProfile, type User } from 'firebase/auth';
import { clearGoogleSession } from '../lib/googleSignIn';
import { uploadImage } from '../lib/images';
import { auth } from '../lib/firebase';

const Context = createContext<{ current: User | null; isLoaded: boolean; refresh: () => Promise<boolean> }>({
 current: null, isLoaded: false, refresh: async () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
 const [current, setCurrent] = useState<User | null>(null);
 const [isLoaded, setLoaded] = useState(false);
 const [revision, setRevision] = useState(0);


 useEffect(() => onAuthStateChanged(auth, (user) => {
  setCurrent(user);

  setRevision(v => v + 1);
  setLoaded(true);
 }), []);

 const refresh = async () => {
  if (!auth.currentUser) return false;
  setCurrent(auth.currentUser);

  setRevision(v => v + 1);
  return true;
 };

 return (
  <Context.Provider value={useMemo(() => ({ current, isLoaded, refresh }), [current, isLoaded, revision])}>
   {children}
  </Context.Provider>
 );
}

export function useAuth() {
 const { current, isLoaded, refresh } = useContext(Context);
 return {
  isLoaded,
  isSignedIn: !!current,
  userId: current?.uid || null,
  signOut: async () => {
   await signOut(auth);
   await clearGoogleSession().catch(() => {});
  },
  refresh,
 };
}

export function useUser() {
 const { current, isLoaded, refresh } = useContext(Context);
 const user = useMemo(() => {
  if (!current) return null;
  const names = (current.displayName || '').split(' ');
  return {
   id: current.uid,
   firstName: names[0] || '',
   lastName: names.slice(1).join(' '),
   imageUrl: current.photoURL || '',
   primaryEmailAddress: { emailAddress: current.email || '' },
   emailAddresses: [{ emailAddress: current.email || '' }],
   setProfileImage: async ({ file }: { file: string }) => {
    const photoURL = await uploadImage(file);
    await updateProfile(current, { photoURL });
    await refresh();
   },
  };
 }, [current, current?.displayName, current?.photoURL]);
 return { user, isLoaded };
}
