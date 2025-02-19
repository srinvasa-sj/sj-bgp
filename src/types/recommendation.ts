export interface UserBehavior {
  productId: string;
  viewCount: number;
  timeSpent: number;
  lastViewed: Date;
}

export interface ProductRecommendation {
  productId: string;
  score: number;
  type: 'similar' | 'complementary' | 'trending' | 'personal';
  reason?: string;
}

export interface RecommendationResponse {
  personalizedProducts: ProductRecommendation[];
  similarProducts: ProductRecommendation[];
  complementaryProducts: ProductRecommendation[];
  trendingProducts: ProductRecommendation[];
} 