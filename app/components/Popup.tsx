"use client";

import React, { useState } from "react";
import supabase from "../helper/supabaseClient";

interface PopupProps {
  onClose: () => void; // Function to close the popup
  userId: string; // ID of the user creating the PR
}

const Popup: React.FC<PopupProps> = ({ onClose, userId }) => {
  const [exercise, setExercise] = useState<"bench" | "deadlift" | "squat">(
    "bench"
  ); // Selected exercise
  const [valueKg, setValueKg] = useState<number | null>(null); // Weight in kg
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  ); // Default to today's date

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!valueKg || !date) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      // Step 1: Insert the new PR into the `prs` table
      const { error: prError } = await supabase
        .from("prs")
        .insert([
          {
            exercise,
            value_kg: valueKg,
            date,
            user_id: userId,
          },
        ])
        .select();

      if (prError) {
        throw prError;
      }

      // Step 2: Update the user's profile with the new PR value
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          bench_press_pr: exercise === "bench" ? valueKg : undefined,
          squat_pr: exercise === "squat" ? valueKg : undefined,
          deadlift_pr: exercise === "deadlift" ? valueKg : undefined,
        })
        .eq("id", userId);

      if (profileError) {
        throw profileError;
      }

      onClose(); // Close the popup
      window.location.reload(); // Refresh the page to reflect the new PR
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create PR or update profile. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white p-8 border-2 border-black w-[400px]">
        <h2 className="text-2xl font-semibold mb-4 text-black">
          Register New PR
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Exercise
            </label>
            <div className="flex gap-4">
              {["bench", "deadlift", "squat"].map((ex) => (
                <label key={ex} className="flex items-center">
                  <input
                    type="radio"
                    value={ex}
                    checked={exercise === ex}
                    onChange={() =>
                      setExercise(ex as "bench" | "deadlift" | "squat")
                    }
                    className="mr-2"
                  />
                  <span className="text-black capitalize">{ex}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              value={valueKg || ""}
              onChange={(e) => {
                const inputValue = Number(e.target.value);
                if (exercise === "bench") setValueKg(Math.min(inputValue, 450));
                if (exercise === "squat") setValueKg(Math.min(inputValue, 505));
                if (exercise === "deadlift")
                  setValueKg(Math.min(inputValue, 501));
              }}
              className="w-full p-2 border-2 border-black text-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all focus:outline-none h-[48px]"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border-2 border-black text-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all focus:outline-none h-[48px]"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-black border-black border-2 hover:border-brandGreen hover:border-4 hover:px-3.5 ease-in-out transition-all h-[48px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black hover:bg-brandGreen ease-in-out transition-all text-white hover:text-black h-[48px]"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Popup;
