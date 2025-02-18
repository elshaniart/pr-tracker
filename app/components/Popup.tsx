"use client";

import React, { useState } from "react";
import supabase from "../helper/supabaseClient";

interface PopupProps {
  onClose: () => void;
  userId: string;
}

const Popup: React.FC<PopupProps> = ({ onClose, userId }) => {
  const [exercise, setExercise] = useState<"bench" | "deadlift" | "squat">(
    "bench"
  );
  const [valueKg, setValueKg] = useState<number | null>(null);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = Number(e.target.value);
    let maxValue = 0;

    switch (exercise) {
      case "bench":
        maxValue = 450;
        break;
      case "squat":
        maxValue = 505;
        break;
      case "deadlift":
        maxValue = 501;
        break;
      default:
        maxValue = Infinity;
    }

    if (inputValue > maxValue) {
      alert(`The maximum value for ${exercise} is ${maxValue} kg.`);
      setValueKg(maxValue);
    } else {
      setValueKg(inputValue);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split("T")[0];

    if (selectedDate > today) {
      alert("You cannot select a future date.");
      setDate(today);
    } else {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!valueKg || !date) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      // Insert PR
      const { error: prError } = await supabase
        .from("prs")
        .insert([{ exercise, value_kg: valueKg, date, user_id: userId }]);

      if (prError) throw new Error(`PR insertion failed: ${prError.message}`);

      // Update profile
      const updateData: Record<string, number | null> = {};
      if (exercise === "bench") updateData.bench_press_pr = valueKg;
      if (exercise === "squat") updateData.squat_pr = valueKg;
      if (exercise === "deadlift") updateData.deadlift_pr = valueKg;

      const { error: profileError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (profileError)
        throw new Error(`Profile update failed: ${profileError.message}`);

      onClose(); // Close the popup
      window.location.reload(); // Refresh the page to reflect the new PR
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
        alert(`Failed to create PR or update profile: ${error.message}`);
      } else {
        console.error("Unknown error:", error);
        alert("Failed to create PR or update profile. Please try again.");
      }
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
              onChange={handleWeightChange}
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
              onChange={handleDateChange}
              className="w-full p-2 border-2 border-black text-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all focus:outline-none h-[48px]"
              required
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-alt">
              Cancel
            </button>
            <button type="submit" className="btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Popup;
