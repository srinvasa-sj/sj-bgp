import { useState, useEffect, useCallback } from 'react';
import { searchService } from '@/services/searchService';
import { SearchFilters, SearchOptions, SearchResult } from '@/types/search';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_SEARCH_OPTIONS: SearchOptions = {
  page: 1,
  limit: 12,
  sortBy: 'newest'
};

export const useProductSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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

  // Get filters from URL params
  const getFiltersFromParams = useCallback((): SearchFilters => {
    const filters: SearchFilters = {};
    
    const category = searchParams.getAll('category');
    if (category.length) filters.category = category;
    
    const material = searchParams.getAll('material');
    if (material.length) filters.material = material;
    
    const purity = searchParams.getAll('purity');
    if (purity.length) filters.purity = purity;
    
    const searchTerm = searchParams.get('q');
    if (searchTerm) filters.searchTerm = searchTerm;
    
    const minWeight = searchParams.get('minWeight');
    const maxWeight = searchParams.get('maxWeight');
    if (minWeight && maxWeight) {
      filters.weight = [parseFloat(minWeight), parseFloat(maxWeight)];
    }
    
    return filters;
  }, [searchParams]);

  // Get options from URL params
  const getOptionsFromParams = useCallback((): SearchOptions => {
    return {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '12'),
      sortBy: (searchParams.get('sort') as SearchOptions['sortBy']) || 'newest'
    };
  }, [searchParams]);

  // Update URL params with reset handling
  const updateSearchParams = useCallback((
    filters: SearchFilters,
    options: SearchOptions,
    shouldReset: boolean = false
  ) => {
    const params = new URLSearchParams();

    // If resetting, only add the current filter and keep sort
    if (shouldReset) {
      // Keep sort option
      if (options.sortBy) {
        params.set('sort', options.sortBy);
      }
      
      // Add only the current filter
      if (filters.category?.length) {
        filters.category.forEach(cat => params.append('category', cat));
      }
      if (filters.material?.length) {
        filters.material.forEach(mat => params.append('material', mat));
      }
      if (filters.purity?.length) {
        filters.purity.forEach(pur => params.append('purity', pur));
      }
      if (filters.searchTerm) {
        params.set('q', filters.searchTerm);
      }
      
      // Reset page
      params.set('page', '1');
      params.set('limit', options.limit.toString());
    } else {
      // Normal update with all filters
      if (filters.category?.length) {
        filters.category.forEach(cat => params.append('category', cat));
      }
      if (filters.material?.length) {
        filters.material.forEach(mat => params.append('material', mat));
      }
      if (filters.purity?.length) {
        filters.purity.forEach(pur => params.append('purity', pur));
      }
      if (filters.searchTerm) {
        params.set('q', filters.searchTerm);
      }
      if (filters.weight) {
        params.set('minWeight', filters.weight[0].toString());
        params.set('maxWeight', filters.weight[1].toString());
      }

      // Add options to params
      params.set('page', options.page.toString());
      params.set('limit', options.limit.toString());
      if (options.sortBy) {
        params.set('sort', options.sortBy);
      }
    }

    setSearchParams(params);
  }, [setSearchParams]);

  // Search products with debouncing for text search
  const searchProducts = useCallback(async (
    filters: SearchFilters = getFiltersFromParams(),
    options: SearchOptions = getOptionsFromParams(),
    shouldReset: boolean = false
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await searchService.searchProducts(filters, options);
      setSearchResult(result);
      updateSearchParams(filters, options, shouldReset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching products');
    } finally {
      setIsLoading(false);
    }
  }, [getFiltersFromParams, getOptionsFromParams, updateSearchParams]);

  // Initial search on mount and when URL params change
  useEffect(() => {
    searchProducts();
  }, [searchParams, searchProducts]);

  return {
    searchResult,
    isLoading,
    error,
    searchProducts,
    filters: getFiltersFromParams(),
    options: getOptionsFromParams(),
    updateSearchParams
  };
}; 