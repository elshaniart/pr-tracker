"use client";

import React, { useEffect, useState } from "react";
import supabase from "../../helper/supabaseClient";
import LineChart from "../LineChart";
import { averageLifts } from "@/app/constants/averageLifts";
import { Profile } from "@/app/types/profile";

interface DashboardHomeScreenProps {
  bench_press_pr: number;
  deadlift_pr: number;
  squat_pr: number;
  height_cm: number | null;
  weight_kg: number | null;
  profile: Profile;
  isMobileMenuOpen: boolean;
}

const DashboardHomeScreen = ({
  bench_press_pr = 0,
  deadlift_pr = 0,
  squat_pr = 0,
  height_cm = 0,
  weight_kg = 0,
  profile,
  isMobileMenuOpen,
}: DashboardHomeScreenProps) => {
  const [initialPRs, setInitialPRs] = useState<{ [key: string]: number }>({});
  const [selectedExercise, setSelectedExercise] = useState("bench"); // State for selected exercise
  const [prData, setPRData] = useState<{ date: string; value_kg: number }[]>(
    []
  ); // State for PR data
  const [friends, setFriends] = useState<
    {
      id: string;
      username: string;
      bench: number;
      squat: number;
      deadlift: number;
    }[]
  >([]); // State for friends list
  const [selectedFriend, setSelectedFriend] = useState<string>(""); // State for selected friend
  const [activeTab, setActiveTab] = useState<
    "total" | "bench" | "squat" | "deadlift"
  >("total");

  const getBMIClassification = (bmi: number) => {
    if (bmi < 16.0)
      return { category: "Severely Underweight", color: "text-[#E31A1A]" };
    if (bmi < 17.0)
      return { category: "Moderately Underweight", color: "text-[#F6AD55]" };
    if (bmi < 18.5)
      return { category: "Mildly Underweight", color: "text-[#F6AD55]" };
    if (bmi < 25.0) return { category: "Normal", color: "text-[#01B574]" };
    if (bmi < 30.0) return { category: "Overweight", color: "text-[#F6AD55]" };
    if (bmi < 35.0)
      return { category: "Obese (Class 1)", color: "text-[#E31A1A]" };
    if (bmi < 40.0)
      return { category: "Obese (Class 2)", color: "text-[#E31A1A]" };
    return {
      category: "Obese (Class 3 - Morbid Obesity)",
      color: "text-[#E31A1A]",
    };
  };

  const calculateBMI = (weight_kg: number | null, height_cm: number | null) => {
    if (!weight_kg || !height_cm) return null;
    const height_m = height_cm / 100;
    return parseFloat((weight_kg / (height_m * height_m)).toFixed(1));
  };

  const bmi = calculateBMI(weight_kg, height_cm);
  const { category, color } = bmi
    ? getBMIClassification(bmi)
    : { category: "N/A", color: "text-black" };

  useEffect(() => {
    const fetchInitialPRs = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (!userData?.user || userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      // Fetch all PRs for the current user
      const { data, error } = await supabase
        .from("prs")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching PRs:", error);
        return;
      }

      // Extract the first PR for each exercise
      const firstPRs: { [key: string]: number } = {};
      data.forEach((pr) => {
        if (!firstPRs[pr.exercise]) {
          firstPRs[pr.exercise] = pr.value_kg;
        }
      });

      setInitialPRs(firstPRs);
    };

    fetchInitialPRs();
  }, []);

  // Fetch PR data for the selected exercise
  useEffect(() => {
    const fetchPRData = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (!userData?.user || userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      // Fetch PRs for the selected exercise
      const { data, error } = await supabase
        .from("prs")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("exercise", selectedExercise)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching PR data:", error);
        return;
      }

      // Format data for the chart
      const formattedData = data.map((pr) => ({
        date: new Date(pr.date).toLocaleDateString(), // Format date
        value_kg: pr.value_kg,
      }));

      setPRData(formattedData);
    };

    fetchPRData();
  }, [selectedExercise]);

  // Fetch the user's friends
  useEffect(() => {
    const fetchFriends = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (!userData?.user || userError) {
        console.error("Error fetching user:", userError);
        return;
      }

      // Fetch the user's profile to get the friends list
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("friends")
        .eq("id", userData.user.id)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      // Check if friends is an array, if not, default to empty array
      const friendIds = Array.isArray(profileData.friends)
        ? profileData.friends
        : [];

      // Fetch the usernames of the friends
      if (friendIds.length > 0) {
        const { data: friendsData, error: friendsError } = await supabase
          .from("profiles")
          .select("id, username, bench_press_pr, squat_pr, deadlift_pr")
          .in("id", friendIds);

        if (friendsError) {
          console.error("Error fetching friends:", friendsError);
          return;
        }

        const formattedFriends = friendsData.map((friend) => ({
          id: friend.id,
          username: friend.username,
          bench: +friend.bench_press_pr || 0,
          squat: +friend.squat_pr || 0,
          deadlift: +friend.deadlift_pr || 0,
        }));

        setFriends(formattedFriends);
      }
    };

    fetchFriends();
  }, []);

  const calculateScore = (user: {
    bench: number;
    squat: number;
    deadlift: number;
  }) => {
    switch (activeTab) {
      case "total":
        return user.bench + user.squat + user.deadlift;
      case "bench":
        return user.bench;
      case "squat":
        return user.squat;
      case "deadlift":
        return user.deadlift;
      default:
        return 0;
    }
  };

  const calculatePercentageIncrease = (
    initial: number | undefined,
    current: number
  ) => {
    if (!initial || initial === 0) return null;
    const increase = ((current - initial) / initial) * 100;
    return increase.toFixed(1);
  };

  const allParticipants = [
    ...friends,
    {
      id: profile?.id || "user",
      username: "You",
      bench: bench_press_pr,
      squat: squat_pr,
      deadlift: deadlift_pr,
    },
  ];

  const sortedParticipants = allParticipants.sort(
    (a, b) =>
      calculateScore({
        bench: b.bench ?? 0,
        squat: b.squat ?? 0,
        deadlift: b.deadlift ?? 0,
      }) -
      calculateScore({
        bench: a.bench ?? 0,
        squat: a.squat ?? 0,
        deadlift: a.deadlift ?? 0,
      })
  );

  return (
    <div className="w-full h-full max-w-screen text-black py-8 flex flex-col gap-4 px-4">
      <div className="flex flex-col gap-2 pt-16 md:pt-0 px-4 md:px-0 w-screen lg:w-auto">
        <div className="flex flex-row gap-2">
          <div
            className={`${
              isMobileMenuOpen && "hidden md:flex"
            } flex flex-col items-center gap-1 w-[352px] h-[352px] border-2 border-black p-4`}
          >
            <div className="flex gap-1 mb-4">
              {["total", "bench", "squat", "deadlift"].map((tab) => (
                <button
                  key={tab}
                  className={`border-b-2 p-2 border-black hover:border-brandGreen transition-all ease-in-out ${
                    activeTab === tab ? "border-brandGreen" : ""
                  }`}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="w-full h-full overflow-y-auto">
              {sortedParticipants.map((participant) => {
                const score = calculateScore(participant);
                const isUser = participant.id === profile?.id;

                return (
                  <div
                    key={participant.id}
                    className={`flex justify-between p-4 border-b-2 ${
                      isUser ? "bg-brandGreen/20" : "bg-white"
                    }`}
                  >
                    <p className="font-semibold">{participant.username}</p>
                    <p>{score} kg</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className={`${
              isMobileMenuOpen && "hidden md:flex"
            } flex flex-col gap-2 overflow-x-scroll xl:overflow-x-hidden`}
          >
            {[
              { name: "Bench Press", current: bench_press_pr, key: "bench" },
              { name: "Deadlift", current: deadlift_pr, key: "deadlift" },
              { name: "Squat", current: squat_pr, key: "squat" },
            ].map(({ name, current, key }) => {
              const initialPR = initialPRs[key];
              const percentageIncrease = calculatePercentageIncrease(
                initialPR,
                current || 0
              );
              const averageScore = averageLifts[key];

              return (
                <div
                  key={key}
                  className="h-[112px] justify-center min-w-[176px] text-black md:w-[256px] bg-white border-2 border-black hover:border-4 hover:border-brandGreen hover:p-2.5 transition-all ease-in-out p-3 gap-1 flex flex-col"
                >
                  <p className="text-sm leading-3">{name}</p>
                  <div className="flex flex-row gap-2 items-center font-semibold text-sm">
                    <p className="text-xl font-semibold">{current} kg</p>
                    {percentageIncrease !== null && (
                      <p className="text-[#01B574]">(+{percentageIncrease}%)</p>
                    )}
                  </div>
                  <div
                    className={`${
                      !profile?.thiefofjoy ? "hidden" : "flex"
                    } flex-row gap-2 items-center font-semibold text-sm`}
                  >
                    <p>Average: </p>
                    <p
                      className={` ${
                        current < averageScore
                          ? "text-[#E31A1A]"
                          : current == averageScore
                          ? "text-[#F6AD55]"
                          : "text-[#01B574]"
                      }`}
                    >
                      {averageScore}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 md:px-0 w-screen lg:w-auto">
        <h2 className="text-3xl font-semibold">Personal Info</h2>
        <div
          className={`${
            isMobileMenuOpen && "hidden md:flex"
          } flex flex-row gap-2 overflow-x-scroll xl:overflow-x-hidden`}
        >
          <div className="h-[112px] justify-center min-w-[176px] md:w-[256px] text-black bg-white border-2 border-black hover:border-4 hover:border-brandGreen hover:p-2.5 transition-all ease-in-out p-3 gap-1 flex flex-col">
            <p className="text-sm leading-3">Weight</p>
            <p className="text-xl font-semibold">{weight_kg} kg</p>
          </div>
          <div className="h-[112px] justify-center min-w-[176px] md:w-[256px] text-black bg-white border-2 border-black hover:border-4 hover:border-brandGreen hover:p-2.5 transition-all ease-in-out p-3 gap-1 flex flex-col">
            <p className="text-sm leading-3">Height</p>
            <p className="text-xl font-semibold">
              {height_cm ? (height_cm / 100).toFixed(2) + "m" : "N/A"}
            </p>
          </div>
          <div className="h-[112px] justify-center min-w-[176px] md:w-[256px] text-black bg-white border-2 border-black hover:border-4 hover:border-brandGreen hover:p-2.5 transition-all ease-in-out p-3 gap-1 flex flex-col">
            <p className="text-sm leading-3">BMI</p>
            <p className="text-xl font-semibold">
              {weight_kg && height_cm
                ? (weight_kg / (height_cm / 100) ** 2).toFixed(1)
                : "N/A"}
            </p>
            <p
              className={`text-sm font-semibold ${color} ${
                !profile?.thiefofjoy ? "hidden" : "flex"
              }`}
            >
              {category}
            </p>
          </div>
        </div>
      </div>

      {/* Exercise Selector and Line Chart */}
      <div className="hidden md:flex text-black flex-col gap-2 px-4 md:px-0">
        <div className="flex gap-2 items-center">
          <label className="text-lg md:text-xl font-semibold">
            Select Exercise:
          </label>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="p-2 bg-white focus:outline-none text-black border-2 hover:border-4 hover:border-brandGreen transition-all ease-in-out hover:p-1.5 border-black h-[48px] flex items-center"
          >
            <option value="bench">Bench Press</option>
            <option value="squat">Squat</option>
            <option value="deadlift">Deadlift</option>
          </select>

          {/* Friend Selector Dropdown */}
          <label className="text-lg md:text-xl font-semibold ml-4">
            Select Friend:
          </label>
          <select
            value={selectedFriend}
            onChange={(e) => setSelectedFriend(e.target.value)}
            className="p-2 bg-white focus:outline-none text-black border-2 hover:border-4 hover:border-brandGreen transition-all ease-in-out hover:p-1.5 border-black h-[48px] flex items-center"
          >
            <option value="">Select a friend</option>
            {friends.map((friend) => (
              <option key={friend.id} value={friend.id}>
                {friend.username}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden md:flex w-full pb-12 pt-8">
          <LineChart
            prData={prData}
            thiefOfJoy={profile?.thiefofjoy || false}
            exerciseType={selectedExercise}
            userId={profile?.id}
            selectedFriend={selectedFriend}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardHomeScreen;
