"use client"; // Mark this component as a Client Component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "./helper/supabaseClient";
import { User } from "@supabase/supabase-js";
import { signInWithGoogle } from "./helper/authHelpers"; // Import the signInWithGoogle function
import Dashboard from "./components/Dashboard";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export default function Home() {
  const [user, setUser] = useState<User | null>(null); // State to store the user's authentication status
  const router = useRouter(); // Next.js router for navigation

  // Check if the user is signed in
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error);
      }

      if (data?.session) {
        setUser(data.session.user);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);
  // Redirect to login page
  const handleLogin = () => {
    router.push("/log-in");
  };

  // Redirect to register page
  const handleRegister = () => {
    router.push("/register");
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push("/"); // Redirect to the homepage after successful sign-in
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-white ${montserrat.className}`}
    >
      {user ? (
        // If the user is signed in, show the Dashboard
        <Dashboard />
      ) : (
        // If the user is not signed in, show the sign-in and register buttons
        <div className="text-center bg-white p-8 border-2 border-black text-black">
          <h1 className="text-2xl font-bold mb-4">Welcome to PR Tracker</h1>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row gap-4">
              <button onClick={handleLogin} className="btn">
                Sign In
              </button>
              <button onClick={handleGoogleSignIn} className="btn-alt">
                Sign In with Google
              </button>
            </div>
            <button
              onClick={handleRegister}
              className="text-black hover:underline"
            >
              Don&apos;t have an account? Register
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
