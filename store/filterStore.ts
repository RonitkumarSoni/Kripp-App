import { create } from "zustand";

interface FilterState {
  search: string;
  type: string | null;
  bedrooms: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  setSearch: (search: string) => void;
  setType: (type: string | null) => void;
  setBedrooms: (bedrooms: number | null) => void;
  setMinPrice: (minPrice: number | null) => void;
  setMaxPrice: (maxPrice: number | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: "",
  type: null,
  bedrooms: null,
  minPrice: null,
  maxPrice: null,
  setSearch: (search) => set({ search }),
  setType: (type) => set({ type }),
  setBedrooms: (bedrooms) => set({ bedrooms }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  resetFilters: () =>
    set({
      search: "",
      type: null,
      bedrooms: null,
      minPrice: null,
      maxPrice: null,
    }),
}));
