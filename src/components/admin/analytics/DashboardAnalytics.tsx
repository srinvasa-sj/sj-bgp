import React, { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analyticsService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LineChart, BarChart } from '@/components/ui/charts';
import { toast } from 'sonner';

export const DashboardAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDetailedAnalytics(
        dateRange.startDate,
        dateRange.endDate
      );
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading analytics data...</div>;
  }

  if (!analyticsData) {
    return <div>No analytics data available</div>;
  }

  const revenueChartData = {
    labels: Object.keys(analyticsData.revenue.daily),
    datasets: [
      {
        label: 'Daily Revenue',
        data: Object.values(analyticsData.revenue.daily),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const productPerformanceData = {
    labels: analyticsData.productPerformance
      .slice(0, 5)
      .map((product: any) => product.productId),
    datasets: [
      {
        label: 'Revenue',
        data: analyticsData.productPerformance
          .slice(0, 5)
          .map((product: any) => product.revenue),
        backgroundColor: 'rgba(75, 192, 192, 0.5)'
      }
    ]
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">
              ${analyticsData.revenue.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">
              ${analyticsData.orderMetrics.averageValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 md:col-span-1">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Total Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-xl sm:text-2xl font-bold">
              {analyticsData.orderMetrics.total}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-[200px] sm:h-[300px]">
            <LineChart data={revenueChartData} />
          </div>
        </CardContent>
      </Card>

      {/* Product Performance */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Top Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-[200px] sm:h-[300px]">
            <BarChart data={productPerformanceData} />
          </div>
        </CardContent>
      </Card>

      {/* Customer and Category Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Customer Metrics</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {analyticsData.customerMetrics.slice(0, 5).map((customer: any) => (
                <div
                  key={customer.customerId}
                  className="flex justify-between items-center text-sm sm:text-base"
                >
                  <span className="truncate mr-2">Customer {customer.customerId}</span>
                  <span className="font-medium whitespace-nowrap">
                    ${customer.totalSpent.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Category Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {analyticsData.categoryAnalysis.map((category: any) => (
                <div
                  key={category.category}
                  className="flex justify-between items-center text-sm sm:text-base"
                >
                  <span className="truncate mr-2">{category.category}</span>
                  <span className="font-medium whitespace-nowrap">
                    ${category.revenue.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 