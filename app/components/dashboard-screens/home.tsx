"use client";

import React, { useEffect, useState } from "react";
import supabase from "../../helper/supabaseClient";
import LineChart from "../LineChart";

interface DashboardHomeScreenProps {
  bench_press_pr: number | null;
  deadlift_pr: number | null;
  squat_pr: number | null;
  height_cm: number | null;
  weight_kg: number | null;
}

const DashboardHomeScreen = ({
  bench_press_pr = 0,
  deadlift_pr = 0,
  squat_pr = 0,
  height_cm = 0,
  weight_kg = 0,
}: DashboardHomeScreenProps) => {
  const [initialPRs, setInitialPRs] = useState<{ [key: string]: number }>({});
  const [selectedExercise, setSelectedExercise] = useState("bench"); // State for selected exercise
  const [prData, setPRData] = useState<{ date: string; value_kg: number }[]>(
    []
  ); // State for PR data

  const getBMIClassification = (bmi: number) => {
    if (bmi < 16.0)
      return { category: "Severely Underweight", color: "text-[#E31A1A]" };
    if (bmi < 17.0)
      return { category: "Moderately Underweight", color: "text-[#F6AD55]" };
    if (bmi < 18.5)
      return { category: "Mildly Underweight", color: "text-[#F6AD55]" };
    if (bmi < 25.0) return { category: "Normal", color: "text-[#01B574]" };
    if (bmi < 30.0) return { category: "Overweight", color: "text-[#F6AD55]" };
    if (bmi < 35.0)
      return { category: "Obese (Class 1)", color: "text-[#E31A1A]" };
    if (bmi < 40.0)
      return { category: "Obese (Class 2)", color: "text-[#E31A1A]" };
    return {
      category: "Obese (Class 3 - Morbid Obesity)",
      color: "text-[#E31A1A]",
    };
  };

  const calculateBMI = (weight_kg: number | null, height_cm: number | null) => {
    if (!weight_kg || !height_cm) return null;
    const height_m = height_cm / 100;
    return parseFloat((weight_kg / (height_m * height_m)).toFixed(1));
  };

  const bmi = calculateBMI(weight_kg, height_cm);
  const { category, color } = bmi
    ? getBMIClassification(bmi)
    : { category: "N/A", color: "text-white" };

  useEffect(() => {
    const fetchInitialPRs = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (!userData?.user || userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      // Fetch all PRs for the current user
      const { data, error } = await supabase
        .from("prs")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching PRs:", error);
        return;
      }

      // Extract the first PR for each exercise
      const firstPRs: { [key: string]: number } = {};
      data.forEach((pr) => {
        if (!firstPRs[pr.exercise]) {
          firstPRs[pr.exercise] = pr.value_kg;
        }
      });

      setInitialPRs(firstPRs);
    };

    fetchInitialPRs();
  }, []);

  // Fetch PR data for the selected exercise
  useEffect(() => {
    const fetchPRData = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (!userData?.user || userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      // Fetch PRs for the selected exercise
      const { data, error } = await supabase
        .from("prs")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("exercise", selectedExercise)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching PR data:", error);
        return;
      }

      // Format data for the chart
      const formattedData = data.map((pr) => ({
        date: new Date(pr.date).toLocaleDateString(), // Format date
        value_kg: pr.value_kg,
      }));

      setPRData(formattedData);
    };

    fetchPRData();
  }, [selectedExercise]);

  const calculatePercentageIncrease = (
    initial: number | undefined,
    current: number
  ) => {
    if (!initial || initial === 0) return null;
    const increase = ((current - initial) / initial) * 100;
    return increase.toFixed(1);
  };

  return (
    <div className="w-full h-full text-white py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Current PRs</h2>
        <div className="flex flex-row gap-2">
          {[
            { name: "Bench Press", current: bench_press_pr, key: "bench" },
            { name: "Deadlift", current: deadlift_pr, key: "deadlift" },
            { name: "Squat", current: squat_pr, key: "squat" },
          ].map(({ name, current, key }) => {
            const initialPR = initialPRs[key];
            const percentageIncrease = calculatePercentageIncrease(
              initialPR,
              current || 0
            );

            return (
              <div
                key={key}
                className="h-[112px] w-[288px] bg-gradient-to-r from-[#060B26] to-[#06275D] border-[2px] border-[#060B26] rounded-2xl p-4 gap-1 flex flex-col"
              >
                <p className="text-sm leading-3 text-[#ccc]">{name}</p>
                <div className="flex flex-row gap-2 items-center font-semibold text-sm">
                  <p className="text-xl font-semibold">{current} kg</p>
                  {percentageIncrease !== null && (
                    <p className="text-[#01B574]">(+{percentageIncrease}%)</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Personal Info</h2>
        <div className="flex flex-row gap-2">
          <div className="h-[112px] w-[288px] bg-gradient-to-r from-[#060B26] to-[#06275D] border-[2px] border-[#060B26] rounded-2xl p-4 gap-1 flex flex-col">
            <p className="text-sm leading-3 text-[#ccc]">Weight</p>
            <p className="text-xl font-semibold">{weight_kg} kg</p>
          </div>
          <div className="h-[112px] w-[288px] bg-gradient-to-r from-[#060B26] to-[#06275D] border-[2px] border-[#060B26] rounded-2xl p-4 gap-1 flex flex-col">
            <p className="text-sm leading-3 text-[#ccc]">Height</p>
            <p className="text-xl font-semibold">
              {height_cm ? (height_cm / 100).toFixed(2) + "m" : "N/A"}
            </p>
          </div>
          <div className="h-[112px] w-[288px] bg-gradient-to-r from-[#060B26] to-[#06275D] border-[2px] border-[#060B26] rounded-2xl p-4 gap-1 flex flex-col">
            <p className="text-sm leading-3 text-[#ccc]">BMI</p>
            <p className="text-xl font-semibold">
              {weight_kg && height_cm
                ? (weight_kg / (height_cm / 100) ** 2).toFixed(1)
                : "N/A"}
            </p>
            <p className={`text-sm font-semibold ${color}`}>{category}</p>
          </div>
        </div>
      </div>

      {/* Exercise Selector and Line Chart */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-300 font-semibold">
            Select Exercise:
          </label>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="p-2 rounded-lg bg-[#1A1F37] text-white h-[48px] flex items-center"
          >
            <option value="bench">Bench Press</option>
            <option value="squat">Squat</option>
            <option value="deadlift">Deadlift</option>
          </select>
        </div>
        <LineChart prData={prData} />
      </div>
    </div>
  );
};

export default DashboardHomeScreen;
