"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Expense } from "@/types";
import { TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function ExpenseList({
  onDataChange,
}: {
  onDataChange?: () => void;
}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "income" | "outcome"
  >("all");

  const itemsPerPage = 10;

  useEffect(() => {
    fetchExpenses();
  }, [currentPage, sortBy, sortOrder, categoryFilter]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Build the query
      let query = supabase.from("expenses").select("*", { count: "exact" });

      // Apply category filter if not 'all'
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, count, error } = await query.range(from, to);

      if (error) throw error;

      setExpenses(data as Expense[]);

      if (count) {
        setTotalPages(Math.ceil(count / itemsPerPage));
      }

      // Call the callback when data changes
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if the same column is clicked
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column and default to ascending
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      const { error } = await supabase.from("expenses").delete().eq("id", id);

      if (error) {
        console.error("Error deleting expense:", error);
      } else {
        fetchExpenses();
        // Call the callback when an expense is deleted
        if (onDataChange) onDataChange();
      }
    }
  };

  // Function to render category icon
  const renderCategoryIcon = (category: "income" | "outcome") => {
    if (category === "income") {
      return (
        <div className="flex items-center text-green-600 dark:text-green-400">
          <TrendingUp className="mr-1 h-4 w-4" />
          <span className="sr-only md:not-sr-only">Income</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-red-600 dark:text-red-400">
          <TrendingDown className="mr-1 h-4 w-4" />
          <span className="sr-only md:not-sr-only">Outcome</span>
        </div>
      );
    }
  };

  // Function to render mobile cards for small screens
  const renderMobileCards = () => {
    return expenses.map((expense) => (
      <Card key={expense.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-medium">{expense.description}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>
            <div
              className={`px-2 py-1 rounded ${
                expense.category === "income"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {renderCategoryIcon(expense.category)}
            </div>
          </div>
          <p
            className={`text-lg font-bold ${
              expense.category === "income"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(expense.amount)}
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={`/edit/${expense.id}`}>Edit</Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(expense.id)}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="text-sm font-medium">
              Filter by:
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="border rounded p-1 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="outcome">Outcome</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-4">
            No expenses found. Add some expenses to get started!
          </div>
        ) : (
          <>
            {/* Desktop view (hidden on small screens) */}
            <div className="rounded-md border dark:border-gray-700 hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      Date{" "}
                      {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("description")}
                    >
                      Description{" "}
                      {sortBy === "description" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("category")}
                    >
                      Category{" "}
                      {sortBy === "category" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right"
                      onClick={() => handleSort("amount")}
                    >
                      Amount{" "}
                      {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>
                        {renderCategoryIcon(expense.category)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            expense.category === "income"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {formatCurrency(expense.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/edit/${expense.id}`}>Edit</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(expense.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile view (visible only on small screens) */}
            <div className="md:hidden">{renderMobileCards()}</div>

            <div className="flex items-center justify-center space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
