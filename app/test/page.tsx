"use client"; // Mark this component as a Client Component

import { Montserrat } from "next/font/google";
import Onboarding from "../components/Onboarding";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export default function Home() {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-[#fff] ${montserrat.className}`}
    >
      <Onboarding onComplete={() => console.log()} />
    </div>
  );
}
