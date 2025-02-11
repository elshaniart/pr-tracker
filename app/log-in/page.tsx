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
      className={`flex flex-col items-center justify-center min-h-screen bg-[#15162e] ${montserrat.className}`}
    >
      <div className="text-center bg-gradient-to-r from-[#060B26] to-[#06275D] border-[2px] border-[#060B26] rounded-2xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-4">Log In</h1>
        <form onSubmit={handleLogin} className="w-64">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mb-4"
          >
            Sign In
          </button>
        </form>
        <button
          onClick={handleGoogleSignIn}
          className="w-64 bg-red-500 text-white p-2 rounded hover:bg-red-600 mb-4"
        >
          Sign In with Google
        </button>
        <div className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => router.push("/register")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Register.
          </span>
        </div>
      </div>
    </div>
  );
}
