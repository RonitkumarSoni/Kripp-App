import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createClerkSupabaseClient(
  getToken: (options?: any) => Promise<string | null>
) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        let clerkToken = null;
        try {
          const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Clerk token timeout")), 2000)
          );
          clerkToken = await Promise.race([
            getToken({ template: "supabase" }),
            timeoutPromise,
          ]);
        } catch (error) {
          console.warn("Clerk token fetch failed:", error);
        }
        const headers = new Headers(options?.headers);
        if (clerkToken) {
          headers.set("Authorization", `Bearer ${clerkToken}`);
        }

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
}
