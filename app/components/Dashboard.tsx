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
import DashboardFriendsScreen from "./dashboard-screens/friends"; // Import Friends Screen
import Popup from "./Popup";
import { Screen } from "../types/screen";
import { Profile } from "../types/profile";

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [showPopup, setShowPopup] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleScreenChange = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
    window.location.reload();
  };

  const handleThiefOfJoyToggle = async (newValue: boolean) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ thiefofjoy: newValue })
        .eq("id", profile.id);

      if (error) {
        throw new Error(error.message);
      }

      setProfile({ ...profile, thiefofjoy: newValue });
    } catch (error) {
      console.error("Error updating thiefOfJoy:", error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (!userData?.user || userError) {
        router.push("/log-in");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

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
              onboarded: false,
              thiefofjoy: false,
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
      }
    };

    fetchProfile();
  }, [router]);

  if (!profile) {
    return <p>Loading...</p>;
  }

  if (!profile.onboarded && !isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center max-w-screen h-screen overflow-x-hidden lg:pl-[336px] text-white w-full">
      <Sidebar
        signOut={signOut}
        name={profile?.name}
        currentScreen={currentScreen}
        handleScreenChange={handleScreenChange}
        togglePopup={togglePopup}
        thiefOfJoy={profile?.thiefofjoy}
        onThiefOfJoyToggle={handleThiefOfJoyToggle}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />
      {currentScreen === "home" ? (
        <DashboardHomeScreen
          bench_press_pr={profile?.bench_press_pr || 0}
          deadlift_pr={profile?.deadlift_pr || 0}
          height_cm={profile?.height_cm}
          squat_pr={profile?.squat_pr || 0}
          weight_kg={profile?.weight_kg}
          profile={profile}
          isMobileMenuOpen={isMobileMenuOpen}
        />
      ) : currentScreen === "profile" ? (
        <DashboardProfileScreen
          profile={profile}
          setProfile={handleProfileUpdate}
          isMobileMenuOpen={isMobileMenuOpen}
        />
      ) : currentScreen === "history" ? (
        <DashboardHistoryScreen />
      ) : currentScreen === "friends" ? (
        <DashboardFriendsScreen />
      ) : null}
      {showPopup && <Popup onClose={togglePopup} userId={profile?.id} />}
    </div>
  );
}
