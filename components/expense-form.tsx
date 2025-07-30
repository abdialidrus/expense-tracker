"use client";

import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  date: z.string().nonempty("Date is required"),
  description: z.string().nonempty("Description is required"),
  category: z.enum(["income", "outcome"]),
  amount: z.number().positive("Amount must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ExpenseForm({ expenseId }: { expenseId?: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const isEditing = !!expenseId;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      description: "",
      category: "outcome",
      amount: 0,
    },
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

      form.reset({
        date: new Date(data.date).toISOString().split("T")[0],
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
      if (isEditing) {
        // Update existing expense
        const { error } = await supabase
          .from("expenses")
          .update(values)
          .eq("id", expenseId);

        if (error) throw error;
      } else {
        // Create new expense
        const { error } = await supabase.from("expenses").insert([values]);

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

  // Convert string to number when amount input changes
  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: number) => void
  ) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
    onChange(value);
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
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
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
                  >
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">
                        <div className="flex items-center">
                          <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                          <span>Income</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="outcome">
                        <div className="flex items-center">
                          <TrendingDown className="mr-2 h-4 w-4 text-red-600" />
                          <span>Outcome</span>
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
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      value={field.value}
                      onChange={(e) => handleAmountChange(e, field.onChange)}
                      onBlur={field.onBlur}
                      className="dark:bg-gray-800 dark:border-gray-700"
                    />
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
