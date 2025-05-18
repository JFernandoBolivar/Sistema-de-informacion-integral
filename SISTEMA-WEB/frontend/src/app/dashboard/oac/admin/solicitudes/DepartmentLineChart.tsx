'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// TypeScript interfaces for department data
interface DepartmentData {
  name: string;
  color: string;
  borderColor: string;
  data: number[];
}

interface ChartData {
  labels: string[];
  departments: DepartmentData[];
}

// Sample data - replace with actual data fetching later
const sampleChartData: ChartData = {
  labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
  departments: [
    {
      name: 'Recursos Humanos',
      color: 'rgba(53, 162, 235, 0.5)',
      borderColor: 'rgb(53, 162, 235)',
      data: [20, 25, 18, 30, 28, 32],
    },
    {
      name: 'Finanzas',
      color: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgb(255, 99, 132)',
      data: [15, 12, 18, 14, 22, 25],
    },
    {
      name: 'Tecnología',
      color: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgb(75, 192, 192)',
      data: [32, 28, 35, 40, 38, 45],
    },
    {
      name: 'Operaciones',
      color: 'rgba(255, 159, 64, 0.5)',
      borderColor: 'rgb(255, 159, 64)',
      data: [12, 15, 10, 18, 20, 22],
    },
  ],
};

const DepartmentLineChart = () => {
  const chartRef = useRef<ChartJS>(null);

  // Prepare data for Chart.js
  const chartData = {
    labels: sampleChartData.labels,
    datasets: sampleChartData.departments.map((dept) => ({
      label: dept.name,
      data: dept.data,
      backgroundColor: dept.color,
      borderColor: dept.borderColor,
      borderWidth: 2,
      fill: false,
      tension: 0.4, // Adds curve to lines
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  // Chart options
  const chartOptions = {
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
          precision: 0, // Ensures we only show whole numbers
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
            return `${tooltipItems[0].label}`;
          },
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw} solicitudes`;
          }
        }
      },
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
    <div className="h-full w-full">
      <Line ref={chartRef} data={chartData} options={chartOptions} />
    </div>
  );
};

export default DepartmentLineChart;

