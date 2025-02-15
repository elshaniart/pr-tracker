"use client";

import React, { useState } from "react";
import supabase from "../../helper/supabaseClient";

interface Profile {
  id: string;
  height_cm: number | null;
  weight_kg: number | null;
  birthday: string | null;
  bench_press_pr: number | null;
  squat_pr: number | null;
  deadlift_pr: number | null;
  onboarded: boolean;
  name: string | null;
  thiefofjoy: boolean;
}

interface DashboardProfileScreenProps {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  isMobileMenuOpen: boolean;
}

const DashboardProfileScreen = ({
  profile,
  setProfile,
  isMobileMenuOpen,
}: DashboardProfileScreenProps) => {
  const [name, setName] = useState(profile.name || "");
  const [heightCm, setHeightCm] = useState<number | null>(profile.height_cm);
  const [weightKg, setWeightKg] = useState<number | null>(profile.weight_kg);
  const [birthday, setBirthday] = useState(profile.birthday || "");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  console.log(isMobileMenuOpen);

  const handleSave = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          height_cm: heightCm,
          weight_kg: weightKg,
          birthday,
        })
        .eq("id", userData.user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Update the profile state in the parent component
      setProfile({
        ...profile,
        name,
        height_cm: heightCm,
        weight_kg: weightKg,
        birthday,
      });

      setIsEditing(false);
      setError("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div className="w-full h-full text-black py-8 flex flex-col gap-8 px-4 md:pr-0">
      <h2 className="text-3xl font-semibold mt-16 md:mt-0">Profile</h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col gap-4 max-w-xl">
        <div className={`${false && "hidden"} w-full`}>
          <label className="block font-medium mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 text-black border-2 border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px]"
            disabled={!isEditing}
          />
        </div>
        <div className={`${false && "hidden"} w-full`}>
          <label className="block font-medium mb-2">Height (cm)</label>
          <input
            type="number"
            value={heightCm ?? ""}
            onChange={(e) => setHeightCm(Math.min(Number(e.target.value), 240))}
            className="w-full p-2 text-black border-2 border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px]"
            disabled={!isEditing}
          />
        </div>
        <div className={`${false && "hidden"} w-full`}>
          <label className="block font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weightKg ?? ""}
            onChange={(e) => setWeightKg(Math.min(Number(e.target.value), 500))}
            className="w-full p-2 text-black border-2 border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px]"
            disabled={!isEditing}
          />
        </div>
        <div className={`${false && "hidden"} w-full`}>
          <label className="block font-medium mb-2">Birthday</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full p-2 text-black border-2 border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px]"
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="flex gap-4">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-black hover:bg-brandGreen ease-in-out transition-all text-white hover:text-black h-[48px]"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-black border-black border-2 hover:border-brandGreen hover:border-4 hover:px-3.5 ease-in-out transition-all h-[48px]"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 h-[48px] text-black border-black border-2 hover:border-brandGreen hover:border-4 hover:px-3.5 ease-in-out transition-all font-medium"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardProfileScreen;
