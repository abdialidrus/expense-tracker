"use client";

import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";

export default function BalanceSummary() {
  const [balance, setBalance] = useState<number>(0);
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
        setBalance(data[0].net_amount);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-200 dark:border-gray-700">
      <Wallet className="h-6 w-6 mr-3 text-gray-600 dark:text-gray-300" />
      <div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Current Balance
        </div>
        {loading ? (
          <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
        ) : (
          <div
            className={`text-xl font-bold ${
              balance >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(balance)}
          </div>
        )}
      </div>
    </div>
  );
}
