"use client";

import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

export default function BalanceSummary() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalOutcome: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_expense_summary");

      if (error) throw error;

      if (data && data.length > 0) {
        setSummary({
          totalIncome: data[0].total_income,
          totalOutcome: data[0].total_outcome,
          balance: data[0].net_amount,
        });
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      {/* Credit Card (formerly Income) */}
      <div className="flex items-center bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
        <TrendingUp className="h-8 w-8 mr-4 text-green-600 dark:text-green-400" />
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Credit
          </div>
          {loading ? (
            <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
          ) : (
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.totalIncome)}
            </div>
          )}
        </div>
      </div>

      {/* Debit Card (formerly Outcome) */}
      <div className="flex items-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <TrendingDown className="h-8 w-8 mr-4 text-red-600 dark:text-red-400" />
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Debit
          </div>
          {loading ? (
            <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
          ) : (
            <div className="text-xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalOutcome)}
            </div>
          )}
        </div>
      </div>

      {/* Balance Card */}
      <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <Wallet className="h-8 w-8 mr-4 text-blue-600 dark:text-blue-400" />
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Current Balance
          </div>
          {loading ? (
            <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1"></div>
          ) : (
            <div
              className={`text-xl font-bold ${
                summary.balance >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(summary.balance)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
