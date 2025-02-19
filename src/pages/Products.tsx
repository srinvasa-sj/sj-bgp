import { useState, useEffect, useMemo, useCallback } from "react";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import ProductCard from "@/components/products/ProductCard";
import { useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Category } from "@/types/category";
import { useProductSearch } from '../hooks/useProductSearch';
import { useRecommendations } from '../hooks/useRecommendations';
import { useAuth } from '../hooks/useAuth';
import debounce from 'lodash/debounce';
import { searchService } from '../services/searchService';

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

const Products = () => {
  const { user } = useAuth();
  const {
    searchResult,
    isLoading: isSearchLoading,
    error: searchError,
    searchProducts,
    filters,
    options,
    updateSearchParams
  } = useProductSearch();

  const {
    recommendations,
    isLoading: isRecommendationsLoading,
    trackProductView
  } = useRecommendations(user?.uid || null);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [searchParams] = useSearchParams();
  const [promotions, setPromotions] = useState<{ [key: string]: Promotion }>({});
  const [priceRanges, setPriceRanges] = useState<{ [key: string]: number }>({});
  const [categories, setCategories] = useState<Category[]>([]);

  // Advanced filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");
  const [selectedPurity, setSelectedPurity] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  const [currentProductId, setCurrentProductId] = useState<string | null>(null);

  const materials = ["Gold", "Silver"];
  const purities = {
    Gold: ["18 Karat", "20 Karat", "22 Karat", "24 Karat"],
    Silver: ["Silver 999", "Silver 925"]
  };

  const [popularityCache, setPopularityCache] = useState<{ [key: string]: number }>({});

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, orderBy("sortOrder"));
      const querySnapshot = await getDocs(q);
      const fetchedCategories = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Category[];
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error loading categories");
    }
  };

  const getSubcategoryIds = (categoryId: string): string[] => {
    const subcategories = categories.filter(cat => cat.id === categoryId);
    let allSubcategoryIds = [categoryId];
    
    subcategories.forEach(subcat => {
      allSubcategoryIds = [...allSubcategoryIds, ...getSubcategoryIds(subcat.id)];
    });
    
    return allSubcategoryIds;
  };

  const fetchPromotions = async () => {
    try {
      const promotionsSnapshot = await getDocs(collection(db, "promotions"));
      const currentDate = new Date();
      const activePromotions: { [key: string]: Promotion } = {};

      promotionsSnapshot.forEach((doc) => {
        const promoData = doc.data() as Promotion;
        const startDate = new Date(promoData.startDate);
        const endDate = new Date(promoData.endDate);
        
        if (currentDate >= startDate && currentDate <= endDate) {
          activePromotions[promoData.productName] = promoData;
        }
      });

      setPromotions(activePromotions);
      console.log("Active promotions:", activePromotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const docRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().products) {
          const productsData = docSnap.data().products;

          // Sort products based on timestamp (newest first)
          const sortedProducts = productsData.sort((a: Product, b: Product) => {
            if (a.timestamp && b.timestamp) {
              return b.timestamp.seconds - a.timestamp.seconds;
            }
            return 0;
          });

          setProducts(sortedProducts);
          await fetchPromotions();
          console.log("Products fetched:", sortedProducts);
        } else {
          console.log("No products found");
          toast.error("No products available");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Error loading products");
        setIsLoading(false);
      }
    };

    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    const calculatePrices = async () => {
      const priceDocRef = doc(db, "priceData", "4OhZCKHQls64bokVqGN5");
      try {
        const priceDocSnap = await getDoc(priceDocRef);
        if (!priceDocSnap.exists()) return;

        const priceData = priceDocSnap.data();
        const prices: { [key: string]: number } = {};

        products.forEach((product) => {
          let basePrice = 0;
          let wastagePercentage = 0;
          let makingChargesPerGram = 0;
          let applyWastageMakingCharges = true;

          switch (product.purity) {
            case "18 Karat":
              basePrice = priceData.price18Karat;
              wastagePercentage = priceData.goldwastageCharges;
              makingChargesPerGram = priceData.goldmakingCharges;
              break;
            case "20 Karat":
              basePrice = priceData.price20Karat;
              wastagePercentage = priceData.goldwastageCharges;
              makingChargesPerGram = priceData.goldmakingCharges;
              break;
            case "22 Karat":
              basePrice = priceData.price22Karat;
              wastagePercentage = priceData.goldwastageCharges;
              makingChargesPerGram = priceData.goldmakingCharges;
              break;
            case "24 Karat":
              basePrice = priceData.price24Karat;
              applyWastageMakingCharges = false;
              break;
            case "Silver 999":
              basePrice = priceData.priceSilver999;
              wastagePercentage = priceData.wastageChargesSilver;
              makingChargesPerGram = priceData.makingChargesSilver;
              break;
            case "Silver 925":
              basePrice = priceData.priceSilver2;
              wastagePercentage = priceData.wastageChargesSilver;
              makingChargesPerGram = priceData.makingChargesSilver;
              break;
            default:
              return;
          }

          const baseAmount = basePrice * product.weight;
          let totalPrice = baseAmount;

          if (applyWastageMakingCharges) {
            const wastageCharges = baseAmount * (wastagePercentage / 100);
            const makingCharges = makingChargesPerGram * product.weight;
            totalPrice = baseAmount + wastageCharges + makingCharges;
          }

          const promotion = promotions[product.name];
          if (promotion) {
            const discountedBasePrice = basePrice * (1 - promotion.priceDiscount / 100);
            const discountedWastage = applyWastageMakingCharges
              ? baseAmount * ((wastagePercentage * (1 - promotion.wastageDiscount / 100)) / 100)
              : 0;
            const discountedMaking = applyWastageMakingCharges
              ? makingChargesPerGram * (1 - promotion.makingChargesDiscount / 100) * product.weight
              : 0;

            totalPrice = discountedBasePrice * product.weight + discountedWastage + discountedMaking;
          }

          prices[product.name] = totalPrice;
        });

        setPriceRanges(prices);
      } catch (error) {
        console.error("Error calculating prices:", error);
      }
    };

    if (products.length > 0) {
      calculatePrices();
    }
  }, [products, promotions]);

  useEffect(() => {
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let filtered = [...products];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(product => {
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.productCategory.toLowerCase().includes(searchLower) ||
          product.material?.toLowerCase().includes(searchLower) ||
          product.purity?.toLowerCase().includes(searchLower) ||
          product.weight.toString().includes(searchLower)
        );
      });
    }

    // Apply category filter
    if ((category && category !== "all") || (selectedCategory !== "all")) {
      const filterCategory = category || selectedCategory;
      filtered = filtered.filter(product => 
        product.productCategory === filterCategory
      );
    }

    // Apply material filter
    if (selectedMaterial && selectedMaterial !== "all") {
      filtered = filtered.filter(product => 
        product.material === selectedMaterial
      );
    }

    // Apply purity filter
    if (selectedPurity && selectedPurity !== "all") {
      filtered = filtered.filter(product => 
        product.purity === selectedPurity
      );
    }

    // Apply price range filter
    if (priceRange[0] !== 0 || priceRange[1] !== 1000000) {
      filtered = filtered.filter(product => {
        const price = priceRanges[product.name];
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    setFilteredProducts(filtered);
  }, [searchParams, selectedCategory, selectedMaterial, selectedPurity, priceRange, products, priceRanges]);

  useEffect(() => {
    if (searchResult.products.length > 0) {
      // Only update if there's a significant change in the products
      const currentIds = new Set(filteredProducts.map(p => p.productID));
      const newIds = new Set(searchResult.products.map(p => p.productID));
      
      const hasChanges = searchResult.products.length !== filteredProducts.length ||
        searchResult.products.some(p => !currentIds.has(p.productID)) ||
        filteredProducts.some(p => !newIds.has(p.productID));

      if (hasChanges) {
        setProducts(searchResult.products);
        setFilteredProducts(searchResult.products);
      }
    }
  }, [searchResult, filteredProducts]);

  useEffect(() => {
    let startTime = Date.now();
    return () => {
      if (currentProductId) {
        const timeSpent = (Date.now() - startTime) / 1000;
        trackProductView(currentProductId, timeSpent);
      }
    };
  }, [currentProductId, trackProductView]);

  useEffect(() => {
    const fetchPopularityData = async () => {
      try {
        // Get view counts from userBehavior collection
        const behaviorQuery = query(collection(db, 'userBehavior'), orderBy('viewCount', 'desc'));
        const behaviorDocs = await getDocs(behaviorQuery);
        
        const viewCounts = behaviorDocs.docs.reduce((acc, doc) => {
          const data = doc.data();
          acc[data.productId] = (acc[data.productId] || 0) + data.viewCount;
          return acc;
        }, {} as { [key: string]: number });

        // Merge with trending products data
        const popularityData = {
          ...viewCounts,
          ...recommendations.trendingProducts.reduce((acc, product) => {
            acc[product.productId] = Math.max(
              viewCounts[product.productId] || 0,
              product.score || 0
            );
            return acc;
          }, {} as { [key: string]: number })
        };

        setPopularityCache(popularityData);
      } catch (error) {
        console.error('Error fetching popularity data:', error);
      }
    };

    fetchPopularityData();
  }, [recommendations.trendingProducts]);

  // Define handlers first before using them in hooks
  const handleFilterChange = useCallback((newFilters: any) => {
    // Create a copy of current filters
    const currentFilters = { ...filters };
    
    // Handle each filter type separately
    if ('category' in newFilters) {
      currentFilters.category = newFilters.category[0] ? [newFilters.category[0]] : undefined;
    }
    if ('material' in newFilters) {
      currentFilters.material = newFilters.material[0] ? [newFilters.material[0]] : undefined;
    }
    if ('purity' in newFilters) {
      currentFilters.purity = newFilters.purity[0] ? [newFilters.purity[0]] : undefined;
    }
    if ('searchTerm' in newFilters) {
      currentFilters.searchTerm = newFilters.searchTerm || undefined;
    }

    // Optimistically update filtered products using the current products
    const optimisticResult = products.filter(product => {
      if (currentFilters.category?.length && !currentFilters.category.includes(product.productCategory)) {
        return false;
      }
      if (currentFilters.material?.length && !currentFilters.material.includes(product.material)) {
        return false;
      }
      if (currentFilters.purity?.length && !currentFilters.purity.includes(product.purity)) {
        return false;
      }
      if (currentFilters.searchTerm) {
        const searchLower = currentFilters.searchTerm.toLowerCase();
        const searchableText = `${product.name} ${product.productCategory} ${product.material} ${product.purity}`.toLowerCase();
        return searchableText.includes(searchLower);
      }
      return true;
    });
    
    setFilteredProducts(optimisticResult);

    // Then trigger the actual search
    searchProducts(currentFilters, options, false);
  }, [searchProducts, filters, options, products]);

  const handleSortChange = useCallback((newSortBy: string) => {
    // First, update the options to trigger the search
    const newOptions = {
      ...options,
      sortBy: newSortBy as any
    };

    // Optimistically sort current products
    const optimisticSort = [...filteredProducts].sort((a, b) => {
      switch (newSortBy) {
        case 'newest':
          return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0);
        case 'price_asc':
          return (priceRanges[a.name] || 0) - (priceRanges[b.name] || 0);
        case 'price_desc':
          return (priceRanges[b.name] || 0) - (priceRanges[a.name] || 0);
        case 'popularity': {
          // Use cached popularity data for stable sorting
          const viewsA = popularityCache[a.productID || ''] || 0;
          const viewsB = popularityCache[b.productID || ''] || 0;
          if (viewsA === viewsB) {
            // If popularity is the same, maintain stable order using timestamp
            return (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0);
          }
          return viewsB - viewsA;
        }
        default:
          return 0;
      }
    });

    // Update filtered products immediately with optimistic sort
    setFilteredProducts(optimisticSort);

    // Then trigger the actual search with debounce to prevent flashing
    const timeoutId = setTimeout(() => {
      searchProducts(filters, newOptions);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [searchProducts, filters, options, filteredProducts, priceRanges, popularityCache]);

  // Debounced search with optimistic update
  const debouncedSearch = useMemo(
    () => debounce((searchTerm: string) => {
      // Optimistically filter products
      const optimisticResult = products.filter(product => {
        const searchLower = searchTerm.toLowerCase();
        const searchableText = `${product.name} ${product.productCategory} ${product.material} ${product.purity}`.toLowerCase();
        return searchableText.includes(searchLower);
      });
      setFilteredProducts(optimisticResult);

      // Then trigger the actual search
      handleFilterChange({ searchTerm });
    }, 300),
    [handleFilterChange, products]
  );

  const handleAddToWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const isInWishlist = prev.some(item => item.name === product.name);
      let newWishlist: Product[];
      
      if (isInWishlist) {
        newWishlist = prev.filter(item => item.name !== product.name);
        toast.success("Removed from wishlist");
      } else {
        newWishlist = [...prev, product];
        toast.success("Added to wishlist");
      }
      
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Our Products</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const displayProducts = showWishlist ? wishlist : filteredProducts;

  return (
    <div className="container mx-auto px-4 py-8">
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

      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Select
            value={filters.category?.[0] || 'all'}
            onValueChange={(value) => handleFilterChange({ category: value === 'all' ? [] : [value] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(searchResult.facets.categories).map(([category, count]) => (
                <SelectItem key={category} value={category}>
                  {category} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.material?.[0] || 'all'}
            onValueChange={(value) => handleFilterChange({ material: value === 'all' ? [] : [value] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Materials</SelectItem>
              {Object.entries(searchResult.facets.materials).map(([material, count]) => (
                <SelectItem key={material} value={material}>
                  {material} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.purity?.[0] || 'all'}
            onValueChange={(value) => handleFilterChange({ purity: value === 'all' ? [] : [value] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Purity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Purities</SelectItem>
              {Object.entries(searchResult.facets.purities).map(([purity, count]) => (
                <SelectItem key={purity} value={purity}>
                  {purity} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={options.sortBy || 'newest'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="popularity">Popularity</SelectItem>
            </SelectContent>
          </Select>

          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-2 border rounded"
            defaultValue={filters.searchTerm || ''}
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
      </div>

      {isSearchLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-lg mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {searchError && (
        <div className="text-red-500 text-center py-8">
          {searchError}
        </div>
      )}

      {!isSearchLoading && !searchError && (
        <>
          <div className="mb-4 text-gray-600">
            Found {searchResult.totalCount} products
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchResult.products.map((product) => (
              <ProductCard
                key={product.productID}
                product={product}
                onAddToWishlist={handleAddToWishlist}
                isInWishlist={wishlist.some(w => w.productID === product.productID)}
                activePromotion={promotions[product.name]}
                onView={() => setCurrentProductId(product.productID || null)}
              />
            ))}
          </div>

          {!isRecommendationsLoading && recommendations.trendingProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Trending Products</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {recommendations.trendingProducts.map((recommendation) => {
                  const product = products.find(p => p.productID === recommendation.productId);
                  if (!product) return null;
                  return (
                    <ProductCard
                      key={product.productID}
                      product={product}
                      onAddToWishlist={handleAddToWishlist}
                      isInWishlist={wishlist.some(w => w.productID === product.productID)}
                      activePromotion={promotions[product.name]}
                      onView={() => setCurrentProductId(product.productID || null)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {searchResult.totalCount > options.limit && (
            <div className="mt-8 flex justify-center">
              <button
                className="px-4 py-2 border rounded mr-2"
                disabled={options.page === 1}
                onClick={() => searchProducts(filters, { ...options, page: options.page - 1 })}
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {options.page} of {Math.ceil(searchResult.totalCount / options.limit)}
              </span>
              <button
                className="px-4 py-2 border rounded ml-2"
                disabled={options.page >= Math.ceil(searchResult.totalCount / options.limit)}
                onClick={() => searchProducts(filters, { ...options, page: options.page + 1 })}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
