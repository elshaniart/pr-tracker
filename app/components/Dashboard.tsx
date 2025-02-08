"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../helper/supabaseClient";
import { signOut } from "../helper/authHelpers";
import Onboarding from "./Onboarding";
import Sidebar from "./Sidebar";
import DashboardHomeScreen from "./dashboard-screens/home";
import DashboardProfileScreen from "./dashboard-screens/profile";
import DashboardHistoryScreen from "./dashboard-screens/history";
import Popup from "./Popup"; // New Popup component

type Profile = {
  id: string;
  height_cm: number | null;
  weight_kg: number | null;
  birthday: string | null;
  bench_press_pr: number | null;
  squat_pr: number | null;
  deadlift_pr: number | null;
  onboarded: boolean;
  name: string | null;
};

type Screen = "home" | "profile" | "history" | "exercises";

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility
  const router = useRouter();

  const handleScreenChange = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup); // Toggle popup visibility
  };

  useEffect(() => {
    const fetchProfile = async () => {
      // Step 1: Get the current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (!userData?.user || userError) {
        router.push("/log-in");
        return;
      }

      // Step 2: Fetch the user's profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .maybeSingle(); // ✅ Prevents errors when no profile exists

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      // Step 3: If no profile exists, create one
      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .upsert([
            {
              id: userData.user.id,
              height_cm: null,
              weight_kg: null,
              birthday: null,
              bench_press_pr: null,
              squat_pr: null,
              deadlift_pr: null,
              onboarded: false, // Default to false
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error("Error creating profile:", createError);
          return;
        }

        setProfile(newProfile);
      } else {
        setProfile(profileData);
        console.log(profileData);
      }
    };

    fetchProfile();
  }, [router]);

  if (!profile) {
    return <p>Loading...</p>;
  }

  if (!profile.onboarded) {
    return <Onboarding />;
  }

  return (
    <div className="flex flex-row items-center min-h- w-screen h-screen">
      <Sidebar
        signOut={signOut}
        name={profile?.name}
        currentScreen={currentScreen}
        handleScreenChange={handleScreenChange}
        togglePopup={togglePopup} // Pass togglePopup to Sidebar
      />
      {currentScreen === "home" ? (
        <DashboardHomeScreen
          bench_press_pr={profile?.bench_press_pr}
          deadlift_pr={profile?.deadlift_pr}
          height_cm={profile?.height_cm}
          squat_pr={profile?.squat_pr}
          weight_kg={profile?.weight_kg}
        />
      ) : currentScreen === "profile" ? (
        <DashboardProfileScreen />
      ) : (
        <DashboardHistoryScreen />
      )}
      {showPopup && <Popup onClose={togglePopup} userId={profile.id} />}{" "}
      {/* Render Popup */}
    </div>
  );
}
