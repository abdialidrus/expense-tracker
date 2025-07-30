import ExpenseForm from "@/components/expense-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AddExpensePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      {/* <Header /> */}

      <main className="flex-1 px-4 sm:px-6 py-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Add New Expense</h1>
            <Link href="/">
              <Button variant="outline">Back to List</Button>
            </Link>
          </div>
          <ExpenseForm />
        </div>
      </main>
    </div>
  );
}
