import { useState, useEffect } from 'react';
import { recommendationService } from '@/services/recommendationService';
import { RecommendationResponse } from '@/types/recommendation';

export const useRecommendations = (userId: string | null, productId?: string) => {
  const [recommendations, setRecommendations] = useState<RecommendationResponse>({
    personalizedProducts: [],
    similarProducts: [],
    complementaryProducts: [],
    trendingProducts: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await recommendationService.getRecommendations(userId, productId);
        setRecommendations(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching recommendations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId, productId]);

  const trackProductView = async (productId: string, timeSpent: number) => {
    try {
      await recommendationService.trackProductView(userId, productId, timeSpent);
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  };

  return {
    recommendations,
    isLoading,
    error,
    trackProductView
  };
}; 