import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import "./globals.css";

export const metadata: Metadata = {
  title: "PR Tracker",
  description:
    "The ultimate app for tracking your personal records in strength training. Log your best lifts for bench press, squat, and deadlift, track progress over time, and stay motivated on your fitness journey. Simple, fast, and effective for lifters of all levels.",
  icons: "/favicon.ico",
};

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "700"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} bg-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
