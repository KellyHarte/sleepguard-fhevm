"use client";

import { useEffect, useState } from "react";
import { useMetaMaskProvider } from "@/hooks/metamask/useMetaMaskProvider";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useFhevm } from "@/hooks/useFhevm";
import { useSleepGuard } from "@/hooks/useSleepGuard";
import { WalletConnect } from "@/components/WalletConnect";
import { ProfileSetup } from "@/components/ProfileSetup";
import { SleepEntryForm } from "@/components/SleepEntryForm";
import { StatsCard } from "@/components/StatsCard";
import { SleepTrendChart } from "@/components/SleepTrendChart";
import type { DecryptedSleepEntry, AggregatedStats, GlobalStats } from "@/types/sleep";

export default function DashboardPage() {
  const { provider, accounts, chainId, isConnected, isConnecting, connect, disconnect } = useMetaMaskProvider();
  const signer = useMetaMaskEthersSigner(provider, accounts);
  const { instance: fhevmInstance } = useFhevm(provider, chainId);
  
  const {
    isDeployed,
    isLoading,
    message,
    hasProfile: checkHasProfile,
    createProfile,
    submitSleepData,
    getUserData,
    getAggregatedStats,
    getGlobalStats,
  } = useSleepGuard(signer, fhevmInstance, chainId);

  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [userData, setUserData] = useState<DecryptedSleepEntry[]>([]);
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [activeTab, setActiveTab] = useState<"add" | "view" | "global">("add");

  // Debug log
  useEffect(() => {
    console.log("[Dashboard] State:", { isConnected, chainId, accounts, hasProfile });
  }, [isConnected, chainId, accounts, hasProfile]);

  // Check profile when connected
  useEffect(() => {
    if (isConnected && signer) {
      checkHasProfile().then((exists) => {
        setHasProfile(exists);
        if (!exists) {
          setShowProfileSetup(true);
        }
      });
    }
  }, [isConnected, signer, checkHasProfile]);

  // Load data when profile exists
  useEffect(() => {
    if (hasProfile && activeTab === "view" && fhevmInstance) {
      // Only load if FHEVM instance is ready
      loadUserData();
      loadStats();
    }
  }, [hasProfile, activeTab, fhevmInstance]);

  // Load global stats
  useEffect(() => {
    if (activeTab === "global" && fhevmInstance) {
      loadGlobalStats();
    }
  }, [activeTab, fhevmInstance]);

  const loadUserData = async () => {
    const data = await getUserData();
    setUserData(data);
  };

  const loadStats = async () => {
    const aggregated = await getAggregatedStats();
    setStats(aggregated);
  };

  const loadGlobalStats = async () => {
    const global = await getGlobalStats();
    setGlobalStats(global);
  };

  const handleCreateProfile = async (allowAggregation: boolean, allowAnonymous: boolean) => {
    try {
      await createProfile(allowAggregation, allowAnonymous);
      setHasProfile(true);
      setShowProfileSetup(false);
    } catch (error) {
      console.error("Failed to create profile:", error);
    }
  };

  const handleSubmitSleepData = async (entry: any) => {
    try {
      await submitSleepData(entry);
      alert("Sleep data submitted successfully! 🌙");
      
      // Reload data
      if (activeTab === "view") {
        await loadUserData();
        await loadStats();
      }
    } catch (error) {
      console.error("Failed to submit sleep data:", error);
      alert("Failed to submit sleep data. Please try again.");
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to SleepGuard</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Connect your wallet to start tracking your sleep data securely
            </p>
            <WalletConnect
              accounts={accounts}
              isConnecting={isConnecting}
              isConnected={isConnected}
              connect={connect}
              disconnect={disconnect}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isDeployed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center card">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Contract Not Deployed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              SleepGuard contract is not deployed on chain ID {chainId}.
            </p>
            <p className="text-sm text-gray-500">
              Please deploy the contract first or switch to a supported network (localhost or Sepolia).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                SleepGuard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Privacy-Preserving Sleep Analysis
              </p>
            </div>
            <WalletConnect
              accounts={accounts}
              isConnecting={isConnecting}
              isConnected={isConnected}
              connect={connect}
              disconnect={disconnect}
            />
          </div>
        </div>
      </div>

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <ProfileSetup onSubmit={handleCreateProfile} isLoading={isLoading} />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Status Message */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 animate-fade-in">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("add")}
            className={
              activeTab === "add"
                ? "btn-primary"
                : "btn-outline"
            }
          >
            📝 Add Entry
          </button>
          <button
            onClick={() => setActiveTab("view")}
            className={
              activeTab === "view"
                ? "btn-primary"
                : "btn-outline"
            }
          >
            📊 My Data
          </button>
          <button
            onClick={() => setActiveTab("global")}
            className={
              activeTab === "global"
                ? "btn-primary"
                : "btn-outline"
            }
          >
            🌍 Global Stats
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "add" && (
          <div className="max-w-2xl mx-auto">
            <SleepEntryForm onSubmit={handleSubmitSleepData} isLoading={isLoading} />
          </div>
        )}

        {activeTab === "view" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            {stats && (
              <div className="grid md:grid-cols-4 gap-4">
                <StatsCard
                  title="Avg Sleep Duration"
                  value={stats.avgDuration}
                  unit="hours"
                  icon="⏱️"
                />
                <StatsCard
                  title="Avg Deep Sleep"
                  value={stats.avgDeepSleep}
                  unit="%"
                  icon="😴"
                />
                <StatsCard
                  title="Avg Quality Score"
                  value={stats.avgScore}
                  unit="/10"
                  icon="⭐"
                />
                <StatsCard
                  title="Total Entries"
                  value={stats.totalEntries}
                  unit="days"
                  icon="📅"
                />
              </div>
            )}

            {/* Trend Chart */}
            <SleepTrendChart data={userData} />

            {/* Reload Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  loadUserData();
                  loadStats();
                }}
                disabled={isLoading}
                className={isLoading ? "btn-disabled" : "btn-outline"}
              >
                {isLoading ? "Loading..." : "🔄 Refresh Data"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "global" && (
          <div className="space-y-6">
            {globalStats && (
              <>
                <div className="card text-center">
                  <h2 className="text-2xl font-bold mb-4">Anonymous Global Statistics</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Aggregated from {globalStats.participants} encrypted entries
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <StatsCard
                    title="Global Avg Duration"
                    value={globalStats.avgDuration}
                    unit="hours"
                    icon="🌍"
                  />
                  <StatsCard
                    title="Global Avg Deep Sleep"
                    value={globalStats.avgDeepSleep}
                    unit="%"
                    icon="💤"
                  />
                  <StatsCard
                    title="Global Avg Score"
                    value={globalStats.avgScore}
                    unit="/10"
                    icon="✨"
                  />
                </div>

                {stats && (
                  <div className="card">
                    <h3 className="text-xl font-semibold mb-4">Your vs Global Average</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Duration</span>
                          <span>
                            You: {stats.avgDuration.toFixed(1)}h | Global: {globalStats.avgDuration.toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex gap-2 h-8">
                          <div
                            className="bg-primary rounded flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${(stats.avgDuration / 12) * 100}%` }}
                          >
                            You
                          </div>
                          <div
                            className="bg-gray-400 rounded flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${(globalStats.avgDuration / 12) * 100}%` }}
                          >
                            Global
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Deep Sleep</span>
                          <span>
                            You: {stats.avgDeepSleep.toFixed(0)}% | Global: {globalStats.avgDeepSleep.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex gap-2 h-8">
                          <div
                            className="bg-secondary rounded flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${stats.avgDeepSleep}%` }}
                          >
                            You
                          </div>
                          <div
                            className="bg-gray-400 rounded flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${globalStats.avgDeepSleep}%` }}
                          >
                            Global
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Quality Score</span>
                          <span>
                            You: {stats.avgScore.toFixed(1)}/10 | Global: {globalStats.avgScore.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="flex gap-2 h-8">
                          <div
                            className="bg-accent rounded flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${(stats.avgScore / 10) * 100}%` }}
                          >
                            You
                          </div>
                          <div
                            className="bg-gray-400 rounded flex items-center justify-center text-white text-xs font-semibold"
                            style={{ width: `${(globalStats.avgScore / 10) * 100}%` }}
                          >
                            Global
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <button
                    onClick={loadGlobalStats}
                    disabled={isLoading}
                    className={isLoading ? "btn-disabled" : "btn-outline"}
                  >
                    {isLoading ? "Loading..." : "🔄 Refresh Global Stats"}
                  </button>
                </div>
              </>
            )}

            {!globalStats && !isLoading && (
              <div className="card text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <div className="text-gray-600 dark:text-gray-400 mb-4">
                  No global statistics available yet
                </div>
                <button
                  onClick={loadGlobalStats}
                  className="btn-primary"
                >
                  Load Global Stats
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}




