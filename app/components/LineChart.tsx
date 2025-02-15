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
import { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";

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
  const [averageLift, setAverageLift] = useState<number | null>(null);

  useEffect(() => {
    const fetchAverageLift = async () => {
      try {
        // Fetch all profiles from Supabase
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select(`bench_press_pr, squat_pr, deadlift_pr`);

        if (error) {
          throw new Error(error.message);
        }

        console.log({ profiles });

        // Extract the relevant PR data based on the exercise type
        const prValues = profiles
          .map((profile) => {
            switch (exerciseType) {
              case "bench_press":
                return profile.bench_press_pr;
              case "squat":
                return profile.squat_pr;
              case "deadlift":
                return profile.deadlift_pr;
              default:
                return null;
            }
          })
          .filter((value): value is number => value !== null);

        // Calculate the average lift value
        const average =
          prValues.reduce((sum, value) => sum + value, 0) / prValues.length;
        setAverageLift(average);
      } catch (error) {
        console.error("Error fetching average lift:", error);
        setAverageLift(null);
      }
    };

    fetchAverageLift();
  }, [exerciseType]);

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
      ...(thiefOfJoy && averageLift !== null
        ? [
            {
              label: "Average PR (kg)",
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
