'use client';

import { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// TypeScript interface for request status data
interface RequestStatusData {
  label: string;
  count: number;
  color: string;
}

// Sample data - replace with actual data fetching later
const sampleStatusData: RequestStatusData[] = [
  { label: 'Pendiente', count: 12, color: '#FBBF24' }, // Amber
  { label: 'Aprobada', count: 18, color: '#34D399' },  // Green
  { label: 'Rechazada', count: 5, color: '#F87171' },  // Red
  { label: 'En revisión', count: 8, color: '#60A5FA' }, // Blue
];

const StatusChart = () => {
  const chartRef = useRef<ChartJS<"pie", number[], string>>(null);

  // Prepare data for Chart.js
  const chartData = {
    labels: sampleStatusData.map(item => item.label),
    datasets: [
      {
        data: sampleStatusData.map(item => item.count),
        backgroundColor: sampleStatusData.map(item => item.color),
        borderColor: sampleStatusData.map(item => item.color),
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 12,
          },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((acc: number, data: number) => acc + data, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
            return `${label}: ${value} (${percentage})`;
          }
        }
      }
    },
  };

  return (
    <div className="h-full w-full">
      <Pie ref={chartRef} data={chartData} options={chartOptions} />
    </div>
  );
};

export default StatusChart;

