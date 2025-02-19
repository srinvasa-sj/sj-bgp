import { collection, doc, getDoc, getDocs, query, where, orderBy, limit as firestoreLimit, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProductRecommendation, RecommendationResponse, UserBehavior } from '@/types/recommendation';

class RecommendationService {
  private async trackUserBehavior(userId: string, productId: string, timeSpent: number): Promise<void> {
    try {
      const behaviorRef = doc(db, 'userBehavior', `${userId}_${productId}`);
      const behaviorDoc = await getDoc(behaviorRef);
      
      const newBehavior: UserBehavior = {
        productId,
        viewCount: behaviorDoc.exists() ? behaviorDoc.data().viewCount + 1 : 1,
        timeSpent: behaviorDoc.exists() ? behaviorDoc.data().timeSpent + timeSpent : timeSpent,
        lastViewed: new Date()
      };
      
      await setDoc(behaviorRef, newBehavior);
    } catch (error) {
      console.error('Error tracking user behavior:', error);
    }
  }

  private async getSimilarProducts(productId: string, limit: number = 4): Promise<ProductRecommendation[]> {
    try {
      const productRef = doc(db, 'productData', 'zzeEfRyePYTdWemfHHWH');
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) return [];
      
      const products = productDoc.data().products;
      const currentProduct = products.find((p: any) => p.productID === productId);
      
      if (!currentProduct) return [];
      
      // Calculate similarity based on category, material, and price range
      const similarProducts = products
        .filter((p: any) => p.productID !== productId)
        .map((p: any) => ({
          productId: p.productID,
          score: this.calculateSimilarityScore(currentProduct, p),
          type: 'similar' as const
        }))
        .sort((a: ProductRecommendation, b: ProductRecommendation) => b.score - a.score)
        .slice(0, limit);
        
      return similarProducts;
    } catch (error) {
      console.error('Error getting similar products:', error);
      return [];
    }
  }

  private calculateSimilarityScore(product1: any, product2: any): number {
    let score = 0;
    
    // Category match
    if (product1.productCategory === product2.productCategory) score += 0.4;
    
    // Material match
    if (product1.material === product2.material) score += 0.3;
    
    // Purity match
    if (product1.purity === product2.purity) score += 0.2;
    
    // Weight similarity (within 20% range)
    const weightDiff = Math.abs(product1.weight - product2.weight) / product1.weight;
    if (weightDiff <= 0.2) score += 0.1 * (1 - weightDiff);
    
    return score;
  }

  private async getTrendingProducts(limitCount: number = 4): Promise<ProductRecommendation[]> {
    try {
      const behaviorQuery = query(
        collection(db, 'userBehavior'),
        orderBy('viewCount', 'desc'),
        firestoreLimit(limitCount)
      );
      
      const behaviorDocs = await getDocs(behaviorQuery);
      const trendingProducts = behaviorDocs.docs.map(doc => ({
        productId: doc.data().productId,
        score: doc.data().viewCount,
        type: 'trending' as const,
        reason: 'Popular choice among customers'
      }));
      
      return trendingProducts;
    } catch (error) {
      console.error('Error getting trending products:', error);
      return [];
    }
  }

  public async getRecommendations(
    userId: string | null,
    currentProductId?: string
  ): Promise<RecommendationResponse> {
    try {
      const [similarProducts, trendingProducts] = await Promise.all([
        currentProductId ? this.getSimilarProducts(currentProductId) : [],
        this.getTrendingProducts()
      ]);

      return {
        personalizedProducts: [], // To be implemented based on user history
        similarProducts,
        complementaryProducts: [], // To be implemented based on product relationships
        trendingProducts
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return {
        personalizedProducts: [],
        similarProducts: [],
        complementaryProducts: [],
        trendingProducts: []
      };
    }
  }

  public async trackProductView(userId: string | null, productId: string, timeSpent: number): Promise<void> {
    if (!userId) return;
    await this.trackUserBehavior(userId, productId, timeSpent);
  }
}

export const recommendationService = new RecommendationService(); 