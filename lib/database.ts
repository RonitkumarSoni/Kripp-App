import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { auth, firebaseApp } from './firebase';
import { Property, SavedProperty } from '../types';
import { SEED_PROPERTIES } from '../constants/data';

export const db = getFirestore(firebaseApp);
const properties = () => collection(db, 'kribb_properties');
const saved = (uid: string) => collection(db, 'kribb_users', uid, 'saved');
function uid() { if (!auth.currentUser) throw new Error('Sign in to continue.'); return auth.currentUser.uid; }
async function result<T>(action: () => Promise<T>): Promise<{ data: T | null; error: Error | null }> {
 try { return { data: await action(), error: null }; } catch (e) { return { data: null, error: e instanceof Error ? e : new Error('Database request failed.') }; }
}
const propertyFromDoc = (snap: any): Property => ({ ...snap.data(), id: snap.id });
export function listProperties(owner?: string) {
 return result(async () => {
  const request = owner ? query(properties(), where('owner_clerk_id', '==', owner)) : properties();
  const snap = await getDocs(request);
  return snap.docs.map(propertyFromDoc).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
 });
}
export function getProperty(id: string) {
 return result(async () => {
  const seed = SEED_PROPERTIES.find(p => p.id === id);
  if (seed) return seed;
  const snap = await getDoc(doc(properties(), id));
  if (!snap.exists()) throw new Error('Property not found.');
  return propertyFromDoc(snap);
 });
}
export function createProperty(value: Omit<Property, 'id' | 'area_sqft' | 'latitude' | 'longitude'> & { area_sqft?: number | null; latitude?: number | null; longitude?: number | null }) {
 return result(async () => {
  const ref = await addDoc(properties(), { ...value, description: value.description || '', owner_clerk_id: uid(), created_at: new Date().toISOString() });
  return ref.id;
 });
}
export function editProperty(id: string, value: Omit<Partial<Property>, 'area_sqft'> & { area_sqft?: number | null }) {
 return result(async () => {
  uid();
  await updateDoc(doc(properties(), id), value);
 });
}
export function removeProperty(id: string) {
 return result(async () => { uid(); await deleteDoc(doc(properties(), id)); });
}
export function getUserProfile(id: string) {
 return result(async () => { const snap = await getDoc(doc(db, 'kribb_users', id)); return snap.exists() ? snap.data() : null; });
}
export function syncUserProfile(value: { email: string; first_name: string; last_name: string; avatar_url: string }) {
 return result(async () => {
  const ref = doc(db, 'kribb_users', uid());
  await setDoc(ref, value, { merge: true });
  return (await getDoc(ref)).data();
 });
}
export function isPropertySaved(id: string) {
 return result(async () => (await getDoc(doc(saved(uid()), id))).exists());
}
export function saveProperty(id: string, save: boolean) {
 return result(async () => {
  const ref = doc(saved(uid()), id);
  if (save) await setDoc(ref, { property_id: id, created_at: new Date().toISOString() });
  else await deleteDoc(ref);
 });
}
export function listSavedProperties() {
 return result(async () => {
  const snap = await getDocs(saved(uid()));
  const records = await Promise.all(snap.docs.map(async record => {
   const { data, error } = await getProperty(record.id);
   if (error && error.message !== 'Property not found.') throw error;
   if (!data) return null;
   return { id: record.id, property_id: record.id, properties: data } as SavedProperty;
  }));
  return records.filter((record): record is SavedProperty => record !== null);
 });
}
