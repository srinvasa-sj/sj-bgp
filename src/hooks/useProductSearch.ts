import { useState, useEffect, useCallback } from 'react';
import { searchService } from '@/services/searchService';
import { SearchFilters, SearchOptions, SearchResult } from '@/types/search';

const DEFAULT_OPTIONS = {
  page: 1,
  limit: 12
};

export const useProductSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResult>({
    products: [],
    totalCount: 0,
    facets: {
      categories: {},
      materials: {},
      purities: {}
    }
  });

  const fetchProducts = useCallback(async (
    page: number = 1,
    limit: number = 12
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await searchService.search({}, { page, limit });
      
      setSearchResult(prevState => ({
        ...prevState,
        products: result.products,
        totalCount: result.totalCount,
        facets: result.facets
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again.');
      setSearchResult(prevState => ({
        ...prevState,
        products: [],
        totalCount: 0
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchProducts(DEFAULT_OPTIONS.page, DEFAULT_OPTIONS.limit);
  }, [fetchProducts]);

  return {
    products: searchResult.products,
    totalCount: searchResult.totalCount,
    isLoading,
    error,
    fetchProducts
  };
}; 