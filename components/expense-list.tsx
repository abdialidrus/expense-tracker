"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Expense } from "@/types";
import { Filter, Pencil, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type CategoryFilterType = "all" | "income" | "outcome";

export default function ExpenseList({
  onDataChange,
}: {
  onDataChange?: () => void;
}) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilterType>("all");

  const itemsPerPage = 10;

  // Create fetchExpenses as a useCallback to use it in dependencies
  const fetchExpenses = useCallback(async () => {
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
  }, [currentPage, sortBy, sortOrder, categoryFilter, onDataChange]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

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
    if (!user) {
      alert("You must be logged in to delete expenses");
      return;
    }

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

  // Function to render category badge
  const renderCategoryBadge = (category: "income" | "outcome") => {
    if (category === "income") {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 flex items-center gap-1"
        >
          <TrendingUp className="h-3 w-3" />
          <span>Credit</span>
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 flex items-center gap-1"
        >
          <TrendingDown className="h-3 w-3" />
          <span>Debit</span>
        </Badge>
      );
    }
  };

  // Function to render sort indicator
  const renderSortIndicator = (column: string) => {
    if (sortBy === column) {
      return (
        <span className="ml-1 inline-flex items-center">
          {sortOrder === "asc" ? "↑" : "↓"}
        </span>
      );
    }
    return null;
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
            <div>{renderCategoryBadge(expense.category)}</div>
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
          {user && (
            <div className="flex gap-2 mt-4 justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/edit/${expense.id}`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </CardContent>
      </Card>
    ));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Expenses</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filter:</span>

              <Select
                value={categoryFilter}
                onValueChange={(value) =>
                  setCategoryFilter(value as CategoryFilterType)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="income">
                    <div className="flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                      <span>Credit</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="outcome">
                    <div className="flex items-center">
                      <TrendingDown className="mr-2 h-4 w-4 text-red-600" />
                      <span>Debit</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p>No expenses found.</p>
            {user && <p className="mt-1">Add some expenses to get started!</p>}
          </div>
        ) : (
          <>
            {/* Desktop view (hidden on small screens) */}
            <div className="rounded-md border dark:border-gray-700 hidden md:block overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <TableHead
                      className="cursor-pointer font-medium px-6 py-3"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center">
                        Date
                        {renderSortIndicator("date")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer font-medium px-6 py-3"
                      onClick={() => handleSort("description")}
                    >
                      <div className="flex items-center">
                        Description
                        {renderSortIndicator("description")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer font-medium px-6 py-3"
                      onClick={() => handleSort("category")}
                    >
                      <div className="flex items-center">
                        Category
                        {renderSortIndicator("category")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-right font-medium px-6 py-3"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center justify-end">
                        Amount
                        {renderSortIndicator("amount")}
                      </div>
                    </TableHead>
                    {user && (
                      <TableHead className="w-[120px] text-center font-medium px-6 py-3">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium px-6 py-4">
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {expense.description}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        {renderCategoryBadge(expense.category)}
                      </TableCell>
                      <TableCell className="text-right font-medium px-6 py-4">
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
                      {user && (
                        <TableCell className="px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                    className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800"
                                  >
                                    <Link href={`/edit/${expense.id}`}>
                                      <Pencil className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(expense.id)}
                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile view (visible only on small screens) */}
            <div className="md:hidden">{renderMobileCards()}</div>

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4 mt-2">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
