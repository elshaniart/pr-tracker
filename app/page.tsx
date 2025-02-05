"use client"; // Mark this component as a Client Component

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "./helper/supabaseClient";
import { User } from "@supabase/supabase-js";

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {user ? (
        // If the user is signed in, show the PR Tracker text
        <p className="text-2xl font-bold">PR Tracker</p>
      ) : (
        // If the user is not signed in, show the sign-in and register buttons
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to PR Tracker</h1>
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded-md mr-4 hover:bg-blue-600"
          >
            Sign In
          </button>
          <button
            onClick={handleRegister}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Don't have an account? Register
          </button>
        </div>
      )}
    </div>
  );
}
