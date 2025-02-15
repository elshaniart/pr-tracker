"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../helper/supabaseClient";
import { signInWithGoogle } from "../helper/authHelpers";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
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
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <form onSubmit={handleLogin} className="w-64">
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
            Sign In
          </button>
        </form>
        <button
          onClick={handleGoogleSignIn}
          className="px-4 w-full mb-2 py-2 text-black border-black border-2 hover:border-brandGreen hover:border-4 hover:px-3.5 ease-in-out transition-all h-[48px]"
        >
          Sign In with Google
        </button>
        <div className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-mutedGreen font-bold hover:underline cursor-pointer"
          >
            Register.
          </span>
        </div>
      </div>
    </div>
  );
}
