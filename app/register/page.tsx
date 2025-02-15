"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../helper/supabaseClient";
import { signInWithGoogle } from "../helper/authHelpers";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Step 1: Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Step 2: Create a profile for the user
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user?.id, // Link to the auth user
        onboarded: false, // Default to false
      });

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Redirect to the homepage after successful registration
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen bg-white ${montserrat.className}`}
    >
      <div className="text-center bg-white border-[2px] border-black p-8 text-black">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <form onSubmit={handleRegister} className="w-64">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border-2 border-black text-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all focus:outline-none h-[48px] mb-4"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border-2 border-black text-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all focus:outline-none h-[48px] mb-4"
            required
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="px-4 py-2 w-full mb-2 bg-black hover:bg-brandGreen ease-in-out transition-all text-white hover:text-black h-[48px]"
          >
            Register
          </button>
        </form>
        <button
          onClick={handleGoogleSignIn}
          className="px-4 w-full mb-2 py-2 text-black border-black border-2 hover:border-brandGreen hover:border-4 hover:px-3.5 ease-in-out transition-all h-[48px]"
        >
          Sign In with Google
        </button>
        <div className="text-sm text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/log-in")}
            className="text-mutedGreen font-bold hover:underline cursor-pointer"
          >
            Sign In.
          </span>
        </div>
      </div>
    </div>
  );
}
