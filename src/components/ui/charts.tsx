import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type ChartType = 'line' | 'bar' | 'doughnut';

interface BaseChartProps<T extends ChartType> {
  data: ChartData<T>;
  options?: ChartOptions<T>;
}

export const LineChart = ({ data, options }: BaseChartProps<'line'>) => {
  return (
    <div className="w-full h-full">
      <Line
        data={data}
        options={{
          maintainAspectRatio: false,
          ...options,
        }}
      />
    </div>
  );
};

interface DoughnutChartProps {
  data: ChartData<'doughnut'>;
  options?: ChartOptions<'doughnut'>;
}

export const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, options }) => {
  const defaultOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    }
  };

  return (
    <div className="w-full h-full">
      <Doughnut
        data={data}
        options={options || defaultOptions}
      />
    </div>
  );
};

export const BarChart = ({ data, options }: BaseChartProps<'bar'>) => {
  return (
    <div className="w-full h-full">
      <Bar
        data={data}
        options={{
          maintainAspectRatio: false,
          ...options,
        }}
      />
    </div>
  );
}; 