import React, { useState } from "react";
import {
  Home,
  Plus,
  History,
  UserPen,
  LogOut,
  ToggleLeft,
  ToggleRight,
  Menu,
  X,
} from "lucide-react";

// Define screen types
type Screen = "home" | "profile" | "history" | "exercises";

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
    <div className="fixed inset-0 p-4 w-[280px] md:w-[336px] bg-black h-[88px] md:h-full">
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
        } md:flex flex-col gap-8 w-full h-screen md:h-full max-w-[304px] m-auto rounded-2xl px-4 py-8 text-white md:relative absolute top-[88px] md:top-0 left-0 right-0 z-[9999]`}
      >
        <button
          onClick={togglePopup}
          className="flex flex-row gap-4 px-2 rounded-2xl hover:bg-[#3d4257] transition-all ease-in-out py-2 items-center text-lg"
        >
          <div className="flex justify-center items-center bg-brandGreen rounded-2xl w-[44px] h-[32px] text-2xl">
            <Plus color="black" size={20} />
          </div>
          <p>New PR</p>
        </button>

        <div className="w-full h-0.5 bg-brandGreen"></div>
        {/* Navigation Buttons */}
        {["home", "history", "profile"].map((screen) => (
          <button
            key={screen}
            onClick={() => {
              handleScreenChange(screen as Screen);
              toggleMobileMenu();
            }}
            className={`flex flex-row gap-4 px-2 rounded-2xl hover:bg-[#1A1F37] transition-all ease-in-out py-2 items-center text-lg group ${
              currentScreen === screen ? "bg-[#1A1F37]" : ""
            }`}
          >
            <div
              className={`flex justify-center items-center rounded-2xl w-[44px] h-[32px] text-2xl group-hover:bg-brandGreen ${
                currentScreen === screen ? "bg-brandGreen" : "bg-[#2a3013]"
              }`}
            >
              {screen === "home" && <Home color="black" size={20} />}
              {screen === "history" && <History color="black" size={20} />}
              {screen === "profile" && <UserPen color="black" size={20} />}
            </div>
            <p>{screen.charAt(0).toUpperCase() + screen.slice(1)}</p>
          </button>
        ))}

        {/* Thief of Joy Toggle */}
        <button
          onClick={handleThiefOfJoyToggle}
          disabled={isSwitchDisabled}
          className="flex flex-row gap-4 px-2 rounded-2xl hover:bg-[#1A1F37] transition-all ease-in-out py-2 items-center text-lg"
        >
          <div className="flex justify-center items-center rounded-2xl w-[44px] h-[32px] text-2xl">
            {thiefOfJoy ? (
              <ToggleRight color="#01B574" size={32} />
            ) : (
              <ToggleLeft color="#E31A1A" size={32} />
            )}
          </div>
          <p>Thief of Joy</p>
        </button>
        <div className="w-full flex flex-col gap-2 mt-0 md:mt-48">
          {/* Sign Out Button */}
          <p className="text-center mt-4">
            Signed in as: <b>{name}</b>
          </p>
          <button
            onClick={signOut}
            className="flex flex-row gap-4 px-2 rounded-2xl hover:bg-[#1A1F37] transition-all ease-in-out py-2 items-center text-lg w-full"
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
