# Project Status & Pending Tasks

Here is an overview of what has been accomplished so far and what remains to be completed for the **Kribb Real Estate App**.

## ✅ What's Done

1. **Authentication:** 
   - Integrated Clerk for seamless Sign-Up and Sign-In flows.
   - Handled proper routing based on authentication state.

2. **Core UI & Navigation:** 
   - Bottom Tab Navigation implemented with Home, Search, Create, Saved, and Profile screens.
   - Implemented dynamic Dark and Light Mode themes based on user preference.

3. **Database Integration (Supabase):** 
   - Connected Supabase for storing properties.
   - Created RLS (Row Level Security) policies to ensure users can only modify their own properties.
   - Handled fetching and inserting properties correctly with the `owner_clerk_id`.

4. **Saved Properties:** 
   - Built a robust `useSavedProperty` hook.
   - Locally saved "Seeded" properties using `AsyncStorage` (to bypass DB UUID errors).
   - Saved real user-generated properties directly to the Supabase database.

5. **Property Creation:** 
   - Created a comprehensive "Add Property" screen.
   - Added a WebView-based Map location picker to accurately get Latitude/Longitude coordinates.
   - Upload image support enabled (currently storing local URIs, needs remote storage connection).

6. **Search & Filters:** 
   - Dynamic searching by title/city.
   - Built an interactive filter modal (Property Type, Bedrooms, Price Range) that works seamlessly.

7. **Bug Fixes:**
   - Fixed the Expo Router navigation error (`Attempted to navigate before mounting the Root Layout`).
   - Fixed the `fetchResults` bugs where seeded properties were disappearing when DB properties existed.

---

## ⏳ Pending Tasks (To-Do)

1. **Image Storage:**
   - Currently, property images from the "Create" screen are local URIs. We need to implement uploading these images to an S3 bucket or Supabase Storage and storing their public URLs in the DB.

2. **Chat & Messaging System:**
   - Allow users to directly contact the property owner. 
   - Needs a new Supabase `messages` table and a Chat screen UI.

3. **My Listings (Profile):**
   - In the Profile screen, add a section where a user can view, edit, or delete the properties they have listed.

4. **Real Push Notifications:**
   - Currently, notifications are mock in-app toasts. Need to integrate Expo Push Notifications to send real notifications to devices.

5. **Settings & Preferences:**
   - Persist the toggles in the Settings page (Push Notifications, Email Updates) to the user's DB profile.

6. **Production Polish:**
   - Add Loading Skeleton components while fetching data.
   - Check and configure `app.json` icons, splash screens, and bundle identifiers for production deployment.
   - Run EAS Builds for Android and iOS.
