'use client';

import { useRef } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// TypeScript interfaces for data
export interface StatusData {
  label: string;
  count: number;
  color: string;
}

export interface TimelineDataset {
  label: string;
  data: number[];
  color: string;
  borderColor: string;
}

export interface TimelineData {
  labels: string[];
  datasets: TimelineDataset[];
}

export interface StatusChartProps {
  type: 'pie' | 'line';
  statusData?: StatusData[];
  timelineData?: TimelineData;
  height?: string;
  title?: string;
}

// Predefined color scheme for status categories
export const STATUS_COLORS = {
  pendiente: {
    bg: '#FBBF24',
    border: 'rgb(251, 191, 36)',
    bgAlpha: 'rgba(251, 191, 36, 0.5)',
  },
  aprobada: {
    bg: '#34D399',
    border: 'rgb(52, 211, 153)',
    bgAlpha: 'rgba(52, 211, 153, 0.5)',
  },
  rechazada: {
    bg: '#F87171',
    border: 'rgb(248, 113, 113)',
    bgAlpha: 'rgba(248, 113, 113, 0.5)',
  },
  vencida: {
    bg: '#8B5CF6',
    border: 'rgb(139, 92, 246)',
    bgAlpha: 'rgba(139, 92, 246, 0.5)',
  },
};

const StatusChart = ({ type, statusData, timelineData, height = '300px', title }: StatusChartProps) => {
  const chartRef = useRef<ChartJS>(null);

  if (type === 'pie' && statusData) {
    const pieData = {
      labels: statusData.map(item => item.label),
      datasets: [
        {
          data: statusData.map(item => item.count),
          backgroundColor: statusData.map(item => item.color),
          borderColor: statusData.map(item => item.color),
          borderWidth: 1,
        },
      ],
    };

    const pieOptions = {
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
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((acc: number, data: number) => acc + data, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
    };

    return (
      <div style={{ height }} className="w-full">
        {title && <h3 className="font-medium mb-2 text-center">{title}</h3>}
        <Pie ref={chartRef} data={pieData} options={pieOptions} />
      </div>
    );
  }

  if (type === 'line' && timelineData) {
    const lineData = {
      labels: timelineData.labels,
      datasets: timelineData.datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.color,
        borderColor: dataset.borderColor,
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      })),
    };

    const lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Número de solicitudes',
            font: {
              size: 12,
            },
          },
          ticks: {
            precision: 0,
          },
        },
        x: {
          title: {
            display: true,
            text: 'Mes',
            font: {
              size: 12,
            },
          },
        },
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            boxWidth: 12,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          callbacks: {
            title: function(tooltipItems: any) {
              return tooltipItems[0].label;
            },
            label: function(context: any) {
              return `${context.dataset.label}: ${context.raw} solicitudes`;
            }
          }
        }
      },
      animations: {
        tension: {
          duration: 1000,
          easing: 'linear',
          from: 0.3,
          to: 0.4,
          loop: false
        }
      },
    };

    return (
      <div style={{ height }} className="w-full">
        {title && <h3 className="font-medium mb-2 text-center">{title}</h3>}
        <Line ref={chartRef} data={lineData} options={lineOptions} />
      </div>
    );
  }

  return null;
};

export default StatusChart;
