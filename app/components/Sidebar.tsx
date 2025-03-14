"use client";

import React, { useEffect, useState } from "react";
import {
  Home,
  Plus,
  History,
  UserPen,
  Users,
  BellDot,
  Dumbbell,
  LogOut,
  ToggleLeft,
  ToggleRight,
  Menu,
  X,
} from "lucide-react";
import { Screen } from "../types/screen";
import supabase from "../helper/supabaseClient";

interface SidebarProps {
  signOut: () => void;
  name: string | null;
  currentScreen: string;
  handleScreenChange: (screen: Screen) => void;
  togglePopup: () => void;
  thiefOfJoy: boolean;
  onThiefOfJoyToggle: (newValue: boolean) => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Sidebar = ({
  signOut,
  name = "",
  currentScreen,
  handleScreenChange,
  togglePopup,
  thiefOfJoy,
  onThiefOfJoyToggle,
  isMobileMenuOpen,
  toggleMobileMenu,
}: SidebarProps) => {
  const [isSwitchDisabled, setIsSwitchDisabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) return;

      const { data: notificationsData, error: notificationsError } =
        await supabase
          .from("notifications")
          .select("*")
          .contains("recipients", [userData.user.id]);

      if (notificationsError) return;

      const unreadCount = notificationsData.filter(
        (notif) => !notif.opened_by?.includes(userData.user.id)
      ).length;

      setUnreadCount(unreadCount); // update count only once
    };

    fetchNotifications();
  }, []);

  const handleThiefOfJoyToggle = async () => {
    if (isSwitchDisabled) return;

    setIsSwitchDisabled(true);
    const newValue = !thiefOfJoy;
    onThiefOfJoyToggle(newValue);

    setTimeout(() => {
      setIsSwitchDisabled(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 p-4 w-full md:w-[336px] bg-black h-[88px] md:h-full">
      {/* Mobile Hamburger Icon */}
      <div className="md:hidden flex justify-between items-center p-4 text-white">
        <h1 className="text-2xl font-semibold">PR Tracker</h1>
        <button onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Sidebar for desktop and dropdown for mobile */}
      <div
        className={`${
          isMobileMenuOpen ? "flex" : "hidden"
        } md:flex flex-col justify-between gap-4 w-full h-[calc(100vh-88px)] md:h-full m-auto bg-black p-4 text-white md:relative absolute top-[88px] md:top-0 left-0 right-0 z-[9999]`}
      >
        <div className="flex flex-col gap-2">
          <button
            onClick={togglePopup}
            className="flex flex-row gap-4 px-3 hover:bg-mutedGreen transition-all ease-in-out py-3 items-center text-lg"
          >
            <div className="flex justify-center items-center bg-brandGreen rounded-2xl w-[44px] h-[32px] text-2xl">
              <Plus color="black" size={20} />
            </div>
            <p>New PR</p>
          </button>

          <div className="w-full h-0.5 bg-brandGreen"></div>
          {/* Navigation Buttons */}
          {[
            "home",
            "history",
            "profile",
            "friends",
            "notifications",
            "exercises",
          ].map((screen) => (
            <button
              key={screen}
              onClick={() => {
                handleScreenChange(screen as Screen);
                if (window.innerWidth < 768) toggleMobileMenu();
              }}
              className={`flex flex-row gap-4 px-3 ${
                currentScreen !== screen && "hover:bg-mutedGreen"
              } transition-all ease-in-out py-3 items-center text-lg group ${
                currentScreen === screen ? "bg-brandGreen text-black" : ""
              }`}
            >
              <div
                className={`flex justify-center items-center rounded-2xl w-[44px] h-[32px] text-2xl ${
                  currentScreen !== screen && "group-hover:bg-brandGreen"
                } ${currentScreen === screen ? "bg-black" : "bg-[#2a3013]"}`}
              >
                {screen === "home" && (
                  <Home
                    color={currentScreen === screen ? "#d2f65a" : "black"}
                    size={20}
                  />
                )}
                {screen === "history" && (
                  <History
                    color={currentScreen === screen ? "#d2f65a" : "black"}
                    size={20}
                  />
                )}
                {screen === "profile" && (
                  <UserPen
                    color={currentScreen === screen ? "#d2f65a" : "black"}
                    size={20}
                  />
                )}
                {screen === "friends" && (
                  <Users
                    color={currentScreen === screen ? "#d2f65a" : "black"}
                    size={20}
                  />
                )}
                {screen === "notifications" && (
                  <BellDot
                    color={currentScreen === screen ? "#d2f65a" : "black"}
                    size={20}
                  />
                )}
                {screen === "exercises" && (
                  <Dumbbell
                    color={currentScreen === screen ? "#d2f65a" : "black"}
                    size={20}
                  />
                )}
              </div>
              <p>{screen.charAt(0).toUpperCase() + screen.slice(1)}</p>
              {screen === "notifications" && unreadCount > 0 && (
                <p className="text-sm ml-8 h-4 w-4 flex items-center justify-center bg-brandGreen rounded-full text-black">
                  {unreadCount}
                </p>
              )}
            </button>
          ))}

          {/* Thief of Joy Toggle */}
          <button
            onClick={handleThiefOfJoyToggle}
            disabled={isSwitchDisabled}
            className="flex flex-row gap-4 px-3 hover:bg-mutedGreen transition-all ease-in-out py-3 items-center text-lg"
          >
            <div className="flex justify-center items-center w-[44px] h-[32px] text-2xl">
              {thiefOfJoy ? (
                <ToggleRight color="#01B574" size={48} />
              ) : (
                <ToggleLeft color="#E31A1A" size={48} />
              )}
            </div>
            <p>Thief of Joy</p>
          </button>
        </div>

        <div className="w-full flex flex-col gap-2">
          {/* Sign Out Button */}
          <p className="text-center mt-4">
            Signed in as: <b>{name}</b>
          </p>
          <button
            onClick={signOut}
            className="flex flex-row gap-4 px-3 hover:bg-mutedGreen transition-all ease-in-out py-3 items-center text-lg w-full"
          >
            <div className="flex justify-center items-center bg-brandGreen rounded-2xl w-[44px] h-[32px] text-sm">
              <LogOut color="black" size={20} />
            </div>
            <p>Sign Out</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
