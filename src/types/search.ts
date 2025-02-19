export interface SearchFilters {
  category?: string[];
  material?: string[];
  priceRange?: [number, number];
  purity?: string[];
  weight?: [number, number];
  searchTerm?: string;
}

export interface SearchResult {
  products: any[]; // Using existing Product type from your system
  totalCount: number;
  facets: {
    categories: { [key: string]: number };
    materials: { [key: string]: number };
    purities: { [key: string]: number };
  };
}

export interface SearchOptions {
  page: number;
  limit: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popularity';
} 