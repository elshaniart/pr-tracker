import React from "react";
import plusIcon from "../icons/plusIcon.svg";

interface SidebarProps {
  signOut: () => void;
  name: string | null;
}

const Sidebar = ({ signOut, name = "" }: SidebarProps) => {
  return (
    <div className="h-full p-[32px] w-[328px]">
      <div className="w-full h-full rounded-2xl bg-[#060B26] px-4 py-8 flex flex-col justify-between">
        <div className="flex flex-col gap-8 w-full text-white">
          <h1 className="text-2xl text-center">PR Tracker</h1>
          <div className="flex flex-col w-full">
            <button className="flex flex-row gap-4 px-2 rounded-2xl bg-[#1A1F37] hover:bg-[#3d4257] transition-all ease-in-out py-2 items-center text-lg">
              <div className="flex justify-center items-center bg-[#0075FF] rounded-2xl w-[44px] h-[32px] text-2xl">
                +
              </div>
              <p>New PR</p>
            </button>
            <button className="mt-8 flex flex-row gap-4 px-2 rounded-2xl hover:bg-[#1A1F37] transition-all ease-in-out py-2 items-center text-lg group">
              <div className="flex justify-center items-center bg-[#1A1F37] rounded-2xl w-[44px] h-[32px] text-2xl group-hover:bg-[#0075FF]">
                +
              </div>
              <p>Home</p>
            </button>
            <button className="flex flex-row gap-4 px-2 rounded-2xl hover:bg-[#1A1F37] transition-all ease-in-out py-2 items-center text-lg group">
              <div className="flex justify-center items-center bg-[#1A1F37] rounded-2xl w-[44px] h-[32px] text-2xl group-hover:bg-[#0075FF]">
                +
              </div>
              <p>Profile</p>
            </button>
            <button className="flex flex-row gap-4 px-2 rounded-2xl hover:bg-[#1A1F37] transition-all ease-in-out py-2 items-center text-lg group">
              <div className="flex justify-center items-center bg-[#1A1F37] rounded-2xl w-[44px] h-[32px] text-2xl group-hover:bg-[#0075FF]">
                +
              </div>
              <p>History</p>
            </button>
            <button className="flex flex-row gap-4 px-2 rounded-2xl hover:bg-[#1A1F37] transition-all ease-in-out py-2 items-center text-lg group">
              <div className="flex justify-center items-center bg-[#1A1F37] rounded-2xl w-[44px] h-[32px] text-2xl group-hover:bg-[#0075FF]">
                +
              </div>
              <p>Exercises</p>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-8 text-white">
          <p className="text-center">Signed in as: {name}</p>
          <button
            onClick={signOut}
            className="flex flex-row gap-4 px-2 rounded-2xl bg-[#1A1F37] hover:bg-[#3d4257] transition-all ease-in-out py-2 items-center text-lg"
          >
            <div className="flex justify-center items-center bg-[#0075FF] rounded-2xl w-[44px] h-[32px] text-sm">
              X
            </div>
            <p>Sign Out</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
