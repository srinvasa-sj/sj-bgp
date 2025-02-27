import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SearchFilters, SearchOptions, SearchResult } from '@/types/search';
import { query, collection, getDocs, orderBy, where } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// Define the Product interface
interface Product {
  id: string;
  name: string;
  description?: string;
  productCategory?: string;
  material?: string;
  purity?: string;
  weight: number;
  imageUrl?: string;
  imageUrls?: string[];
  viewCount?: number;
  createdAt: Timestamp;
}

// Price calculation function
const calculatePrice = async (weight: number, purity: string | undefined, material: string | undefined): Promise<number> => {
  try {
    const priceDoc = await getDoc(doc(db, "priceData", "4OhZCKHQls64bokVqGN5"));
    if (!priceDoc.exists()) return 0;

    const priceData = priceDoc.data();
    let basePrice = 0;
    let wastagePercentage = 0;
    let makingChargesPerGram = 0;
    let applyWastageMakingCharges = true;

    switch (purity) {
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
        return 0;
    }

    const baseAmount = basePrice * weight;
    let totalPrice = baseAmount;

    if (applyWastageMakingCharges) {
      const wastageCharges = baseAmount * (wastagePercentage / 100);
      const makingCharges = makingChargesPerGram * weight;
      totalPrice = baseAmount + wastageCharges + makingCharges;
    }

    return totalPrice;
  } catch (error) {
    console.error('Error calculating price:', error);
    return 0;
  }
};

class SearchService {
  private cachedProducts: Product[] | null = null;
  private cachedPrices: Record<string, number> = {};

  clearCache() {
    this.cachedProducts = null;
    this.cachedPrices = {};
  }

  private async getAllProducts(): Promise<Product[]> {
    if (this.cachedProducts) {
      return this.cachedProducts;
    }

    try {
      const productDocRef = doc(db, "productData", "zzeEfRyePYTdWemfHHWH");
      const productDoc = await getDoc(productDocRef);
      
      if (!productDoc.exists()) {
        console.log('Products document not found');
        return [];
      }

      const data = productDoc.data();
      const productsArray = data.products || [];
      
      console.log('Found products:', productsArray.length);
      
      const products = productsArray.map((data: any) => {
        console.log('Product data:', data);
        return {
          id: data.productID || data.id,
          name: data.name || '',
          description: data.description || '',
          productCategory: data.category || data.productCategory || '',
          material: data.material || '',
          purity: data.purity || '',
          weight: data.weight || 0,
          imageUrl: data.imageUrl || data.image || '',
          imageUrls: data.imageUrls || [],
          viewCount: data.viewCount || 0,
          createdAt: data.createdAt || data.timestamp || Timestamp.now()
        };
      });

      console.log('Processed products:', products.length);
      this.cachedProducts = products;
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products from database');
    }
  }

  private async calculateProductPrice(product: Product): Promise<number> {
    if (this.cachedPrices[product.id]) {
      return this.cachedPrices[product.id];
    }

    try {
      const price = await calculatePrice(
        product.weight,
        product.purity,
        product.material
      );
      this.cachedPrices[product.id] = price;
      return price;
    } catch (error) {
      console.error(`Error calculating price for product ${product.id}:`, error);
      return 0;
    }
  }

  private compareTimestamps(a: Timestamp | undefined, b: Timestamp | undefined): number {
    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;
    
    const secondsDiff = b.seconds - a.seconds;
    if (secondsDiff !== 0) return secondsDiff;
    return b.nanoseconds - a.nanoseconds;
  }

