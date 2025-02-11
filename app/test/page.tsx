"use client";

import React from "react";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

const TestPage = () => {
  const handleSubmit = () => {
    console.log("submit");
  };
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen min-w-full${montserrat.className}`}
    >
      <div className="bg-[#060B26] p-4 text-white rounded-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">Onboarding</h1>
        <form onSubmit={handleSubmit} className="w-80 md:w-96">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Name"
            className="w-full p-2 mb-4  rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Height in cm</label>
          <input
            type="number"
            placeholder="Height (cm)"
            className="w-full p-2 mb-4  rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Weight in kg</label>
          <input
            type="number"
            placeholder="Weight (kg)"
            className="w-full p-2 mb-4  rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Birthday</label>
          <input
            type="date"
            placeholder="Birthday"
            className="w-full p-2 mb-4  rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Bench Press PR</label>
          <input
            type="number"
            placeholder="Bench Press PR (kg)"
            className="w-full p-2 mb-4  rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Squat PR</label>
          <input
            type="number"
            placeholder="Squat PR (kg)"
            className="w-full p-2 mb-4  rounded bg-[#1A1F37] text-white"
            required
          />
          <label>Deadlift PR</label>
          <input
            type="number"
            placeholder="Deadlift PR (kg)"
            className="w-full p-2 mb-4  rounded bg-[#1A1F37] text-white"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestPage;
