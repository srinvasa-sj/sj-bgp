import { useState, useEffect, useMemo, useCallback, memo, useRef, Suspense, useLayoutEffect } from "react";
import { collection, getDocs, query, orderBy, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ProductCard from "@/components/products/ProductCard";
import { useAuth } from '../hooks/useAuth';
import { useRecommendations } from '../hooks/useRecommendations';
import { FilterBar, ProductFilters } from '@/components/products/FilterBar';
import { Category } from "@/types/category";
import { useLocation } from "react-router-dom";
import { debounce } from "lodash";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useQuery, useQueries } from '@tanstack/react-query';
import { batch } from 'react-redux';

// Performance metrics are now using window.performance instead of perf_hooks

const MATERIALS = ['Gold', 'Silver'];
const PURITIES = [
  '18 Karat', '20 Karat', '22 Karat', '24 Karat',
  'Silver 999', 'Silver 925'
];

interface Product {
  name: string;
  productCategory: string;
  material?: string;
  purity?: string;
  weight: number;
  imageUrl: string;
  imageUrls?: string[];
  productID?: string;
  timestamp?: {
    seconds: number;
    nanoseconds: number;
  };
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  viewCount?: number;
  lastViewed?: string;
  calculatedPrice?: number;
}

interface Promotion {
  promotionName: string;
  giftDescription: string;
  priceDiscount: number;
  wastageDiscount: number;
  makingChargesDiscount: number;
  startDate: string;
  endDate: string;
  productName: string;
}

// Memoize the ProductCard component
const MemoizedProductCard = memo(ProductCard);

// Add price lookup table at module level for faster access
const PRICE_MULTIPLIERS = {
  "18 Karat": { baseMultiplier: 0.75, wastageDefault: 8, makingDefault: 12 },
  "20 Karat": { baseMultiplier: 0.833, wastageDefault: 8, makingDefault: 12 },
  "22 Karat": { baseMultiplier: 0.916, wastageDefault: 8, makingDefault: 12 },
  "24 Karat": { baseMultiplier: 1, wastageDefault: 0, makingDefault: 0 },
  "Silver 999": { baseMultiplier: 0.999, wastageDefault: 5, makingDefault: 8 },
  "Silver 925": { baseMultiplier: 0.925, wastageDefault: 5, makingDefault: 8 }
};

// Add global cache
const globalCache = {
  products: new Map<string, Product[]>(),
  priceData: new Map<string, any>(),
  categories: new Map<string, Category[]>(),
  prices: new Map<string, number>()
};

// Add matchesSearch as a utility function outside the component
const matchesSearchUtil = (product: Product, query: string, fields: string[]) => {
  const searchValue = query.toLowerCase();
  return fields.some(field => {
    const value = (product as any)[field];
    if (typeof value === 'number') {
      return value.toString().includes(searchValue);
    }
    if (typeof value === 'string') {
      return value.toLowerCase().includes(searchValue);
    }
    return false;
  });
};

// Add price sorting helper function outside component
const sortProductsByPrice = (products: Product[], sortBy: string, calculatePrice: (product: Product) => number) => {
  console.log('Sorting products by price:', { sortBy, productCount: products.length });
  
  // First ensure all products have calculated prices
  const productsWithPrices = products.map(product => {
    const price = calculatePrice(product);
    console.log(`Product ${product.productID}: ${price}`);
    return {
      ...product,
      calculatedPrice: price
    };
  });

  // Sort based on calculated prices
  const sortedProducts = productsWithPrices.sort((a, b) => {
    const priceA = a.calculatedPrice || 0;
    const priceB = b.calculatedPrice || 0;
    return sortBy === 'price_asc' ? priceA - priceB : priceB - priceA;
  });

  console.log('Sorted products:', sortedProducts.map(p => ({ id: p.productID, price: p.calculatedPrice })));
  return sortedProducts;
};

