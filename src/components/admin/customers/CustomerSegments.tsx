import React, { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analyticsService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DoughnutChart } from '@/components/ui/charts';
import { toast } from 'sonner';

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

export const CustomerSegments = () => {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getCustomerSegments();
      setSegments(data);
    } catch (error) {
      console.error('Error fetching customer segments:', error);
      toast.error('Failed to fetch customer segments');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: segments.map(segment => segment.name),
    datasets: [
      {
        data: segments.map(segment => segment.customers.length),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(255, 159, 64)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (loading) {
    return <div>Loading customer segments...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Segment Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <DoughnutChart data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Segment Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader>
              <CardTitle>{segment.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold">
                    {segment.customers.length}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">
                    Segment Criteria
                  </p>
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Purchase Frequency:</span>{' '}
                      {segment.criteria.purchaseFrequency}+ orders
                    </p>
                    <p>
                      <span className="font-medium">Average Order Value:</span> $
                      {segment.criteria.averageOrderValue.toLocaleString()}+
                    </p>
                    <p>
                      <span className="font-medium">Last Purchase:</span> within{' '}
                      {Math.round(
                        (new Date().getTime() -
                          segment.criteria.lastPurchaseDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      days
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Segment Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <h3 className="font-medium">{segment.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Customer Share</p>
                    <p className="font-medium">
                      {(
                        (segment.customers.length /
                          segments.reduce(
                            (sum, s) => sum + s.customers.length,
                            0
                          )) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Growth Opportunity</p>
                    <p className="font-medium">
                      {segment.name === 'VIP Customers'
                        ? 'Retention Focus'
                        : segment.name === 'Regular Customers'
                        ? 'Upgrade Potential'
                        : 'Activation Target'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
