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
import { averageLifts } from "../constants/averageLifts";

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
  thiefOfJoy: boolean; // Add thiefOfJoy as a prop
  exerciseType: string;
}

const LineChart = ({ prData, thiefOfJoy, exerciseType }: LineChartProps) => {
  // Get the appropriate average lift for the selected exercise
  const averageLift = averageLifts[exerciseType] || 100; // Default to 100 if no match

  const lineChartData = {
    labels: prData.map((pr) => pr.date), // Use dates as labels
    datasets: [
      {
        label: "Your PR (kg)",
        data: prData.map((pr) => pr.value_kg), // Use PR values as data
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
      // Add a second dataset for the average person's lift if thiefOfJoy is true
      ...(thiefOfJoy
        ? [
            {
              label: "Average Person's Lift (kg)",
              data: prData.map(() => averageLift), // Flat line at the average lift value
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderDash: [5, 5], // Dashed line for the average lift
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#000",
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
          color: "#000",
          font: {
            size: 14,
          },
        },
      },
      y: {
        ticks: {
          color: "#000",
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
