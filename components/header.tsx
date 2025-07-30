"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { LogIn, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BalanceSummary from "./balance-summary";

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

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

            {user ? (
              <>
                <Link href="/add">
                  <Button>Add Expense</Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <span className="hidden sm:inline">{user.email}</span>
                      <span className="sm:hidden">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}

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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/add">Add Expense</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Login</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex justify-center">
                  <ThemeToggle />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
