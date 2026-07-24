import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSupabase } from "./useSupabase";
import { useInAppNotification } from "../context/NotificationContext";

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
  const { user } = useUser();
  const supabase = useSupabase();
  const { showNotification } = useInAppNotification();
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    let isMounted = true;

    const checkSaved = async () => {
      try {
        if (isLocalProperty(propertyId)) {
          // Check AsyncStorage for seeded properties
          const ids = await getLocalSavedIds();
          if (isMounted) setIsSaved(ids.includes(propertyId));
        } else if (user) {
          // Check Supabase for real DB properties
          const { data } = await supabase
            .from("saved_properties")
            .select("id")
            .eq("user_clerk_id", user.id)
            .eq("property_id", propertyId)
            .maybeSingle();
          if (isMounted) setIsSaved(!!data);
        }
      } catch (err) {
        console.error("Error checking saved state:", err);
      }
    };

    checkSaved();
    return () => {
      isMounted = false;
    };
  }, [user, propertyId]);

  const toggleSave = async () => {
    if (!propertyId || saveLoading) return;
    setSaveLoading(true);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);

    try {
      // Haptic feedback
      try {
        const Haptics = require("expo-haptics");
        if (prevSaved) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
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
            body: "This property has been unsaved.",
            type: "info",
          });
        } else {
          if (!ids.includes(propertyId)) {
            await setLocalSavedIds([...ids, propertyId]);
          }
          showNotification({
            title: "Property Saved",
            body: "Added to your saved collection.",
            type: "success",
          });
        }
      } else {
        // ─── Real DB property: use Supabase ─────────────────────
        if (!user) return;

        if (prevSaved) {
          const { error } = await supabase
            .from("saved_properties")
            .delete()
            .eq("user_clerk_id", user.id)
            .eq("property_id", propertyId);
            
          if (error) {
            console.error("Supabase delete error:", error);
            setIsSaved(prevSaved);
            return showNotification({ title: "Error", body: "Could not unsave.", type: "error" });
          }
            
          if (onUnsave) onUnsave();
          showNotification({
            title: "Removed from Saved",
            body: "This property has been unsaved.",
            type: "info",
          });
        } else {
          const { error } = await supabase.from("saved_properties").insert({
            user_clerk_id: user.id,
            property_id: propertyId,
          });
          
          if (error) {
            console.error("Supabase insert error:", error);
            setIsSaved(prevSaved);
            return showNotification({ title: "Error", body: "Could not save property. Check DB constraints.", type: "error" });
          }
          
          showNotification({
            title: "Property Saved",
            body: "Added to your saved collection.",
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
