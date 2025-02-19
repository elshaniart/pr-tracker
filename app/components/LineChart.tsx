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
}

const LineChart = ({
  prData,
  thiefOfJoy,
  exerciseType,
  userId,
}: LineChartProps) => {
  const [averageLift, setAverageLift] = useState<number | null>(null);
  const [friendAverage, setFriendAverage] = useState<number | null>(null);

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

        // Calculate the average lift value
        const average =
          prValues.reduce((sum, value) => sum + value, 0) / prValues.length;
        setAverageLift(average);
      } catch (error) {
        console.error("Error fetching average lift:", error);
        setAverageLift(null);
      }
    };

    const fetchFriendAverage = async () => {
      try {
        // Get the user's profile to access the friends list
        const { data: userProfile, error: userError } = await supabase
          .from("profiles")
          .select("friends")
          .eq("id", userId)
          .single();

        if (userError) throw new Error(userError.message);

        // Check if friends is an array, if not, default to empty array
        const friendIds = Array.isArray(userProfile?.friends)
          ? userProfile.friends
          : [];

        // If no friends, exit early
        if (friendIds.length === 0) {
          setFriendAverage(null);
          return;
        }

        // Fetch PRs for all friends
        const { data: friendPRs, error: friendError } = await supabase
          .from("prs")
          .select("value_kg, exercise")
          .in("user_id", friendIds)
          .eq("exercise", exerciseType);

        if (friendError) throw new Error(friendError.message);

        // Calculate the average for all friends' PRs
        const friendValues = friendPRs.map((pr) => pr.value_kg);
        const averageFriendLift =
          friendValues.reduce((sum, value) => sum + value, 0) /
          friendValues.length;

        setFriendAverage(averageFriendLift || null);
      } catch (error) {
        console.error("Error fetching friend average:", error);
        setFriendAverage(null);
      }
    };

    fetchAverageLift();
    fetchFriendAverage();
  }, [exerciseType, userId]);

  const lineChartData = {
    labels: prData.map((pr) => pr.date),
    datasets: [
      {
        label: "Your PR",
        data: prData.map((pr) => pr.value_kg),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
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
      // Friend Average PR line
      ...(friendAverage !== null
        ? [
            {
              label: "Friend Avg.",
              data: prData.map(() => friendAverage),
              borderColor: "rgb(54, 162, 235)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderDash: [10, 5],
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
