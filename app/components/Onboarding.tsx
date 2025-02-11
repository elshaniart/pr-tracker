"use client";

import React, { useState } from "react";
import supabase from "../helper/supabaseClient";

interface OnboardingProps {
  onComplete: () => void; // Callback function to notify parent
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("");
  const [heightCm, setHeightCm] = useState<number | null>(null);
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [birthday, setBirthday] = useState("");
  const [benchPressPr, setBenchPressPr] = useState<number | null>(null);
  const [squatPr, setSquatPr] = useState<number | null>(null);
  const [deadliftPr, setDeadliftPr] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      // Apply validation limits
      const validHeight = heightCm !== null ? Math.min(heightCm, 240) : null;
      const validWeight = weightKg !== null ? Math.min(weightKg, 500) : null;
      const validBenchPress =
        benchPressPr !== null ? Math.min(benchPressPr, 450) : null;
      const validSquat = squatPr !== null ? Math.min(squatPr, 505) : null;
      const validDeadlift =
        deadliftPr !== null ? Math.min(deadliftPr, 501) : null;

      // Update the profile with onboarding data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name,
          height_cm: validHeight,
          weight_kg: validWeight,
          birthday,
          bench_press_pr: validBenchPress,
          squat_pr: validSquat,
          deadlift_pr: validDeadlift,
          onboarded: true, // Set onboarded to true
        })
        .eq("id", userData.user.id);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Insert PRs into the `prs` table
      const today = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format

      const { error: prError } = await supabase.from("prs").insert([
        {
          exercise: "bench",
          value_kg: validBenchPress,
          date: today,
          user_id: userData.user.id,
        },
        {
          exercise: "squat",
          value_kg: validSquat,
          date: today,
          user_id: userData.user.id,
        },
        {
          exercise: "deadlift",
          value_kg: validDeadlift,
          date: today,
          user_id: userData.user.id,
        },
      ]);

      if (prError) {
        throw new Error(prError.message);
      }

      // Notify the parent that onboarding is complete
      onComplete();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-w-full">
      <div className="bg-[#060B26] p-4 text-white rounded-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Onboarding</h1>
        <form onSubmit={handleSubmit} className="w-96">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mb-4 border rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Height in cm</label>
          <input
            type="number"
            placeholder="Height (cm)"
            value={heightCm ?? ""}
            onChange={(e) => setHeightCm(Math.min(Number(e.target.value), 240))}
            className="w-full p-2 mb-4 border rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Weight in kg</label>
          <input
            type="number"
            placeholder="Weight (kg)"
            value={weightKg ?? ""}
            onChange={(e) => setWeightKg(Math.min(Number(e.target.value), 500))}
            className="w-full p-2 mb-4 border rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Birthday</label>
          <input
            type="date"
            placeholder="Birthday"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full p-2 mb-4 border rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Bench Press PR</label>
          <input
            type="number"
            placeholder="Bench Press PR (kg)"
            value={benchPressPr ?? ""}
            onChange={(e) =>
              setBenchPressPr(Math.min(Number(e.target.value), 450))
            }
            className="w-full p-2 mb-4 border rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Squat PR</label>
          <input
            type="number"
            placeholder="Squat PR (kg)"
            value={squatPr ?? ""}
            onChange={(e) => setSquatPr(Math.min(Number(e.target.value), 505))}
            className="w-full p-2 mb-4 border rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Deadlift PR</label>
          <input
            type="number"
            placeholder="Deadlift PR (kg)"
            value={deadliftPr ?? ""}
            onChange={(e) =>
              setDeadliftPr(Math.min(Number(e.target.value), 501))
            }
            className="w-full p-2 mb-4 border rounded bg-[#1A1F37] text-white"
            required
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
