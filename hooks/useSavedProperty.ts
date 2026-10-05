import { useState, useEffect } from "react";
import { useUser } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as database from "../lib/database";
import { useInAppNotification } from "../context/NotificationContext";
import { MESSAGES } from "../constants/messages";
import { auth } from "../lib/firebase";

const LOCAL_SAVED_KEY = "kribb_local_saved_properties";

/**
 * Returns true if the property ID is a local/seeded one (not a UUID in the DB).
 */
function isLocalProperty(propertyId: string): boolean {
  return propertyId.startsWith("prop_");
}

async function getLocalSavedIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setLocalSavedIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(ids));
}

export function useSavedProperty(propertyId: string, onUnsave?: () => void) {
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  const { showNotification } = useInAppNotification();
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    setIsSaved(false);
    if (!propertyId) return;
    if (!isLocalProperty(propertyId) && (!isLoaded || !userId || auth.currentUser?.uid !== userId)) return;
    let isMounted = true;

    const checkSaved = async () => {
      try {
        if (isLocalProperty(propertyId)) {
          // Check AsyncStorage for seeded properties
          const ids = await getLocalSavedIds();
          if (isMounted) setIsSaved(ids.includes(propertyId));
        } else if (userId && auth.currentUser?.uid === userId) {
          // Check Firestore for real DB properties
          const { data, error } = await database.isPropertySaved(propertyId);
          if (error) throw error;
          if (isMounted && auth.currentUser?.uid === userId) setIsSaved(!!data);
        }
      } catch (err) {
        if (isMounted && auth.currentUser?.uid === userId) console.error("Error checking saved state:", err);
      }
    };

    checkSaved();
    return () => {
      isMounted = false;
    };
  }, [userId, isLoaded, propertyId]);

  const toggleSave = async () => {
    if (!propertyId || saveLoading) return;
    if (!isLocalProperty(propertyId) && (!isLoaded || !userId || auth.currentUser?.uid !== userId)) {
      showNotification({ title: "Sign in required", body: "Sign in to save this property.", type: "info" });
      return;
    }
    setSaveLoading(true);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);

    try {
      // Haptic feedback
      try {
        const Haptics = require("expo-haptics");
        if (prevSaved) {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } else {
          void Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          ).catch(() => {});
        }
      } catch {}

      if (isLocalProperty(propertyId)) {
        // ─── Local/Seeded property: use AsyncStorage ────────────
        const ids = await getLocalSavedIds();

        if (prevSaved) {
          await setLocalSavedIds(ids.filter((id) => id !== propertyId));
          if (onUnsave) onUnsave();
          showNotification({
            title: "Removed from Saved",
            body: MESSAGES.PROPERTY.UNSAVE_SUCCESS,
            type: "info",
          });
        } else {
          if (!ids.includes(propertyId)) {
            await setLocalSavedIds([...ids, propertyId]);
          }
          showNotification({
            title: "Property Saved",
            body: MESSAGES.PROPERTY.SAVE_SUCCESS,
            type: "success",
          });
        }
      } else {
        // ─── Real DB property: use Firestore ─────────────────────
        if (!user) return;

        if (prevSaved) {
          const { error } = await database.saveProperty(propertyId, false);
            
          if (error) {
            console.error("Firestore delete error:", error);
            setIsSaved(prevSaved);
            return showNotification({ title: "Error", body: MESSAGES.PROPERTY.UNSAVE_ERROR, type: "error" });
          }
            
          if (onUnsave) onUnsave();
          showNotification({
            title: "Removed from Saved",
            body: MESSAGES.PROPERTY.UNSAVE_SUCCESS,
            type: "info",
          });
        } else {
          const { error } = await database.saveProperty(propertyId, true);
          
          if (error) {
            console.error("Firestore insert error:", error);
            setIsSaved(prevSaved);
            return showNotification({ title: "Error", body: MESSAGES.PROPERTY.SAVE_ERROR, type: "error" });
          }
          
          showNotification({
            title: "Property Saved",
            body: MESSAGES.PROPERTY.SAVE_SUCCESS,
            type: "success",
          });
        }
      }
    } catch (err) {
      console.error("Error toggling save:", err);
      setIsSaved(prevSaved);
    } finally {
      setSaveLoading(false);
    }
  };

  return { isSaved, saveLoading, toggleSave };
}
