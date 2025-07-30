"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

type SummaryData = {
  total_income: number;
  total_outcome: number;
  net_amount: number;
};

export default function ExpenseSummary() {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    total_income: 0,
    total_outcome: 0,
    net_amount: 0,
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
        setSummaryData(data[0]);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-6">
      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingUp className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
            Total Income
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summaryData.total_income)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <TrendingDown className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
            Total Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summaryData.total_outcome)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden sm:col-span-2 md:col-span-1">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Wallet className="mr-2 h-4 w-4" />
            Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <div
              className={`text-2xl font-bold ${
                summaryData.net_amount >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(summaryData.net_amount)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
