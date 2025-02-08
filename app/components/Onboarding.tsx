"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Get the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      // Update the profile with onboarding data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name,
          height_cm: heightCm,
          weight_kg: weightKg,
          birthday,
          bench_press_pr: benchPressPr,
          squat_pr: squatPr,
          deadlift_pr: deadliftPr,
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
          value_kg: benchPressPr,
          date: today,
          user_id: userData.user.id,
        },
        {
          exercise: "squat",
          value_kg: squatPr,
          date: today,
          user_id: userData.user.id,
        },
        {
          exercise: "deadlift",
          value_kg: deadliftPr,
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
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full p-2 mb-4 border rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Weight in kg</label>
          <input
            type="number"
            placeholder="Weight (kg)"
            value={weightKg ?? ""}
            onChange={(e) => setWeightKg(Number(e.target.value))}
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
            onChange={(e) => setBenchPressPr(Number(e.target.value))}
            className="w-full p-2 mb-4 border rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Squat PR</label>
          <input
            type="number"
            placeholder="Squat PR (kg)"
            value={squatPr ?? ""}
            onChange={(e) => setSquatPr(Number(e.target.value))}
            className="w-full p-2 mb-4 border rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Deadlift PR</label>
          <input
            type="number"
            placeholder="Deadlift PR (kg)"
            value={deadliftPr ?? ""}
            onChange={(e) => setDeadliftPr(Number(e.target.value))}
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
