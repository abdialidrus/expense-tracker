"use client";

import BalanceSummary from "@/components/balance-summary";
import ExpenseList from "@/components/expense-list";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [refreshBalance, setRefreshBalance] = useState(0);

  const handleDataChange = useCallback(() => {
    // Trigger a refresh of the balance when data changes
    setRefreshBalance((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <Header />

      <main className="flex-1 px-4 sm:px-6 py-6">
        <div className="container mx-auto max-w-7xl">
          {/* Dashboard Header with Balance Summary */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              {user && (
                <Link href="/add">
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Expense</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Balance Summary positioned above the expense list */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-medium mb-3">Summary</h2>
              <BalanceSummary key={refreshBalance} />
            </div>
          </div>

          {/* Expense List */}
          <ExpenseList onDataChange={handleDataChange} />
        </div>
      </main>
    </div>
  );
}
