"use client";

import type { DecryptedSleepEntry } from "@/types/sleep";

interface SleepTrendChartProps {
  data: DecryptedSleepEntry[];
}

export function SleepTrendChart({ data }: SleepTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <div className="text-gray-600 dark:text-gray-400">
          No data available yet. Add your first sleep entry to see trends!
        </div>
      </div>
    );
  }

  // Sort by date
  const sortedData = [...data].sort((a, b) => a.date - b.date);
  const recentData = sortedData.slice(-7); // Last 7 entries

  const maxDuration = Math.max(...recentData.map((d) => d.duration), 10);
  const maxScore = 10;

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-6">Sleep Trend (Last 7 Days)</h3>

      <div className="space-y-6">
        {/* Simple bar chart for duration */}
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Sleep Duration (hours)
          </div>
          <div className="space-y-2">
            {recentData.map((entry, index) => {
              const date = new Date(entry.date * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const percentage = (entry.duration / maxDuration) * 100;

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 w-16">
                    {date}
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {entry.duration.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simple bar chart for score */}
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Sleep Quality Score (1-10)
          </div>
          <div className="space-y-2">
            {recentData.map((entry, index) => {
              const date = new Date(entry.date * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const percentage = (entry.sleepScore / maxScore) * 100;

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400 w-16">
                    {date}
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-accent to-secondary h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {entry.sleepScore}/10
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary"></div>
              <span>Duration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-accent to-secondary"></div>
              <span>Quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





