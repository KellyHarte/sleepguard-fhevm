"use client";

import { useState } from "react";

interface ProfileSetupProps {
  onSubmit: (allowAggregation: boolean, allowAnonymous: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileSetup({ onSubmit, isLoading }: ProfileSetupProps) {
  const [allowAggregation, setAllowAggregation] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(allowAggregation, allowAnonymous);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Welcome to SleepGuard! 🌙
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Let&apos;s set up your encrypted sleep profile
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <input
                type="checkbox"
                id="allowAggregation"
                checked={allowAggregation}
                onChange={(e) => setAllowAggregation(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="allowAggregation" className="flex-1 cursor-pointer">
                <div className="font-semibold mb-1">Participate in Global Statistics</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Allow your encrypted data to be included in anonymous global statistics
                </div>
              </label>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
              <input
                type="checkbox"
                id="allowAnonymous"
                checked={allowAnonymous}
                onChange={(e) => setAllowAnonymous(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="allowAnonymous" className="flex-1 cursor-pointer">
                <div className="font-semibold mb-1">Generate Anonymous Reports</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Allow the system to generate anonymous health insights based on your data
                </div>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</span>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Privacy First:</strong> All your sleep data is encrypted before leaving your device. 
                You can change these settings anytime.
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={isLoading ? "btn-disabled w-full" : "btn-primary w-full"}
          >
            {isLoading ? "Creating Profile..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}





