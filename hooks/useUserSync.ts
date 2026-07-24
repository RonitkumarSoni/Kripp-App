import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { useSupabase } from "./useSupabase";
import { useUserStore } from "../store/useStore";

export const useUserSync = () => {
  const { user } = useUser();
  const setIsAdmin = useUserStore((state) => state.setIsAdmin);
  const authSupabase = useSupabase();

  useEffect(() => {
    if (!user) return;
    
    const syncUser = async () => {
      try {
        const userEmail = user.emailAddresses[0]?.emailAddress || "";
        const userFirstName = user.firstName || "";
        const userLastName = user.lastName || "";
        const userAvatar = user.imageUrl || "";

        // 1. Check if user already exists
        const { data, error: selectError } = await authSupabase
          .from("users")
          .select("clerk_id, is_admin")
          .eq("clerk_id", user.id)
          .maybeSingle();

        if (data) {
          setIsAdmin(data.is_admin ?? false);
          return;
        }

        // 2. Insert new user into Supabase
        const { data: newUser, error: insertError } = await authSupabase
          .from("users")
          .upsert({
            clerk_id: user.id,
            email: userEmail,
            first_name: userFirstName,
            last_name: userLastName,
            avatar_url: userAvatar,
          }, { onConflict: "clerk_id" })
          .select("is_admin")
          .maybeSingle();

        if (newUser) {
          setIsAdmin(newUser.is_admin ?? false);
        }

        if (insertError) {
          console.error("Supabase user sync error:", insertError.message || insertError);
        }
      } catch (err) {
        console.error("Error syncing user to Supabase:", err);
      }
    };

    syncUser();
  }, [user, authSupabase, setIsAdmin]);
};
