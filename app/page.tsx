"use client"; // Mark this component as a Client Component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "./helper/supabaseClient";
import { User } from "@supabase/supabase-js";
import { signInWithGoogle } from "./helper/authHelpers"; // Import the signInWithGoogle function
import Dashboard from "./components/Dashboard";

export default function Home() {
  const [user, setUser] = useState<User | null>(null); // State to store the user's authentication status
  const router = useRouter(); // Next.js router for navigation

  // Check if the user is signed in
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    // Listen for auth state changes (e.g., user signs in or out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#56577A]">
      {user ? (
        // If the user is signed in, show the Dashboard
        <Dashboard />
      ) : (
        // If the user is not signed in, show the sign-in and register buttons
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to PR Tracker</h1>
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Sign In
            </button>
            <button
              onClick={handleRegister}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Don't have an account? Register
            </button>
            <button
              onClick={handleGoogleSignIn}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
