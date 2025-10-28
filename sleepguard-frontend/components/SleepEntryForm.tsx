"use client";

import { useState } from "react";
import type { SleepEntry } from "@/types/sleep";

interface SleepEntryFormProps {
  onSubmit: (entry: SleepEntry) => Promise<void>;
  isLoading?: boolean;
}

export function SleepEntryForm({ onSubmit, isLoading }: SleepEntryFormProps) {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [bedtimeHour, setBedtimeHour] = useState(23);
  const [bedtimeMinute, setBedtimeMinute] = useState(0);
  const [wakeTimeHour, setWakeTimeHour] = useState(7);
  const [wakeTimeMinute, setWakeTimeMinute] = useState(0);
  const [deepSleepRatio, setDeepSleepRatio] = useState(45);
  const [wakeCount, setWakeCount] = useState(2);
  const [sleepScore, setSleepScore] = useState(7);

  const calculateDuration = () => {
    const bedMinutes = bedtimeHour * 60 + bedtimeMinute;
    let wakeMinutes = wakeTimeHour * 60 + wakeTimeMinute;
    
    // Handle overnight sleep
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    
    return (wakeMinutes - bedMinutes) / 60;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateObj = new Date(date);
    const timestamp = Math.floor(dateObj.getTime() / 1000);

    const entry: SleepEntry = {
      date: timestamp,
      bedtime: bedtimeHour * 60 + bedtimeMinute,
      wakeTime: wakeTimeHour * 60 + wakeTimeMinute,
      duration: calculateDuration(),
      deepSleepRatio,
      wakeCount,
      sleepScore,
    };

    await onSubmit(entry);
  };

  const duration = calculateDuration();

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Add Sleep Entry</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Record your sleep data - all fields will be encrypted before submission
        </p>
      </div>

      {/* Date */}
      <div>
        <label className="label">Sleep Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
          required
        />
      </div>

      {/* Bedtime */}
      <div>
        <label className="label">Bedtime</label>
        <div className="flex gap-2">
          <select
            value={bedtimeHour}
            onChange={(e) => setBedtimeHour(Number(e.target.value))}
            className="input flex-1"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          <span className="flex items-center">:</span>
          <select
            value={bedtimeMinute}
            onChange={(e) => setBedtimeMinute(Number(e.target.value))}
            className="input flex-1"
          >
            {[0, 15, 30, 45].map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Wake Time */}
      <div>
        <label className="label">Wake Time</label>
        <div className="flex gap-2">
          <select
            value={wakeTimeHour}
            onChange={(e) => setWakeTimeHour(Number(e.target.value))}
            className="input flex-1"
          >
            {Array.from({ length: 24 }, (_, i) => (
              <option key={i} value={i}>
                {i.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
          <span className="flex items-center">:</span>
          <select
            value={wakeTimeMinute}
            onChange={(e) => setWakeTimeMinute(Number(e.target.value))}
            className="input flex-1"
          >
            {[0, 15, 30, 45].map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Duration: <span className="font-semibold">{duration.toFixed(1)} hours</span>
        </div>
      </div>

      {/* Deep Sleep Ratio */}
      <div>
        <label className="label">
          Deep Sleep Ratio: <span className="font-semibold">{deepSleepRatio}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={deepSleepRatio}
          onChange={(e) => setDeepSleepRatio(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Wake Count */}
      <div>
        <label className="label">Times Woken Up</label>
        <input
          type="number"
          min="0"
          max="50"
          value={wakeCount}
          onChange={(e) => setWakeCount(Number(e.target.value))}
          className="input"
          required
        />
      </div>

      {/* Sleep Score */}
      <div>
        <label className="label">
          Sleep Quality Score: <span className="font-semibold">{sleepScore}/10</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={sleepScore}
          onChange={(e) => setSleepScore(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 (Poor)</span>
          <span>5 (Average)</span>
          <span>10 (Excellent)</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={isLoading ? "btn-disabled w-full" : "btn-primary w-full"}
      >
        {isLoading ? "Encrypting & Submitting..." : "🔒 Encrypt & Submit"}
      </button>

      <div className="text-xs text-gray-500 text-center">
        <span className="inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Your data is encrypted client-side before submission
        </span>
      </div>
    </form>
  );
}





