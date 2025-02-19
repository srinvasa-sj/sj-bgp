import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SearchFilters, SearchOptions, SearchResult } from '@/types/search';
import { query, collection, getDocs, orderBy } from 'firebase/firestore';

class SearchService {
  private cachedProducts: any[] = [];
  private cachedPriceData: any = null;

  private async getAllProducts() {
    try {
      // Return cached products if available
      if (this.cachedProducts.length > 0) {
        return this.cachedProducts;
      }

      const docRef = doc(db, 'productData', 'zzeEfRyePYTdWemfHHWH');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        this.cachedProducts = docSnap.data().products || [];
        return this.cachedProducts;
      }
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  private async getPriceData() {
    try {
      // Return cached price data if available
      if (this.cachedPriceData) {
        return this.cachedPriceData;
      }

      const priceDocRef = doc(db, "priceData", "4OhZCKHQls64bokVqGN5");
      const priceDocSnap = await getDoc(priceDocRef);
      
      if (priceDocSnap.exists()) {
        this.cachedPriceData = priceDocSnap.data();
        return this.cachedPriceData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching price data:', error);
      return null;
    }
  }

  private filterProducts(products: any[], filters: SearchFilters): any[] {
    return products.filter(product => {
      // Category filter
      if (filters.category?.length && !filters.category.includes(product.productCategory)) {
        return false;
      }

      // Material filter
      if (filters.material?.length && !filters.material.includes(product.material)) {
        return false;
      }

      // Purity filter
      if (filters.purity?.length && !filters.purity.includes(product.purity)) {
        return false;
      }

      // Weight range filter
      if (filters.weight) {
        const [min, max] = filters.weight;
        if (product.weight < min || product.weight > max) {
          return false;
        }
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchableText = `${product.name} ${product.productCategory} ${product.material} ${product.purity}`.toLowerCase();
        
        // Split search term into words for better matching
        const searchWords = searchLower.split(' ');
        return searchWords.every(word => searchableText.includes(word));
      }

      return true;
    });
  }

  private calculateFacets(products: any[]): SearchResult['facets'] {
    const facets = {
      categories: {},
      materials: {},
      purities: {}
    };

    products.forEach(product => {
      // Categories
      if (product.productCategory) {
        facets.categories[product.productCategory] = (facets.categories[product.productCategory] || 0) + 1;
      }

      // Materials
      if (product.material) {
        facets.materials[product.material] = (facets.materials[product.material] || 0) + 1;
      }

      // Purities
      if (product.purity) {
        facets.purities[product.purity] = (facets.purities[product.purity] || 0) + 1;
      }
    });

    return facets;
  }

  private async calculateProductPrice(product: any, priceData: any): Promise<number> {
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
        return 0;
    }

    const baseAmount = basePrice * product.weight;
    let totalPrice = baseAmount;

    if (applyWastageMakingCharges) {
      const wastageCharges = baseAmount * (wastagePercentage / 100);
      const makingCharges = makingChargesPerGram * product.weight;
      totalPrice = baseAmount + wastageCharges + makingCharges;
    }

    return totalPrice;
  }

  private async sortProducts(products: any[], sortBy?: SearchOptions['sortBy']): Promise<any[]> {
    const sortedProducts = [...products];

    try {
      switch (sortBy) {
        case 'price_asc':
        case 'price_desc': {
          const priceData = await this.getPriceData();
          if (!priceData) return sortedProducts;

          const productsWithPrices = await Promise.all(
            sortedProducts.map(async (product) => ({
              ...product,
              calculatedPrice: await this.calculateProductPrice(product, priceData)
            }))
          );

          return productsWithPrices.sort((a, b) => {
            return sortBy === 'price_asc' 
              ? a.calculatedPrice - b.calculatedPrice
              : b.calculatedPrice - a.calculatedPrice;
          });
        }
        case 'newest':
          return sortedProducts.sort((a, b) => {
            const dateA = a.timestamp?.seconds || 0;
            const dateB = b.timestamp?.seconds || 0;
            return dateB - dateA;
          });
        case 'popularity': {
          const behaviorQuery = query(
            collection(db, 'userBehavior'),
            orderBy('viewCount', 'desc')
          );
          const behaviorDocs = await getDocs(behaviorQuery);
          const viewCounts = new Map(
            behaviorDocs.docs.map(doc => [
              doc.data().productId,
              doc.data().viewCount
            ])
          );

          return sortedProducts.sort((a, b) => {
            const viewsA = viewCounts.get(a.productID) || 0;
            const viewsB = viewCounts.get(b.productID) || 0;
            return viewsB - viewsA;
          });
        }
        default:
          return sortedProducts;
      }
    } catch (error) {
      console.error('Error sorting products:', error);
      return sortedProducts;
    }
  }

  public async searchProducts(
    filters: SearchFilters,
    options: SearchOptions
  ): Promise<SearchResult> {
    try {
      // Get all products
      const allProducts = await this.getAllProducts();

      // Apply filters
      const filteredProducts = this.filterProducts(allProducts, filters);

      // Calculate facets
      const facets = this.calculateFacets(filteredProducts);

      // Sort products
      const sortedProducts = await this.sortProducts(filteredProducts, options.sortBy);

      // Apply pagination
      const start = (options.page - 1) * options.limit;
      const end = start + options.limit;
      const paginatedProducts = sortedProducts.slice(start, end);

      return {
        products: paginatedProducts,
        totalCount: filteredProducts.length,
        facets
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        products: [],
        totalCount: 0,
        facets: {
          categories: {},
          materials: {},
          purities: {}
        }
      };
    }
  }

  // Add method to clear cache if needed
  public clearCache() {
    this.cachedProducts = [];
    this.cachedPriceData = null;
  }
}

export const searchService = new SearchService(); 