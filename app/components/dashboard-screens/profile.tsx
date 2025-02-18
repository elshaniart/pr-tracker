"use client";

import React, { useState } from "react";
import supabase from "../../helper/supabaseClient";
import { Profile } from "@/app/types/profile";

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
  const [username, setUsername] = useState(profile.username || "");
  const [heightCm, setHeightCm] = useState<number | null>(profile.height_cm);
  const [weightKg, setWeightKg] = useState<number | null>(profile.weight_kg);
  const [birthday, setBirthday] = useState(profile.birthday || "");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Function to check if the username is taken
  const checkUsernameAvailability = async (username: string) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("User not authenticated");
      return false;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", userData.user.id); // Exclude current user's ID

    if (error) {
      setError("An error occurred while checking the username");
      return false;
    }

    if (data && data.length > 0) {
      setError(
        "This username is already taken. Please choose a different one."
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    try {
      // Check if the username is unique
      const isUsernameUnique = await checkUsernameAvailability(username);
      if (!isUsernameUnique) return;

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          username, // Include username in the update
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
        username, // Update username in the profile
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
    <div className="w-full h-full text-black py-8 flex flex-col gap-4 px-4 md:pr-0">
      <h2 className="text-3xl font-semibold mt-16 md:mt-0">Profile</h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col gap-4 max-w-xl">
        <div className="w-full">
          <label className="block font-medium mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] ${
              isMobileMenuOpen && "hidden md:flex"
            }`}
            disabled={!isEditing}
          />
        </div>

        {/* New input field for username */}
        <div className="w-full">
          <label className="block font-medium mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] ${
              isMobileMenuOpen && "hidden md:flex"
            }`}
            disabled={!isEditing}
          />
        </div>

        <div className="w-full">
          <label className="block font-medium mb-2">Height (cm)</label>
          <input
            type="number"
            value={heightCm ?? ""}
            onChange={(e) => setHeightCm(Math.min(Number(e.target.value), 240))}
            className={`w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] ${
              isMobileMenuOpen && "hidden md:flex"
            }`}
            disabled={!isEditing}
          />
        </div>
        <div className="w-full">
          <label className="block font-medium mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weightKg ?? ""}
            onChange={(e) => setWeightKg(Math.min(Number(e.target.value), 500))}
            className={`w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] ${
              isMobileMenuOpen && "hidden md:flex"
            }`}
            disabled={!isEditing}
          />
        </div>
        <div className="w-full">
          <label className="block font-medium mb-2">Birthday</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className={`w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] ${
              isMobileMenuOpen && "hidden md:flex"
            }`}
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="flex gap-4">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="btn">
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="btn-alt">
              Cancel
            </button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} className="btn">
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardProfileScreen;
