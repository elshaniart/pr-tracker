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
  thiefOfJoy: boolean;
  exerciseType: string;
  userId: string;
  selectedFriend: string;
}

const LineChart = ({
  prData,
  thiefOfJoy,
  exerciseType,
  userId,
  selectedFriend,
}: LineChartProps) => {
  const [averageLift, setAverageLift] = useState<number | null>(null);
  const [friendPRs, setFriendPRs] = useState<PRData[]>([]);

  useEffect(() => {
    const fetchAverageLift = async () => {
      try {
        // Fetch all profiles to calculate global average
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select(`bench_press_pr, squat_pr, deadlift_pr`);

        if (error) throw new Error(error.message);

        // Extract relevant PRs based on the exercise type
        const prValues = profiles
          .map((profile) => {
            switch (exerciseType) {
              case "bench":
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

        // Calculate global average lift
        const average =
          prValues.reduce((sum, value) => sum + value, 0) / prValues.length;
        setAverageLift(average);

        // Only fetch friend's data if a friend is selected
        if (selectedFriend) {
          console.log("Fetching data for friend:", selectedFriend);

          const { data: friendPRs, error: friendError } = await supabase
            .from("prs")
            .select("date, value_kg")
            .eq("user_id", selectedFriend)
            .eq("exercise", exerciseType);

          if (friendError) throw new Error(friendError.message);

          setFriendPRs(friendPRs || []);
        } else {
          setFriendPRs([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAverageLift(null);
      }
    };

    const fetchFriendData = async () => {
      if (selectedFriend === "") return; // If no friend selected, do nothing

      try {
        // Fetch PRs for the selected friend
        const { data: friendPRs, error: friendError } = await supabase
          .from("prs")
          .select("date, value_kg")
          .eq("user_id", selectedFriend) // Fetch PRs for the selected friend
          .eq("exercise", exerciseType);

        if (friendError) throw new Error(friendError.message);

        setFriendPRs(friendPRs || []);
      } catch (error) {
        console.error("Error fetching friend data:", error);
        setFriendPRs([]);
      }
    };

    fetchAverageLift();
    fetchFriendData();
  }, [exerciseType, userId, selectedFriend]);

  const lineChartData = {
    labels: prData.map((pr) => pr.date),
    datasets: [
      {
        label: "Your PR",
        data: prData.map((pr) => pr.value_kg),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
      // If a friend is selected, show their PR line
      ...(selectedFriend !== ""
        ? [
            {
              label: "Friend's PR",
              data: friendPRs.map((pr) => pr.value_kg),
              borderColor: "rgb(54, 162, 235)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
            },
          ]
        : []),
      // Average PR line (Thief of Joy)
      ...(thiefOfJoy && averageLift !== null
        ? [
            {
              label: "Average PR",
              data: prData.map(() => averageLift),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderDash: [5, 5],
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
