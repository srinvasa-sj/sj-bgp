import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LineChart, BarChart } from '@/components/ui/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { formatCurrency } from '@/lib/utils';

interface Order {
  id: string;
  totalAmount: number;
  createdAt: Timestamp;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

interface AnalyticsData {
  dailyRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    productId: string;
    totalSold: number;
    revenue: number;
  }>;
  recentSales: Array<{
    date: string;
    amount: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export const DashboardAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    dailyRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    recentSales: [],
    monthlyRevenue: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const ordersRef = collection(db, 'orders');
        const todayOrders = query(
          ordersRef,
          where('createdAt', '>=', today),
          orderBy('createdAt', 'desc')
        );
        
        const allOrders = query(
          ordersRef,
          orderBy('createdAt', 'desc'),
          limit(100)
        );

        const [todaySnapshot, allOrdersSnapshot] = await Promise.all([
          getDocs(todayOrders),
          getDocs(allOrders)
        ]);

        // Calculate daily revenue
        const dailyRevenue = todaySnapshot.docs.reduce(
          (sum, doc) => sum + doc.data().totalAmount,
          0
        );

        // Calculate total orders and average order value
        const orders = allOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate top products
        const productMap = new Map();
        orders.forEach(order => {
          order.items.forEach(item => {
            const current = productMap.get(item.productId) || { totalSold: 0, revenue: 0 };
            productMap.set(item.productId, {
              totalSold: current.totalSold + item.quantity,
              revenue: current.revenue + (item.price * item.quantity)
            });
          });
        });

        const topProducts = Array.from(productMap.entries())
          .map(([productId, data]) => ({
            productId,
            ...data
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Calculate recent sales
        const recentSales = orders
          .slice(0, 7)
          .map(order => ({
            date: new Date(order.createdAt.toDate()).toLocaleDateString(),
            amount: order.totalAmount
          }));

        // Calculate monthly revenue
        const monthlyData = new Map();
        orders.forEach(order => {
          const date = order.createdAt.toDate();
          const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
          const current = monthlyData.get(monthYear) || 0;
          monthlyData.set(monthYear, current + order.totalAmount);
        });

        const monthlyRevenue = Array.from(monthlyData.entries())
          .map(([month, revenue]) => ({ month, revenue }))
          .sort((a, b) => a.month.localeCompare(b.month));

        setAnalyticsData({
          dailyRevenue,
          totalOrders,
          averageOrderValue,
          topProducts,
          recentSales,
          monthlyRevenue
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-4">
      <Grid columns={3} gap={4}>
        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.dailyRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analyticsData.averageOrderValue)}
            </div>
          </CardContent>
        </Card>
      </Grid>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={analyticsData.monthlyRevenue}
              xField="month"
              yField="revenue"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={analyticsData.recentSales}
              xField="date"
              yField="amount"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topProducts.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between"
              >
                <span>Product {product.productId}</span>
                <div className="space-x-4">
                  <span>Sold: {product.totalSold}</span>
                  <span>Revenue: {formatCurrency(product.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 