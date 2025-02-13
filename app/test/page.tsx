"use client"; // Mark this component as a Client Component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

import { Montserrat } from "next/font/google";
import Dashboard from "../components/Dashboard";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export default function Home() {
  const [user, setUser] = useState<User | null>(null); // State to store the user's authentication status
  const router = useRouter(); // Next.js router for navigation

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-[#fff] ${montserrat.className}`}
    >
      <Dashboard />
    </div>
  );
}
