import React, { useState, useEffect } from "react";
import supabase from "../helper/supabaseClient";

interface EditPrPopupProps {
  pr: string; // pr is the ID of the PR
  togglePopup: () => void;
}

const EditPrPopup = ({ pr, togglePopup }: EditPrPopupProps) => {
  const [exercise, setExercise] = useState<"bench" | "deadlift" | "squat">(
    "bench"
  );
  const [valueKg, setValueKg] = useState<number | null>(null);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Fetch PR data by ID when component loads
  useEffect(() => {
    const fetchPrData = async () => {
      const { data, error } = await supabase
        .from("prs")
        .select("exercise, value_kg, date")
        .eq("id", pr)
        .single();

      if (error) {
        console.error("Error fetching PR data:", error.message);
        return;
      }

      if (data) {
        setExercise(data.exercise as "bench" | "deadlift" | "squat");
        setValueKg(data.value_kg);
        setDate(data.date);
      }
    };

    fetchPrData();
  }, [pr]);

  // Handlers
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = Number(e.target.value);
    const maxValues = { bench: 450, squat: 505, deadlift: 501 };

    if (inputValue > maxValues[exercise]) {
      alert(`The maximum value for ${exercise} is ${maxValues[exercise]} kg.`);
      setValueKg(maxValues[exercise]);
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
      const { error } = await supabase
        .from("prs")
        .update({ exercise, value_kg: valueKg, date })
        .eq("id", pr);

      if (error) throw new Error(`Failed to update PR: ${error.message}`);

      togglePopup(); // Close popup after successful update
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        alert(`Error updating PR: ${err.message}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white p-8 border-2 border-black w-[400px]">
        <h2 className="text-2xl font-semibold mb-4 text-black text-center">
          Edit PR
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
            <button type="button" onClick={togglePopup} className="btn-alt">
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

export default EditPrPopup;
