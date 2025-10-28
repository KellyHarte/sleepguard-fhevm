export interface SleepEntry {
  date: number; // Unix timestamp
  bedtime: number; // Minutes (0-1439)
  wakeTime: number; // Minutes (0-1439)
  duration: number; // Hours (float)
  deepSleepRatio: number; // 0-100
  wakeCount: number; // 0-50
  sleepScore: number; // 1-10
}

export interface DecryptedSleepEntry extends SleepEntry {
  // All fields already decrypted
}

export interface EncryptedSleepEntry {
  date: number;
  bedtime: string; // Encrypted handle
  wakeTime: string;
  duration: string;
  deepSleepRatio: string;
  wakeCount: string;
  sleepScore: string;
}

export interface UserProfile {
  address: string;
  createdAt: number;
  allowAggregation: boolean;
  allowAnonymousReport: boolean;
  joinLeaderboard: boolean;
  totalEntries: number;
}

export interface AggregatedStats {
  avgDuration: number;
  avgDeepSleep: number;
  avgScore: number;
  totalEntries: number;
}

export interface GlobalStats {
  avgDuration: number;
  avgDeepSleep: number;
  avgScore: number;
  participants: number;
}





