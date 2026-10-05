import { useUser } from "../context/AuthContext";
import { useEffect } from "react";
import * as database from "../lib/database";
import { useUserStore } from "../store/useStore";

export const useUserSync = () => {
  const { user } = useUser();
  const setIsAdmin = useUserStore((state) => state.setIsAdmin);

  useEffect(() => {
    if (!user || !user.id) { setIsAdmin(false); return; }
    let active = true;
    setIsAdmin(false);

    const syncUser = async () => {
      try {
        const userEmail = user.emailAddresses[0]?.emailAddress || "";
        const userFirstName = user.firstName || "";
        const userLastName = user.lastName || "";
        const userAvatar = user.imageUrl || "";

        const { data: newUser, error: insertError } = await database.syncUserProfile({
          email: userEmail, first_name: userFirstName, last_name: userLastName, avatar_url: userAvatar,
        });

        if (newUser && active) {
          setIsAdmin(newUser.is_admin ?? false);
        }

        if (insertError) {
          // Profile sync must not block authentication when the database is unavailable.
          console.warn("Firestore user sync failed:", insertError.message);
        }
      } catch (err) {
        console.warn("User sync failed:", err);
      }
    };

    syncUser();
    return () => { active = false; };
  }, [user?.id, user?.firstName, user?.lastName, user?.imageUrl, user?.primaryEmailAddress.emailAddress, setIsAdmin]);
};
