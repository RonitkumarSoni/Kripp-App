-- 1. Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS saved_properties CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create properties table (Added owner_clerk_id so you can use RLS on it)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_clerk_id TEXT REFERENCES users(clerk_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  type TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqft INTEGER,
  address TEXT,
  city TEXT,
  latitude FLOAT,
  longitude FLOAT,
  images TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_sold BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create saved_properties table
CREATE TABLE saved_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_clerk_id TEXT REFERENCES users(clerk_id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

-- 6. STRICT POLICIES USING CLERK JWT

-- USERS TABLE: Koi bhi apna record read/insert/update kar sakta hai
CREATE POLICY "Users can manage own data" ON users 
  FOR ALL USING (clerk_id = auth.jwt()->>'sub');

-- PROPERTIES TABLE: Read sab kar sakte hain, par Insert/Update/Delete sirf Owner karega
CREATE POLICY "Anyone can read properties" ON properties 
  FOR SELECT USING (true);

CREATE POLICY "Owners can insert properties" ON properties 
  FOR INSERT WITH CHECK (owner_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Owners can update own properties" ON properties 
  FOR UPDATE USING (owner_clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Owners can delete own properties" ON properties 
  FOR DELETE USING (owner_clerk_id = auth.jwt()->>'sub');

-- SAVED PROPERTIES TABLE: Sirf apna saved data read/insert/delete kar sakte hain
CREATE POLICY "Users can manage own saved properties" ON saved_properties 
  FOR ALL USING (user_clerk_id = auth.jwt()->>'sub');
