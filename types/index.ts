export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft?: number;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  is_featured?: boolean;
  is_sold?: boolean;
  created_at?: string;
  owner_clerk_id?: string;
}

export interface SavedProperty {
  id: string;
  property_id: string;
  properties: Property;
  user_clerk_id?: string;
}
