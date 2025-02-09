"use client";

import React, { useEffect, useState } from "react";
import supabase from "../../helper/supabaseClient";
import { Trash2 } from "lucide-react";

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
  const [earliestPRs, setEarliestPRs] = useState<{ [key: string]: PR | null }>({
    bench: null,
    squat: null,
    deadlift: null,
  });

  // Fetch PRs for the currently logged-in user
  useEffect(() => {
    const fetchPRs = async () => {
      // Get the current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (!userData?.user || userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      // Fetch PRs for the current user
      const { data, error } = await supabase
        .from("prs")
        .select("*")
        .eq("user_id", userData.user.id) // Filter by the user's ID
        .order("date", { ascending: false }); // Sort by date (newest first)

      if (error) {
        console.error("Error fetching PRs:", error);
      } else {
        setPRs(data);
        setFilteredPRs(data); // Initialize filtered PRs with all PRs

        // Set the earliest PRs for each exercise (the first one in the list)
        const earliest: { [key: string]: PR | null } = {
          bench: data.filter((pr) => pr.exercise === "bench").pop() || null,
          squat: data.filter((pr) => pr.exercise === "squat").pop() || null,
          deadlift:
            data.filter((pr) => pr.exercise === "deadlift").pop() || null,
        };
        setEarliestPRs(earliest);
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

  // Delete PR
  const handleDelete = async (prId: string, exercise: string) => {
    if (earliestPRs[exercise]?.id === prId) {
      alert(`You cannot delete the earliest ${exercise} PR.`);
      return;
    }

    const { error } = await supabase.from("prs").delete().eq("id", prId);

    if (error) {
      console.error("Error deleting PR:", error);
    } else {
      // Remove deleted PR from state
      setPRs(prs.filter((pr) => pr.id !== prId));
      setFilteredPRs(filteredPRs.filter((pr) => pr.id !== prId));
    }
  };

  return (
    <div className="w-full h-full text-white py-8 flex flex-col gap-8">
      <h2 className="text-2xl font-semibold">PR History</h2>

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
              <th className="p-4">Actions</th>
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
                <td className="p-4">
                  {/* Show the delete button unless it's the earliest PR for this exercise */}
                  {earliestPRs[pr.exercise]?.id !== pr.id && (
                    <button
                      onClick={() => handleDelete(pr.id, pr.exercise)}
                      className="flex items-center"
                    >
                      <Trash2 color="#E31A1A" size={24} />
                    </button>
                  )}
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
