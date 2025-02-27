import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Promotion {
  id?: string;
  name: string;
  description: string;
  type: 'discount' | 'bogo' | 'bundle' | 'gift';
  startDate: Timestamp;
  endDate: Timestamp;
  conditions: {
    minPurchaseAmount?: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    maxUsagePerCustomer?: number;
  };
  benefits: {
    discountPercentage?: number;
    discountAmount?: number;
    freeProducts?: Array<{
      productId: string;
      quantity: number;
    }>;
    giftDescription?: string;
  };
  status: 'draft' | 'active' | 'ended' | 'cancelled';
  targetSegments?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface MarketingCampaign {
  id?: string;
  name: string;
  description: string;
  type: 'whatsapp' | 'sms' | 'notification';
  schedule: {
    startDate: Timestamp;
    endDate: Timestamp;
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  content: {
    message: string;
    mediaUrl?: string;
    callToAction?: {
      type: 'link' | 'phone' | 'whatsapp';
      value: string;
    };
  };
  targeting: {
    segments: string[];
    filters?: {
      lastPurchaseDate?: Timestamp;
      minimumTotalSpent?: number;
      specificProducts?: string[];
    };
  };
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  metrics?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

class PromotionService {
  // Promotion Management Methods
  async createPromotion(promotion: Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const now = Timestamp.now();
      const newPromotion = {
        ...promotion,
        createdAt: now,
        updatedAt: now,
        status: 'draft'
      };

      const docRef = await addDoc(collection(db, 'promotions'), newPromotion);
      return {
        id: docRef.id,
        ...newPromotion
      };
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  }

  async updatePromotion(id: string, updates: Partial<Promotion>) {
    try {
      const promotionRef = doc(db, 'promotions', id);
      await updateDoc(promotionRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      const updated = await getDoc(promotionRef);
      return {
        id: updated.id,
        ...updated.data()
      };
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  }

  async deletePromotion(id: string) {
    try {
      await deleteDoc(doc(db, 'promotions', id));
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  }

  async getActivePromotions() {
    try {
      const now = Timestamp.now();
      const promotionsQuery = query(
        collection(db, 'promotions'),
        where('status', '==', 'active'),
        where('startDate', '<=', now),
        where('endDate', '>=', now)
      );

      const snapshot = await getDocs(promotionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Promotion[];
    } catch (error) {
      console.error('Error fetching active promotions:', error);
      throw error;
    }
  }

  async getApplicablePromotions(
    customerId: string,
    products: Array<{ id: string; category: string }>,
    totalAmount: number
  ) {
    try {
      const activePromotions = await this.getActivePromotions();
      const customerSegments = await this.getCustomerSegments(customerId);
      
      return activePromotions.filter(promotion => {
        // Check customer segment targeting
        if (promotion.targetSegments?.length && 
            !promotion.targetSegments.some(segment => customerSegments.includes(segment))) {
          return false;
        }

        // Check minimum purchase amount
        if (promotion.conditions.minPurchaseAmount && 
            totalAmount < promotion.conditions.minPurchaseAmount) {
          return false;
        }

        // Check product applicability
        if (promotion.conditions.applicableProducts?.length) {
          if (!products.some(product => 
            promotion.conditions.applicableProducts?.includes(product.id)
          )) {
            return false;
          }
        }

        // Check category applicability
        if (promotion.conditions.applicableCategories?.length) {
          if (!products.some(product => 
            promotion.conditions.applicableCategories?.includes(product.category)
          )) {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      console.error('Error fetching applicable promotions:', error);
      throw error;
    }
  }

  private async getCustomerSegments(customerId: string): Promise<string[]> {
    try {
      const segmentsQuery = query(
        collection(db, 'customerSegments'),
        where('customers', 'array-contains', customerId)
      );
      
      const snapshot = await getDocs(segmentsQuery);
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error fetching customer segments:', error);
      return [];
    }
  }

  // Marketing Campaign Methods
  async createCampaign(campaign: Omit<MarketingCampaign, 'id' | 'metrics'>) {
    try {
      const newCampaign = {
        ...campaign,
        metrics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0
        }
      };

      const docRef = await addDoc(collection(db, 'marketingCampaigns'), newCampaign);
      return {
        id: docRef.id,
        ...newCampaign
      };
    } catch (error) {
      console.error('Error creating marketing campaign:', error);
      throw error;
    }
  }

  async updateCampaign(id: string, updates: Partial<MarketingCampaign>) {
    try {
      const campaignRef = doc(db, 'marketingCampaigns', id);
      await updateDoc(campaignRef, updates);

      const updated = await getDoc(campaignRef);
      return {
        id: updated.id,
        ...updated.data()
      };
    } catch (error) {
      console.error('Error updating marketing campaign:', error);
      throw error;
    }
  }

  async deleteCampaign(id: string) {
    try {
      await deleteDoc(doc(db, 'marketingCampaigns', id));
    } catch (error) {
      console.error('Error deleting marketing campaign:', error);
      throw error;
    }
  }

  async getActiveCampaigns() {
    try {
      const now = Timestamp.now();
      const campaignsQuery = query(
        collection(db, 'marketingCampaigns'),
        where('status', 'in', ['scheduled', 'active']),
        where('schedule.startDate', '<=', now),
        where('schedule.endDate', '>=', now)
      );

      const snapshot = await getDocs(campaignsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MarketingCampaign[];
    } catch (error) {
      console.error('Error fetching active campaigns:', error);
      throw error;
    }
  }

  async updateCampaignMetrics(id: string, metricUpdates: Partial<MarketingCampaign['metrics']>) {
    try {
      const campaignRef = doc(db, 'marketingCampaigns', id);
      const campaign = await getDoc(campaignRef);
      
      if (!campaign.exists()) {
        throw new Error('Campaign not found');
      }

      const currentMetrics = campaign.data()?.metrics || {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      };

      await updateDoc(campaignRef, {
        metrics: {
          ...currentMetrics,
          ...metricUpdates
        }
      });
    } catch (error) {
      console.error('Error updating campaign metrics:', error);
      throw error;
    }
  }

  // Campaign Performance Analysis
  async analyzeCampaignPerformance(campaignId: string) {
    try {
      const campaignRef = doc(db, 'marketingCampaigns', campaignId);
      const campaign = await getDoc(campaignRef);
      
      if (!campaign.exists()) {
        throw new Error('Campaign not found');
      }

      const data = campaign.data() as MarketingCampaign;
      const metrics = data.metrics || {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0
      };

      return {
        campaignId,
        name: data.name,
        type: data.type,
        duration: {
          start: data.schedule.startDate,
          end: data.schedule.endDate
        },
        metrics,
        rates: {
          deliveryRate: metrics.sent > 0 ? (metrics.delivered / metrics.sent) * 100 : 0,
          openRate: metrics.delivered > 0 ? (metrics.opened / metrics.delivered) * 100 : 0,
          clickRate: metrics.opened > 0 ? (metrics.clicked / metrics.opened) * 100 : 0,
          conversionRate: metrics.clicked > 0 ? (metrics.converted / metrics.clicked) * 100 : 0
        }
      };
    } catch (error) {
      console.error('Error analyzing campaign performance:', error);
      throw error;
    }
  }
}

export const promotionService = new PromotionService(); 