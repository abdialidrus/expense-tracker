"use client";

import ExpenseList from "@/components/expense-list";
import { Header } from "@/components/header";
import { useCallback, useState } from "react";

export default function Home() {
  const [refreshBalance, setRefreshBalance] = useState(0);

  const handleDataChange = useCallback(() => {
    // Trigger a refresh of the balance when data changes
    setRefreshBalance((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <Header key={refreshBalance} />

      <main className="flex-1 px-4 sm:px-6 py-6">
        <div className="container mx-auto max-w-7xl">
          <ExpenseList onDataChange={handleDataChange} />
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
