"use client";

import { useEffect, useState } from "react";

export function Footer() {
  const [currentTime, setCurrentTime] = useState("2025-07-30 05:48:15");

  useEffect(() => {
    // Update the time when component mounts
    const now = new Date();
    const formattedTime = now.toISOString().replace("T", " ").substring(0, 19);
    setCurrentTime(formattedTime);

    // Optional: Set up an interval to update the time periodically
    const intervalId = setInterval(() => {
      const now = new Date();
      const formattedTime = now
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);
      setCurrentTime(formattedTime);
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, []);

  return (
    <footer className="border-t dark:border-gray-700 py-4">
      <div className="container text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>Last updated: {currentTime} UTC</p>
        <p>User: abdialidrus</p>
      </div>
    </footer>
  );
}
