import React, { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analyticsService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LineChart } from '@/components/ui/charts';
import { Select } from '@/components/ui/select';
import { toast } from 'sonner';

interface SalesForecast {
  date: string;
  predictedRevenue: number;
  confidence: number;
  factors: {
    seasonality: number;
    trend: number;
    events: string[];
  };
}

export const SalesForecasting = () => {
  const [forecasts, setForecasts] = useState<SalesForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [forecastDays, setForecastDays] = useState(30);

  useEffect(() => {
    fetchForecasts();
  }, [forecastDays]);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.generateSalesForecast(forecastDays);
      setForecasts(data);
    } catch (error) {
      console.error('Error fetching sales forecasts:', error);
      toast.error('Failed to fetch sales forecasts');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: forecasts.map(f => f.date),
    datasets: [
      {
        label: 'Predicted Revenue',
        data: forecasts.map(f => f.predictedRevenue),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
      },
      {
        label: 'Confidence Level',
        data: forecasts.map(f => f.confidence),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.1)',
        fill: true,
        yAxisID: 'confidence',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue ($)',
        },
      },
      confidence: {
        position: 'right' as const,
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Confidence (%)',
        },
      },
    },
  };

  if (loading) {
    return <div>Loading sales forecasts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Forecast Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sales Forecast</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Forecast Period:
          </label>
          <Select
            value={forecastDays.toString()}
            onValueChange={(value) => setForecastDays(Number(value))}
          >
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
          </Select>
        </div>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <LineChart data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Forecast Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Average Daily Revenue
                </p>
                <p className="text-2xl font-bold">
                  $
                  {(
                    forecasts.reduce((sum, f) => sum + f.predictedRevenue, 0) /
                    forecasts.length
                  ).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Average Confidence Level
                </p>
                <p className="text-2xl font-bold">
                  {(
                    forecasts.reduce((sum, f) => sum + f.confidence, 0) /
                    forecasts.length
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Influencing Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forecasts.slice(0, 5).map((forecast, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">{forecast.date}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Seasonality Impact:</span>{' '}
                      {(forecast.factors.seasonality * 100 - 100).toFixed(1)}%
                    </p>
                    <p>
                      <span className="text-gray-500">Trend:</span>{' '}
                      {forecast.factors.trend > 1 ? 'Upward' : 'Downward'}
                    </p>
                    {forecast.factors.events.length > 0 && (
                      <p>
                        <span className="text-gray-500">Events:</span>{' '}
                        {forecast.factors.events.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 
