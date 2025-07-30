"use client";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import LoginForm from "@/components/login-form";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <Header />

      <main className="flex-1 px-4 sm:px-6 py-6">
        <div className="container mx-auto max-w-7xl">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Login to Expense Tracker
          </h1>
          <LoginForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
