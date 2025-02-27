import { collection, query, where, getDocs, orderBy, limit, Timestamp, addDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Order {
  id: string;
  customerId: string;
  totalAmount: number;
  createdAt: Timestamp;
}

interface Customer {
  id: string;
  orders: Order[];
  totalSpent: number;
  lastPurchase: Timestamp | null;
}

interface CustomerSegment {
  id: string;
  name: string;
  criteria: {
    purchaseFrequency: number;
    averageOrderValue: number;
    lastPurchaseDate: Date;
  };
  customers: string[];
}

interface SalesForecasting {
  date: string;
  predictedRevenue: number;
  confidence: number;
  factors: {
    seasonality: number;
    trend: number;
    events: string[];
  };
}

class AnalyticsService {
  // Detailed Analytics Methods
  async getDetailedAnalytics(startDate: Date, endDate: Date) {
    try {
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(
        ordersRef,
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        revenue: this.calculateRevenue(orders),
        orderMetrics: this.calculateOrderMetrics(orders),
        productPerformance: await this.analyzeProductPerformance(orders),
        customerMetrics: await this.analyzeCustomerMetrics(orders),
        categoryAnalysis: await this.analyzeCategoryPerformance(orders)
      };
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      throw error;
    }
  }

  private calculateRevenue(orders: any[]) {
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueByDay = this.groupBy(orders, order => 
      new Date(order.createdAt.toDate()).toISOString().split('T')[0],
      order => order.totalAmount
    );

    return {
      total: totalRevenue,
      daily: revenueByDay,
      average: totalRevenue / (orders.length || 1)
    };
  }

  private calculateOrderMetrics(orders: any[]) {
    return {
      total: orders.length,
      averageValue: orders.reduce((sum, order) => sum + order.totalAmount, 0) / (orders.length || 1),
      itemsPerOrder: orders.reduce((sum, order) => sum + order.items.length, 0) / (orders.length || 1)
    };
  }

  private async analyzeProductPerformance(orders: any[]) {
    const productStats = new Map();
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const stats = productStats.get(item.productId) || {
          totalSold: 0,
          revenue: 0,
          orders: new Set()
        };
        
        stats.totalSold += item.quantity;
        stats.revenue += item.price * item.quantity;
        stats.orders.add(order.id);
        
        productStats.set(item.productId, stats);
      });
    });

    return Array.from(productStats.entries()).map(([productId, stats]) => ({
      productId,
      totalSold: stats.totalSold,
      revenue: stats.revenue,
      orderFrequency: stats.orders.size
    }));
  }

  private async analyzeCustomerMetrics(orders: any[]) {
    const customerStats = new Map();
    
    orders.forEach(order => {
      const stats = customerStats.get(order.customerId) || {
        totalSpent: 0,
        orderCount: 0,
        lastOrder: null
      };
      
      stats.totalSpent += order.totalAmount;
      stats.orderCount += 1;
      stats.lastOrder = order.createdAt;
      
      customerStats.set(order.customerId, stats);
    });

    return Array.from(customerStats.entries()).map(([customerId, stats]) => ({
      customerId,
      totalSpent: stats.totalSpent,
      orderCount: stats.orderCount,
      lastOrder: stats.lastOrder
    }));
  }

  private async analyzeCategoryPerformance(orders: any[]) {
    const categoryStats = new Map();
    
    orders.forEach(order => {
      order.items.forEach((item: any) => {
        const stats = categoryStats.get(item.category) || {
          totalSold: 0,
          revenue: 0
        };
        
        stats.totalSold += item.quantity;
        stats.revenue += item.price * item.quantity;
        
        categoryStats.set(item.category, stats);
      });
    });

    return Array.from(categoryStats.entries()).map(([category, stats]) => ({
      category,
      totalSold: stats.totalSold,
      revenue: stats.revenue
    }));
  }

  // Sales Forecasting Methods
  async generateSalesForecast(days: number = 30): Promise<SalesForecasting[]> {
    try {
      // Fetch historical data
      const historicalOrders = await this.getHistoricalOrders(90); // Get 90 days of historical data
      
      // Calculate trends and seasonality
      const trends = this.calculateTrends(historicalOrders);
      const seasonality = this.calculateSeasonality(historicalOrders);
      const events = await this.getUpcomingEvents(days);

      return this.generateForecast(days, trends, seasonality, events);
    } catch (error) {
      console.error('Error generating sales forecast:', error);
      throw error;
    }
  }

  private async getHistoricalOrders(days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const ordersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', startDate),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  private calculateTrends(orders: any[]) {
    const dailyRevenue = this.groupBy(orders, 
      order => new Date(order.createdAt.toDate()).toISOString().split('T')[0],
      order => order.totalAmount
    );

    // Calculate moving average
    const movingAverages = new Map();
    const days = Array.from(dailyRevenue.keys()).sort();
    const window = 7; // 7-day moving average

    for (let i = window - 1; i < days.length; i++) {
      const slice = days.slice(i - window + 1, i + 1)
        .map(day => dailyRevenue.get(day) || 0);
      const average = slice.reduce((a, b) => a + b, 0) / window;
      movingAverages.set(days[i], average);
    }

    return movingAverages;
  }

  private calculateSeasonality(orders: any[]) {
    const dailyRevenue = this.groupBy(orders,
      order => new Date(order.createdAt.toDate()).getDay(), // 0-6 for day of week
      order => order.totalAmount
    );

    const weeklyPattern = new Map();
    for (let day = 0; day < 7; day++) {
      const revenues = Array.from(dailyRevenue.entries())
        .filter(([d]) => d === day)
        .map(([, amount]) => amount);
      
      weeklyPattern.set(day, {
        average: revenues.reduce((a, b) => a + b, 0) / revenues.length,
        factor: revenues.length > 0 ? 
          revenues.reduce((a, b) => a + b, 0) / revenues.length / 
          (orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length) : 1
      });
    }

    return weeklyPattern;
  }

  private async getUpcomingEvents(days: number) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const eventsQuery = query(
      collection(db, 'events'),
      where('date', '>=', new Date()),
      where('date', '<=', endDate)
    );
    
    const snapshot = await getDocs(eventsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  private generateForecast(
    days: number,
    trends: Map<string, number>,
    seasonality: Map<number, { average: number; factor: number }>,
    events: any[]
  ): SalesForecasting[] {
    const forecast: SalesForecasting[] = [];
    const baseValue = Array.from(trends.values()).slice(-7).reduce((a, b) => a + b, 0) / 7;

    for (let i = 0; i < days; i++) {
      const forecastDate = new Date();
      forecastDate.setDate(forecastDate.getDate() + i);
      
      const dayOfWeek = forecastDate.getDay();
      const seasonalFactor = seasonality.get(dayOfWeek)?.factor || 1;
      
      const dateStr = forecastDate.toISOString().split('T')[0];
      const relevantEvents = events.filter(event => 
        event.date.toDate().toISOString().split('T')[0] === dateStr
      );

      const eventImpact = relevantEvents.reduce((sum, event) => sum + (event.expectedImpact || 0), 0);

      forecast.push({
        date: dateStr,
        predictedRevenue: baseValue * seasonalFactor * (1 + eventImpact),
        confidence: this.calculateConfidence(i, seasonalFactor, relevantEvents.length),
        factors: {
          seasonality: seasonalFactor,
          trend: baseValue,
          events: relevantEvents.map(e => e.name)
        }
      });
    }

    return forecast;
  }

  private calculateConfidence(daysAhead: number, seasonalityStrength: number, eventCount: number): number {
    // Confidence decreases with prediction distance and number of uncertain factors
    const distanceFactor = Math.max(0, 1 - (daysAhead / 30));
    const seasonalityFactor = Math.min(1, Math.abs(1 - seasonalityStrength));
    const eventFactor = Math.max(0, 1 - (eventCount * 0.1));
    
    return (distanceFactor * 0.5 + seasonalityFactor * 0.3 + eventFactor * 0.2) * 100;
  }

  // Customer Segmentation Methods
  async getCustomerSegments(): Promise<CustomerSegment[]> {
    try {
      const customers = await this.getAllCustomers();
      const segments = this.segmentCustomers(customers);
      await this.saveSegments(segments);
      return segments;
    } catch (error) {
      console.error('Error getting customer segments:', error);
      throw error;
    }
  }

  private async getAllCustomers(): Promise<Customer[]> {
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(ordersQuery);
    
    const customerMap = new Map<string, Customer>();
    
    snapshot.docs.forEach(doc => {
      const orderData = doc.data();
      const order: Order = {
        id: doc.id,
        customerId: orderData.customerId,
        totalAmount: orderData.totalAmount,
        createdAt: orderData.createdAt
      };

      const customer = customerMap.get(order.customerId) || {
        id: order.customerId,
        orders: [],
        totalSpent: 0,
        lastPurchase: null
      };
      
      customer.orders.push(order);
      customer.totalSpent += order.totalAmount;
      customer.lastPurchase = customer.lastPurchase || order.createdAt;
      
      customerMap.set(order.customerId, customer);
    });
    
    return Array.from(customerMap.values());
  }

  private segmentCustomers(customers: any[]): CustomerSegment[] {
    const segments: CustomerSegment[] = [
      {
        id: 'vip',
        name: 'VIP Customers',
        criteria: {
          purchaseFrequency: 12,
          averageOrderValue: 100000,
          lastPurchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        customers: []
      },
      {
        id: 'regular',
        name: 'Regular Customers',
        criteria: {
          purchaseFrequency: 6,
          averageOrderValue: 50000,
          lastPurchaseDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        },
        customers: []
      },
      {
        id: 'occasional',
        name: 'Occasional Customers',
        criteria: {
          purchaseFrequency: 2,
          averageOrderValue: 10000,
          lastPurchaseDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
        },
        customers: []
      }
    ];

    customers.forEach(customer => {
      const averageOrderValue = customer.totalSpent / customer.orders.length;
      const purchaseFrequency = customer.orders.length;
      const lastPurchaseDate = customer.lastPurchase.toDate();

      if (this.meetsSegmentCriteria(averageOrderValue, purchaseFrequency, lastPurchaseDate, segments[0].criteria)) {
        segments[0].customers.push(customer.id);
      } else if (this.meetsSegmentCriteria(averageOrderValue, purchaseFrequency, lastPurchaseDate, segments[1].criteria)) {
        segments[1].customers.push(customer.id);
      } else {
        segments[2].customers.push(customer.id);
      }
    });

    return segments;
  }

  private meetsSegmentCriteria(
    averageOrderValue: number,
    purchaseFrequency: number,
    lastPurchaseDate: Date,
    criteria: CustomerSegment['criteria']
  ): boolean {
    return (
      averageOrderValue >= criteria.averageOrderValue &&
      purchaseFrequency >= criteria.purchaseFrequency &&
      lastPurchaseDate >= criteria.lastPurchaseDate
    );
  }

  private async saveSegments(segments: CustomerSegment[]) {
    try {
      for (const segment of segments) {
        await this.updateCustomerSegment(segment);
      }
    } catch (error) {
      console.error('Error saving customer segments:', error);
      throw error;
    }
  }

  private async updateCustomerSegment(segment: CustomerSegment) {
    const segmentRef = collection(db, 'customerSegments');
    const segmentQuery = query(segmentRef, where('id', '==', segment.id));
    const snapshot = await getDocs(segmentQuery);
    
    // Convert the segment to a plain object for Firestore
    const segmentData = {
      id: segment.id,
      name: segment.name,
      customers: segment.customers,
      criteria: {
        purchaseFrequency: segment.criteria.purchaseFrequency,
        averageOrderValue: segment.criteria.averageOrderValue,
        lastPurchaseDate: segment.criteria.lastPurchaseDate
      }
    };
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await updateDoc(doc.ref, segmentData);
    } else {
      await addDoc(segmentRef, segmentData);
    }
  }

  private groupBy<T, K extends string | number | symbol, V extends number>(
    array: T[],
    keyFn: (item: T) => K,
    valueFn: (item: T) => V
  ): Map<K, V> {
    return array.reduce((map, item) => {
      const key = keyFn(item);
      const value = valueFn(item);
      const currentValue = map.get(key) || 0;
      map.set(key, (currentValue + value) as V);
      return map;
    }, new Map<K, V>());
  }
}

export const analyticsService = new AnalyticsService(); 