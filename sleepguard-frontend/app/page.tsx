"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🌙</div>
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading SleepGuard...</div>
      </div>
    </div>
  );
}