  private async sortProducts(products: Product[], sortBy: string): Promise<Product[]> {
    const sortedProducts = [...products];
    
    try {
      switch (sortBy) {
        case 'newest':
          return sortedProducts.sort((a, b) => {
            const timeA = a.createdAt.seconds || 0;
            const timeB = b.createdAt.seconds || 0;
            if (timeA === timeB) {
              return (b.createdAt.nanoseconds || 0) - (a.createdAt.nanoseconds || 0);
            }
            return timeB - timeA;
          });
          
        case 'price_asc':
        case 'price_desc': {
          // Calculate prices for all products first
          await Promise.all(sortedProducts.map(async (product) => {
            if (!this.cachedPrices[product.id]) {
              this.cachedPrices[product.id] = await this.calculateProductPrice(product);
            }
          }));

          return sortedProducts.sort((a, b) => {
            const priceA = this.cachedPrices[a.id] || 0;
            const priceB = this.cachedPrices[b.id] || 0;
            if (priceA === priceB) {
              return (b.createdAt.seconds || 0) - (a.createdAt.seconds || 0);
            }
            return sortBy === 'price_asc' ? priceA - priceB : priceB - priceA;
          });
        }
          
        case 'popularity':
          return sortedProducts.sort((a, b) => {
            const viewsA = a.viewCount || 0;
            const viewsB = b.viewCount || 0;
            if (viewsA === viewsB) {
              return (b.createdAt.seconds || 0) - (a.createdAt.seconds || 0);
            }
            return viewsB - viewsA;
          });
          
        default:
          return sortedProducts;
      }
    } catch (error) {
      console.error('Error sorting products:', error);
      // On error, return products sorted by newest
      return sortedProducts.sort((a, b) => {
        const timeA = a.createdAt.seconds || 0;
        const timeB = b.createdAt.seconds || 0;
        return timeB - timeA;
      });
    }
  }

  private filterProducts(products: Product[], filters: SearchFilters): Product[] {
    const filteredProducts = [...products];
    
    return filteredProducts.filter(product => {
      // Category filter
      if (filters.category?.length) {
        const productCategory = product.productCategory?.trim().toLowerCase();
        const matchesCategory = filters.category.some(
          category => category.toLowerCase() === productCategory
        );
        if (!matchesCategory) return false;
      }

      // Material filter
      if (filters.material?.length) {
        const productMaterial = product.material?.trim().toLowerCase();
        const matchesMaterial = filters.material.some(
          material => material.toLowerCase() === productMaterial
        );
        if (!matchesMaterial) return false;
      }

      // Purity filter
      if (filters.purity?.length) {
        const productPurity = product.purity?.trim().toLowerCase();
        const matchesPurity = filters.purity.some(
          purity => purity.toLowerCase() === productPurity
        );
        if (!matchesPurity) return false;
      }

      // Weight filter
      if (filters.weight) {
        const [min, max] = filters.weight;
        const weight = parseFloat(product.weight.toString());
        if (isNaN(weight) || weight < min || weight > max) {
          return false;
        }
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        const productName = product.name?.toLowerCase() || '';
        const productDescription = product.description?.toLowerCase() || '';
        
        if (!productName.includes(searchTerm) && !productDescription.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  public async search(filters: SearchFilters, options: SearchOptions): Promise<SearchResult> {
    try {
      console.log('Searching with filters:', filters);
      console.log('Searching with options:', options);
      
      let products = await this.getAllProducts();
      
      // Apply filters
      products = this.filterProducts(products, filters);
      
      // Apply sorting
      products = await this.sortProducts(products, options.sortBy || 'newest');
      
      // Calculate facets
      const facets = this.calculateFacets(products);
      
      // Apply pagination
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      const paginatedProducts = products.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        facets,
        totalCount: products.length
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  private calculateFacets(products: Product[]): SearchResult['facets'] {
    const facets: SearchResult['facets'] = {
      categories: {},
      materials: {},
      purities: {}
    };

    products.forEach(product => {
      if (product.productCategory) {
        const category = product.productCategory.trim();
        facets.categories[category] = (facets.categories[category] || 0) + 1;
      }
      if (product.material) {
        const material = product.material.trim();
        facets.materials[material] = (facets.materials[material] || 0) + 1;
      }
      if (product.purity) {
        const purity = product.purity.trim();
        facets.purities[purity] = (facets.purities[purity] || 0) + 1;
      }
    });

    return facets;
  }
}

export const searchService = new SearchService(); 