"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Updated schema with correct category names
const formSchema = z.object({
  date: z.date().refine((date) => date instanceof Date, {
    message: "Please select a date",
  }),
  description: z.string().nonempty("Description is required"),
  category: z.enum(["income", "outcome"]), // Keep DB values the same
  amount: z.number().min(0, "Amount must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ExpenseForm({ expenseId }: { expenseId?: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isEditing = !!expenseId;

  // Default form values
  const defaultValues: Partial<FormValues> = {
    date: new Date(),
    description: "",
    category: "outcome",
    amount: 0,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Create fetchExpense as a useCallback to use it in dependencies
  const fetchExpense = useCallback(async () => {
    if (!expenseId) return;

    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("id", expenseId)
        .single();

      if (error) throw error;

      // Parse the date string to a Date object for the form
      const expenseDate = new Date(data.date);

      form.reset({
        date: expenseDate,
        description: data.description,
        category: data.category,
        amount: data.amount,
      });
    } catch (error) {
      console.error("Error fetching expense:", error);
    }
  }, [expenseId, form]);

  // If editing, fetch the expense data
  useEffect(() => {
    if (isEditing) {
      fetchExpense();
    }
  }, [isEditing, fetchExpense]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Format date to ISO string for database
      const formattedValues = {
        ...values,
        date: values.date.toISOString().split("T")[0],
      };

      if (isEditing) {
        // Update existing expense
        const { error } = await supabase
          .from("expenses")
          .update(formattedValues)
          .eq("id", expenseId);

        if (error) throw error;
      } else {
        // Create new expense
        const { error } = await supabase
          .from("expenses")
          .insert([formattedValues]);

        if (error) throw error;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error saving expense:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format amount to display with commas for thousands
  const formatAmount = (value: number) => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Parse formatted string back to number
  const parseAmount = (value: string) => {
    // Remove all non-numeric characters except decimal point
    return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  };

  // Map DB category values to display values
  const getCategoryDisplayName = (category: string) => {
    return category === "income" ? "Credit" : "Debit";
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter description"
                      {...field}
                      className="dark:bg-gray-800 dark:border-gray-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectValue placeholder="Select a category">
                          {field.value
                            ? getCategoryDisplayName(field.value)
                            : "Select a category"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        Rp
                      </span>
                      <Input
                        type="text"
                        placeholder="0"
                        value={
                          field.value === 0 ? "" : formatAmount(field.value)
                        }
                        onChange={(e) => {
                          const value = parseAmount(e.target.value);
                          field.onChange(value);
                        }}
                        className="pl-10 dark:bg-gray-800 dark:border-gray-700 text-right"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading
                  ? "Saving..."
                  : isEditing
                  ? "Update Expense"
                  : "Add Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
