"use client";

import React, { useState } from "react";
import supabase from "../helper/supabaseClient";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

interface OnboardingProps {
  onComplete: () => void; // Callback function to notify parent
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // Added username state
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

      // Update the profile with onboarding data, including username
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name,
          username, // Save the username
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
    <div
      className={`flex flex-col items-center justify-center min-h-screen min-w-full ${montserrat.className}`}
    >
      <div className="p-4 text-black border-2 border-black">
        <h1 className="text-2xl font-bold mb-4 text-center">Onboarding</h1>
        <form onSubmit={handleSubmit} className="w-80 md:w-96">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] mb-2"
            required
          />
          <label>Username</label> {/* Added username input */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] mb-2"
            required
          />
          <label>Height in cm</label>
          <input
            type="number"
            placeholder="Height (cm)"
            value={heightCm ?? ""}
            onChange={(e) => setHeightCm(Math.min(Number(e.target.value), 240))}
            className="w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] mb-2"
            required
          />
          <label>Weight in kg</label>
          <input
            type="number"
            placeholder="Weight (kg)"
            value={weightKg ?? ""}
            onChange={(e) => setWeightKg(Math.min(Number(e.target.value), 500))}
            className="w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] mb-2"
            required
          />
          <label>Birthday</label>
          <input
            type="date"
            placeholder="Birthday"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] mb-2"
            required
          />
          <p className="text-xl font-semibold text-center">PRs</p>
          <div className="flex gap-2">
            <div>
              <label>Bench</label>
              <input
                type="number"
                placeholder="kg"
                value={benchPressPr ?? ""}
                onChange={(e) =>
                  setBenchPressPr(Math.min(Number(e.target.value), 450))
                }
                className="w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] mb-2"
                required
              />
            </div>
            <div>
              <label>Squat</label>
              <input
                type="number"
                placeholder="kg"
                value={squatPr ?? ""}
                onChange={(e) =>
                  setSquatPr(Math.min(Number(e.target.value), 505))
                }
                className="w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] mb-2"
                required
              />
            </div>
            <div>
              <label>Deadlift</label>
              <input
                type="number"
                placeholder="kg"
                value={deadliftPr ?? ""}
                onChange={(e) =>
                  setDeadliftPr(Math.min(Number(e.target.value), 501))
                }
                className="w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] mb-2"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button type="submit" className="btn w-full mt-2">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
