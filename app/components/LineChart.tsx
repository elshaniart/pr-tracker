"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PRData {
  date: string;
  value_kg: number;
}

interface LineChartProps {
  prData: PRData[];
}

const LineChart = ({ prData }: LineChartProps) => {
  const lineChartData = {
    labels: prData.map((pr) => pr.date), // Use dates as labels
    datasets: [
      {
        label: "PR (kg)",
        data: prData.map((pr) => pr.value_kg), // Use PR values as data
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        titleFont: { size: 14 },
        bodyFont: { size: 14 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#fff",
          font: {
            size: 14,
          },
        },
      },
      y: {
        ticks: {
          color: "#fff",
          font: {
            size: 14,
          },
        },
      },
    },
  };

  return (
    <Line
      className="max-w-3xl w-full max-h-[480px]"
      options={options}
      data={lineChartData}
    />
  );
};

export default LineChart;
