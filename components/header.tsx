import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import BalanceSummary from "./balance-summary";

export function Header() {
  return (
    <header className="border-b dark:border-gray-700 px-4 sm:px-6 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
      <div className="container mx-auto max-w-7xl py-4">
        {/* Desktop Header */}
        <div className="hidden md:flex md:items-center md:justify-between">
          <Link href="/" className="text-2xl font-bold">
            Expense Tracker
          </Link>
          <div className="flex items-center gap-4">
            <BalanceSummary />
            <Link href="/add">
              <Button>Add Expense</Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden">
          <Link href="/" className="text-xl font-bold">
            Expense Tracker
          </Link>

          <div className="flex items-center gap-2">
            <BalanceSummary />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/add">
                    <Button className="w-full">Add Expense</Button>
                  </Link>
                  <div className="flex justify-center mt-2">
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
