import React from "react";

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
  const calculateBMI = (weight_kg: number | null, height_cm: number | null) => {
    if (!weight_kg || !height_cm) return null; // Handle missing data

    const height_m = height_cm / 100; // Convert height to meters
    const bmi = (weight_kg / (height_m * height_m)).toFixed(1); // Calculate BMI with 1 decimal place
    return parseFloat(bmi); // Return as a number
  };

  const bmi = calculateBMI(weight_kg, height_cm);

  return (
    <div className="w-full h-full text-white py-8 flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl">Current PRs</h2>
        <div className="flex flex-row gap-4">
          <div className="h-[112px] w-[288px] bg-[#060B26] rounded-2xl p-4 gap-1 flex flex-col">
            <p className="text-sm leading-3 text-[#ccc]">Bench Press</p>
            <p className="text-xl font-semibold">{bench_press_pr} kg</p>
          </div>
          <div className="h-[112px] w-[288px] bg-[#060B26] rounded-2xl p-4 gap-1 flex flex-col">
            <p className="text-sm leading-3 text-[#ccc]">Deadlift</p>
            <p className="text-xl font-semibold">{deadlift_pr} kg</p>
          </div>
          <div className="h-[112px] w-[288px] bg-[#060B26] rounded-2xl p-4 gap-1 flex flex-col">
            <p className="text-sm leading-3 text-[#ccc]">Squat</p>
            <p className="text-xl font-semibold">{squat_pr} kg</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl">Personal Info</h2>
        <div className="flex flex-row gap-4">
          <div className="h-[112px] w-[288px] bg-[#060B26] rounded-2xl p-4 gap-1 flex flex-col">
            <p className="text-sm leading-3 text-[#ccc]">Weight</p>
            <p className="text-xl font-semibold">{weight_kg} kg</p>
          </div>
          <div className="h-[112px] w-[288px] bg-[#060B26] rounded-2xl p-4 gap-1 flex flex-col">
            <p className="text-sm leading-3 text-[#ccc]">Height</p>
            <p className="text-xl font-semibold">
              {height_cm ? (height_cm / 100).toFixed(2) + "m" : "N/A"}
            </p>
          </div>
          <div className="h-[112px] w-[288px] bg-[#060B26] rounded-2xl p-4 gap-1 flex flex-col">
            <p className="text-sm leading-3 text-[#ccc]">BMI</p>
            <p className="text-xl font-semibold">{bmi ? bmi : "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomeScreen;
