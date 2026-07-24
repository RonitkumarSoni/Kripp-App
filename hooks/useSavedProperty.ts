import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-expo";
import { useSupabase } from "./useSupabase";
import { useInAppNotification } from "../context/NotificationContext";

export function useSavedProperty(propertyId: string, onUnsave?: () => void) {
  const { user } = useUser();
  const supabase = useSupabase();
  const { showNotification } = useInAppNotification();
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (!user || !propertyId) return;
    let isMounted = true;

    const checkSaved = async () => {
      try {
        const { data } = await supabase
          .from("saved_properties")
          .select("id")
          .eq("user_clerk_id", user.id)
          .eq("property_id", propertyId)
          .maybeSingle();

        if (isMounted) {
          setIsSaved(!!data);
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
    if (!user || !propertyId || saveLoading) return;
    setSaveLoading(true);
    const prevSaved = isSaved;
    setIsSaved(!prevSaved);

    try {
      if (prevSaved) {
        try {
          const Haptics = require("expo-haptics");
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {}
        await supabase
          .from("saved_properties")
          .delete()
          .eq("user_clerk_id", user.id)
          .eq("property_id", propertyId);
        if (onUnsave) onUnsave();
        showNotification({
          title: "Removed from Saved",
          body: "This property has been unsaved.",
          type: "info",
        });
      } else {
        try {
          const Haptics = require("expo-haptics");
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {}
        await supabase.from("saved_properties").insert({
          user_clerk_id: user.id,
          property_id: propertyId,
        });
        showNotification({
          title: "Property Saved",
          body: "Added to your saved collection.",
          type: "success",
        });
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
