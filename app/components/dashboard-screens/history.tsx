"use client";

import React, { useEffect, useState } from "react";
import supabase from "../../helper/supabaseClient";

interface PR {
  id: string;
  exercise: string;
  value_kg: number;
  date: string;
}

const DashboardHistoryScreen = () => {
  const [prs, setPRs] = useState<PR[]>([]); // State to store PRs
  const [filteredPRs, setFilteredPRs] = useState<PR[]>([]); // State for filtered PRs
  const [selectedExercise, setSelectedExercise] = useState<string>("all"); // State for selected exercise filter

  // Fetch all PRs from the database
  useEffect(() => {
    const fetchPRs = async () => {
      const { data, error } = await supabase
        .from("prs")
        .select("*")
        .order("date", { ascending: false }); // Sort by date (newest first)

      if (error) {
        console.error("Error fetching PRs:", error);
      } else {
        setPRs(data);
        setFilteredPRs(data); // Initialize filtered PRs with all PRs
      }
    };

    fetchPRs();
  }, []);

  // Filter PRs based on selected exercise
  useEffect(() => {
    if (selectedExercise === "all") {
      setFilteredPRs(prs); // Show all PRs
    } else {
      const filtered = prs.filter((pr) => pr.exercise === selectedExercise);
      setFilteredPRs(filtered); // Show PRs for the selected exercise
    }
  }, [selectedExercise, prs]);

  return (
    <div className="w-full h-full text-white py-8 flex flex-col gap-8">
      <h2 className="text-2xl">PR History</h2>

      {/* Filter by Exercise */}
      <div className="flex gap-4">
        <label className="text-sm font-medium text-gray-300">
          Filter by Exercise:
        </label>
        <select
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className="p-2 rounded-lg bg-[#1A1F37] text-white"
        >
          <option value="all">All</option>
          <option value="bench">Bench Press</option>
          <option value="squat">Squat</option>
          <option value="deadlift">Deadlift</option>
        </select>
      </div>

      {/* PR Table */}
      <div className="overflow-x-auto">
        <table className="w-[88%] text-left border-collapse">
          <thead>
            <tr className="bg-[#1A1F37]">
              <th className="p-4">Exercise</th>
              <th className="p-4">Weight (kg)</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPRs.map((pr) => (
              <tr
                key={pr.id}
                className="border-b border-[#1A1F37] bg-[#212641]"
              >
                <td className="p-4 capitalize">{pr.exercise}</td>
                <td className="p-4">{pr.value_kg}</td>
                <td className="p-4">
                  {new Date(pr.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardHistoryScreen;