const Products = () => {
  const { user } = useAuth();
  const {
    recommendations,
    isLoading: isRecommendationsLoading,
    trackProductView
  } = useRecommendations(user?.uid || null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [promotions, setPromotions] = useState<{ [key: string]: Promotion }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const itemsPerPage = 100;

  const [currentProductId, setCurrentProductId] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'default'
  });

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Add new state for header filtering
  const [headerFilteredProducts, setHeaderFilteredProducts] = useState<Product[]>([]);
  const location = useLocation();

  const priceCache = useRef<{ [key: string]: number }>({});
  const [priceData, setPriceData] = useState<any>(null);

  // Add new state for price-sorted products
  const [priceSortedProducts, setPriceSortedProducts] = useState<Product[]>([]);

  // Add performance tracking state
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalLoadTime: 0,
    dataFetchTime: 0,
    renderTime: 0,
    initializationTime: 0
  });

  // Add performance tracking ref
  const performanceRef = useRef({
    startTime: 0,
    dataFetchStart: 0,
    renderStart: 0
  });

  // Add at the start of the component
  useLayoutEffect(() => {
    performanceRef.current.startTime = window.performance.now();
    console.log('Page load started at:', new Date().toISOString());
  }, []);

  // Replace the calculatePrice function
  const calculatePrice = useCallback((product: Product) => {
    console.log('Calculating price for:', {
      productId: product?.productID,
      priceData: priceData,
      material: product?.material,
      purity: product?.purity,
      weight: product?.weight
    });

    if (!product?.productID || !priceData || !product?.purity || !product?.material || !product?.weight) {
      return 0;
    }

    try {
      const multipliers = PRICE_MULTIPLIERS[product.purity as keyof typeof PRICE_MULTIPLIERS];
      if (!multipliers) return 0;

      let basePrice = 0;
      const weight = parseFloat(product.weight.toString()) || 0;
      
      if (weight <= 0) return 0;

      // Get raw price from priceData
      if (product.material === 'Gold') {
        // Ensure we're accessing the correct property name from priceData
        const goldPrice = priceData.goldPrice || priceData.price24Karat || priceData.price24K;
        console.log('Gold price calculation:', {
          rawPrice: goldPrice,
          multiplier: multipliers.baseMultiplier
        });
        if (!goldPrice) return 0;
        basePrice = Number(goldPrice) * multipliers.baseMultiplier;
      } else if (product.material === 'Silver') {
        // Ensure we're accessing the correct property name from priceData
        const silverPrice = priceData.silverPrice || priceData.priceSilver999 || priceData.silver999;
        console.log('Silver price calculation:', {
          rawPrice: silverPrice,
          multiplier: multipliers.baseMultiplier
        });
        if (!silverPrice) return 0;
        basePrice = Number(silverPrice) * multipliers.baseMultiplier;
      }

      console.log('Base price calculated:', basePrice);

      if (basePrice <= 0) return 0;

      const baseAmount = basePrice * weight;
      const wastageCharges = baseAmount * (multipliers.wastageDefault / 100);
      const makingCharges = multipliers.makingDefault * weight;

      console.log('Price components:', {
        baseAmount,
        wastageCharges,
        makingCharges
      });
      
      if (isNaN(baseAmount) || isNaN(wastageCharges) || isNaN(makingCharges)) {
        return 0;
      }

      const totalPrice = Math.round((baseAmount + wastageCharges + makingCharges) * 100) / 100;
      console.log('Final price:', totalPrice);

      if (totalPrice > 0) {
        const cacheKey = `${product.productID}-${product.purity}-${product.weight}`;
        globalCache.prices.set(cacheKey, totalPrice);
        priceCache.current[cacheKey] = totalPrice;
      }
      
      return totalPrice;
    } catch (error) {
      console.error('Error calculating price:', error);
      return 0;
    }
  }, [priceData]);

  const processProducts = useCallback((doc: any): Product[] => {
    if (!doc.exists() || !doc.data().products) return [];
    
    const productsArray = doc.data().products || [];
    return productsArray.map((data: any) => ({
          name: data.name || '',
          productCategory: data.category || data.productCategory || '',
          material: data.material,
          purity: data.purity,
          weight: parseFloat(data.weight) || 0,
          imageUrl: data.imageUrl || data.image || '',
          imageUrls: data.imageUrls || [],
          productID: data.productID || data.id,
          timestamp: data.timestamp || data.createdAt || {
            seconds: Date.now() / 1000,
            nanoseconds: 0
          },
          viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
          lastViewed: data.lastViewed || null
    }));
  }, []);

  const processCategories = useCallback((snapshot: any): Category[] => {
    const categories: Category[] = [];
    snapshot.forEach((doc: any) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });
    return categories;
  }, []);

  const processPromotions = useCallback((snapshot: any): { [key: string]: Promotion } => {
    const currentDate = new Date();
    const promotions: { [key: string]: Promotion } = {};
    
    console.log('Processing promotions at:', currentDate.toISOString());
    
    snapshot.forEach((doc: any) => {
      const promoData = doc.data() as Promotion;
      
      // Parse dates and normalize to UTC
        const startDate = new Date(promoData.startDate);
        const endDate = new Date(promoData.endDate);
      const startUTC = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
      const endUTC = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59));
      const currentUTC = new Date(Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()));

      console.log('Promotion date check:', {
        promoName: promoData.promotionName,
        startDate: startUTC.toISOString(),
        endDate: endUTC.toISOString(),
        currentDate: currentUTC.toISOString(),
        isActive: currentUTC >= startUTC && currentUTC <= endUTC
      });
      
      if (currentUTC >= startUTC && currentUTC <= endUTC) {
        console.log('Adding active promotion:', promoData.promotionName);
        promotions[promoData.productName] = {
          ...promoData,
          startDate: startUTC.toISOString(),
          endDate: endUTC.toISOString()
        };
      }
    });
    
    console.log('Active promotions:', Object.keys(promotions));
    return promotions;
  }, []);

  const initializeData = useCallback(async () => {
    const startTime = window.performance.now();
    console.log('Starting data initialization at:', new Date().toISOString());
    
    try {
      setIsLoading(true);

      // Fetch fresh data in parallel
      const fetchStartTime = window.performance.now();
      const [productDoc, priceDoc, categoriesSnapshot, promotionsSnapshot] = await Promise.all([
        getDoc(doc(db, "productData", "zzeEfRyePYTdWemfHHWH")),
        getDoc(doc(db, "priceData", "4OhZCKHQls64bokVqGN5")),
        getDocs(query(collection(db, 'categories'), orderBy('sortOrder'))),
        getDocs(collection(db, "promotions"))
      ]);
      const fetchEndTime = window.performance.now();
      console.log('Data fetch completed in:', fetchEndTime - fetchStartTime, 'ms');

      const processStartTime = window.performance.now();
      const processedProducts = processProducts(productDoc);
      const processedPriceData = priceDoc.exists() ? priceDoc.data() : null;
      const processedCategories = processCategories(categoriesSnapshot);
      const processedPromotions = processPromotions(promotionsSnapshot);
      const processEndTime = window.performance.now();
      console.log('Data processing completed in:', processEndTime - processStartTime, 'ms');

      // Update state
      const updateStartTime = window.performance.now();
      setProducts(processedProducts);
      setPriceData(processedPriceData);
      setCategories(processedCategories);
      setPromotions(processedPromotions);
      setHeaderFilteredProducts(processedProducts);
      setFilteredProducts(processedProducts);
      const updateEndTime = window.performance.now();
      console.log('State update completed in:', updateEndTime - updateStartTime, 'ms');

      const totalTime = window.performance.now() - startTime;
      console.log('Total initialization time:', totalTime, 'ms');
      
      setPerformanceMetrics({
        totalLoadTime: totalTime,
        dataFetchTime: fetchEndTime - fetchStartTime,
        renderTime: updateEndTime - updateStartTime,
        initializationTime: processEndTime - processStartTime
      });

    } catch (error) {
      console.error("Error initializing data:", error);
      toast.error("Error loading data");
    } finally {
      setIsLoading(false);
    }
  }, [processProducts, processCategories, processPromotions]);

  // Add performance monitoring effect
  useEffect(() => {
    const renderStart = window.performance.now();
    performanceRef.current.renderStart = renderStart;

    return () => {
      const renderTime = window.performance.now() - renderStart;
      const totalTime = window.performance.now() - performanceRef.current.startTime;
      
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime,
        totalLoadTime: totalTime,
        initializationTime: prev.initializationTime
      }));

      console.log('Performance Metrics:', {
        totalLoadTime: totalTime.toFixed(2) + 'ms',
        dataFetchTime: performanceMetrics.dataFetchTime.toFixed(2) + 'ms',
        renderTime: renderTime.toFixed(2) + 'ms',
        initializationTime: performanceMetrics.initializationTime.toFixed(2) + 'ms'
      });
    };
  }, []);

  // Add performance display in the UI
  const renderPerformanceMetrics = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="fixed bottom-4 right-4 bg-white/80 text-white p-4 rounded-lg text-sm">
          {/* <h3 className="font-bold mb-2">Performance Metrics</h3>
          <div>Total Load: {performanceMetrics.totalLoadTime.toFixed(2)}ms</div>
          <div>Data Fetch: {performanceMetrics.dataFetchTime.toFixed(2)}ms</div>
          <div>Render: {performanceMetrics.renderTime.toFixed(2)}ms</div>
          <div>Init: {performanceMetrics.initializationTime.toFixed(2)}ms</div> */}
        </div>
      );
    }
    return null;
  };

  // Update the filtering effect
  useEffect(() => {
    const applyFilters = async () => {
      setIsFiltering(true);
      try {
        console.log('Applying filters:', filters, 'Price data available:', !!priceData);
        
        // Start with base products
        let filtered = [...(showWishlist ? wishlist : products)];
        const params = new URLSearchParams(location.search);

        // Apply search filter
        const searchQuery = params.get("search");
        const searchFields = params.get("searchFields")?.split(",") || [];
        if (searchQuery && searchFields.length > 0) {
          filtered = filtered.filter(product => 
            matchesSearchUtil(product, searchQuery, searchFields)
          );
        }

        // Apply category filters
        if (filters.parentCategory) {
          const parentCategory = categories.find(c => c.id === filters.parentCategory);
          if (parentCategory) {
            const childCategories = categories.filter(c => c.parentId === parentCategory.id);
            const validCategories = [parentCategory.name, ...childCategories.map(c => c.name)];
            filtered = filtered.filter(product => validCategories.includes(product.productCategory));
          }
        }

        if (filters.subCategory) {
          const subCategory = categories.find(c => c.id === filters.subCategory);
          if (subCategory) {
            filtered = filtered.filter(product => product.productCategory === subCategory.name);
          }
    }

    // Apply material filter
        if (filters.material) {
      filtered = filtered.filter(product => 
            product.material?.toLowerCase() === filters.material?.toLowerCase()
      );
    }

    // Apply purity filter
        if (filters.purity) {
      filtered = filtered.filter(product => 
            product.purity === filters.purity
          );
        }

        // Handle price sorting only if priceData is available
        if (filters.sortBy === 'price_asc' || filters.sortBy === 'price_desc') {
          if (priceData) {
            console.log('Applying price sorting:', filters.sortBy);
            const sortedProducts = sortProductsByPrice(filtered, filters.sortBy, calculatePrice);
            setPriceSortedProducts(sortedProducts);
            setFilteredProducts(sortedProducts);
            } else {
            console.log('Price sorting delayed - waiting for price data');
            setFilteredProducts(filtered);
            // Store the filter for reapplication when priceData becomes available
            setPriceSortedProducts([]);
            }
        } else {
          setPriceSortedProducts([]);
          setFilteredProducts(filtered);
    }

      } catch (error) {
        console.error('Error applying filters:', error);
        toast.error('Error filtering products');
      } finally {
        setIsFiltering(false);
      }
    };

    applyFilters();
  }, [products, wishlist, showWishlist, filters, categories, location.search, calculatePrice, priceData]);

  // Add effect to reapply price sorting when priceData becomes available
  useEffect(() => {
    if (priceData && (filters.sortBy === 'price_asc' || filters.sortBy === 'price_desc')) {
      console.log('Price data became available, reapplying price sorting');
      const filtered = [...(showWishlist ? wishlist : products)];
      const sortedProducts = sortProductsByPrice(filtered, filters.sortBy, calculatePrice);
      setPriceSortedProducts(sortedProducts);
      setFilteredProducts(sortedProducts);
    }
  }, [priceData, filters.sortBy, products, wishlist, showWishlist, calculatePrice]);

  // Update displayProducts logic
  const displayProducts = useMemo(() => {
    console.log('Updating displayProducts:', {
      filterType: filters.sortBy,
      priceSortedCount: priceSortedProducts.length,
      filteredCount: filteredProducts.length,
      priceDataAvailable: !!priceData
    });

    // If price sorting is active and we have priceData, use priceSortedProducts
    if ((filters.sortBy === 'price_asc' || filters.sortBy === 'price_desc') && priceData) {
      return priceSortedProducts;
    }

    // For header filtering
    let productsToDisplay = headerFilteredProducts;

    // Apply other filters
    if (Object.keys(filters).length > 0) {
      productsToDisplay = filteredProducts.filter(product => 
        headerFilteredProducts.some(hp => hp.productID === product.productID)
      );
    }

    return productsToDisplay;
  }, [headerFilteredProducts, filteredProducts, filters.sortBy, priceSortedProducts, priceData]);

  // Update paginatedProducts to use displayProducts instead of filteredProducts
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayProducts.slice(startIndex, endIndex);
  }, [displayProducts, currentPage, itemsPerPage]);

  // Memoized total pages
  const totalPages = useMemo(() => {
    return Math.ceil(displayProducts.length / itemsPerPage);
  }, [displayProducts, itemsPerPage]);

  const handleProductView = async (product: Product) => {
    if (!product.productID) return;

    try {
      const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return;

      // Update local state first for immediate feedback
      setProducts(prevProducts => 
        prevProducts.map(p => {
          if (p.productID === product.productID) {
            return {
              ...p,
              viewCount: (p.viewCount || 0) + 1,
              lastViewed: new Date().toISOString()
            };
          }
          return p;
        })
      );

      // Update Firestore in the background
      const data = docSnap.data();
      const updatedProducts = data.products.map((p: any) => {
        if (p.productID === product.productID) {
          return {
            ...p,
            viewCount: (p.viewCount || 0) + 1,
            lastViewed: new Date().toISOString()
          };
        }
        return p;
      });

      await updateDoc(docRef, { products: updatedProducts });
    } catch (error) {
      console.error('Error updating product view:', error);
      // Revert local state if Firestore update fails
      setProducts(prevProducts => 
        prevProducts.map(p => {
          if (p.productID === product.productID) {
            return {
              ...p,
              viewCount: (p.viewCount || 0) - 1
            };
          }
          return p;
        })
      );
    }
  };

  const renderTrendingProducts = () => {
    const productsWithViews = products.filter(p => (p.viewCount || 0) > 0);
    console.log('Debug trending products:', {
      totalProducts: products.length,
      productsWithViews: productsWithViews.length,
      viewCounts: products.map(p => ({
        id: p.productID,
        name: p.name,
        viewCount: p.viewCount || 0
      }))
    });

    // Only show trending section if we have products with views
    const trendingProducts = products
      .filter(product => (product.viewCount || 0) > 0)
      .sort((a, b) => ((b.viewCount || 0) - (a.viewCount || 0)))
      .slice(0, 5);

    if (trendingProducts.length === 0) {
      console.log('No trending products to display');
      return null;
    }

    console.log('Displaying trending products:', 
      trendingProducts.map(p => ({
        id: p.productID,
        name: p.name,
        viewCount: p.viewCount
      }))
    );

    return (
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Top Trending Products ({trendingProducts.length})
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {trendingProducts.map((product) => (
            <MemoizedProductCard
              key={`trending-${product.productID}`}
              product={product}
              onAddToWishlist={handleAddToWishlist}
              isInWishlist={wishlist.some(w => w.productID === product.productID)}
              activePromotion={promotions[product.name]}
              onView={() => {
                if (product.productID) {
                  setCurrentProductId(product.productID);
                  handleProductView(product);
                }
              }}
              isTrending
            />
          ))}
        </div>
      </div>
    );
  };

  // Add new useEffect for header category filtering
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const headerFilter = params.get("headerFilter");
    const headerCategory = params.get("headerCategory");
    const headerSubCategory = params.get("headerSubCategory");
    const includeSubcategories = params.get("includeSubcategories");

    if (!headerFilter) {
      setHeaderFilteredProducts(products);
      return;
    }

    // Filter products based on header category selection
    const filtered = products.filter(product => {
      if (headerSubCategory) {
        // If subcategory is selected, filter by exact category match (existing behavior)
        return product.productCategory.toLowerCase() === headerFilter.toLowerCase();
      } else if (headerCategory && includeSubcategories === "true") {
        // For parent category, include all subcategories
        const clickedCategory = categories.find(cat => cat.id === headerCategory);
        if (!clickedCategory) return false;

        // Get all subcategories of the clicked category
        const subcategories = categories.filter(cat => cat.parentId === headerCategory);
        const validCategories = [clickedCategory.name, ...subcategories.map(cat => cat.name)];
        
        // Match if product category matches parent or any subcategory
        return validCategories.some(catName => 
          product.productCategory.toLowerCase() === catName.toLowerCase()
        );
      } else if (headerCategory) {
        // If main category without includeSubcategories, match exact category
        return product.productCategory.toLowerCase() === headerFilter.toLowerCase();
      }
      return true;
    });

    setHeaderFilteredProducts(filtered);
  }, [location.search, products, categories]);

  const handleAddToWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const isInWishlist = prev.some(item => item.productID === product.productID);
      const newWishlist = isInWishlist
        ? prev.filter(item => item.productID !== product.productID)
        : [...prev, product];
      
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  }, []);

  // Update the useEffect to use the new initialization
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Our Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 8].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-28 sm:pt-24">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl lg:text-4xl font-bold">
              {showWishlist ? "My Wishlist" : "Our Products"}
            </h1>
            <button
              onClick={() => setShowWishlist(!showWishlist)}
              className="text-primary hover:text-primary/80 font-semibold"
            >
              {showWishlist ? "Show All Products" : "Show Wishlist"}
            </button>
          </div>

          <FilterBar
            onFilterChange={setFilters}
            materials={MATERIALS}
            purities={PURITIES}
            categories={categories}
          />

          <div className="mb-4 text-gray-600">
            Found {displayProducts.length} products {totalPages > 1 ? `(Page ${currentPage} of ${totalPages})` : ''}
          </div>

          {isFiltering ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[600px]">
              {paginatedProducts.map((product) => (
                <div
                  key={`${product.productID}-${product.name}`}
                  className="transform transition-transform duration-200 hover:scale-[1.02]"
                >
                  <MemoizedProductCard
                    product={product}
                    onAddToWishlist={handleAddToWishlist}
                    isInWishlist={wishlist.some(w => w.productID === product.productID)}
                    activePromotion={promotions[product.name]}
                  onView={() => {
                    if (product.productID) {
                      setCurrentProductId(product.productID);
                      handleProductView(product);
                    }
                  }}
                  />
                </div>
              ))}
            </div>
          )}

          {renderTrendingProducts()}

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center space-x-2">
                  <button
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage - 2 + i;
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>

                  <button
                className={`px-4 py-2 rounded-lg ${
                  currentPage >= totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </button>
                </div>
          )}

          {renderPerformanceMetrics()}
        </div>
      </div>
    </div>
  );
};

export default Products;