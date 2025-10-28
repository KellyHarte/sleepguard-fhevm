"use client";

import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { ethers, Contract } from "ethers";
import type { JsonRpcSigner, ContractRunner } from "ethers";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";
import type { SleepEntry, DecryptedSleepEntry, UserProfile, AggregatedStats, GlobalStats } from "@/types/sleep";
import { SleepGuardABI } from "@/abi/SleepGuardABI";
import { SleepGuardAddresses } from "@/abi/SleepGuardAddresses";
import { FhevmDecryptionSignature } from "@/fhevm/FhevmDecryptionSignature";
import { GenericStringInMemoryStorage } from "@/fhevm/GenericStringStorage";

function getContractAddress(chainId: number | undefined): string | undefined {
  if (!chainId) return undefined;
  
  const entry = SleepGuardAddresses[chainId.toString() as keyof typeof SleepGuardAddresses];
  if (!entry || !("address" in entry) || entry.address === ethers.ZeroAddress) {
    return undefined;
  }
  
  return entry.address;
}

export function useSleepGuard(
  signer: JsonRpcSigner | undefined,
  fhevmInstance: FhevmInstance | undefined,
  chainId: number | undefined
) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const storageRef = useRef(new GenericStringInMemoryStorage());

  const contractAddress = useMemo(() => getContractAddress(chainId), [chainId]);

  const contract = useMemo(() => {
    if (!signer || !contractAddress) return null;
    return new Contract(contractAddress, SleepGuardABI.abi, signer);
  }, [signer, contractAddress]);

  // Check if user has profile
  const hasProfile = useCallback(async (): Promise<boolean> => {
    if (!contract || !signer) return false;

    try {
      const address = await signer.getAddress();
      const exists = await contract.hasProfile(address);
      return exists;
    } catch (error) {
      console.error("Error checking profile:", error);
      return false;
    }
  }, [contract, signer]);

  // Create profile
  const createProfile = useCallback(
    async (allowAggregation: boolean, allowAnonymousReport: boolean) => {
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      setIsLoading(true);
      setMessage("Creating profile...");

      try {
        const tx = await contract.createProfile(allowAggregation, allowAnonymousReport);
        setMessage("Waiting for confirmation...");
        await tx.wait();
        setMessage("Profile created successfully!");
        return true;
      } catch (error) {
        console.error("Error creating profile:", error);
        setMessage("Failed to create profile");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  // Submit sleep data
  const submitSleepData = useCallback(
    async (entry: SleepEntry) => {
      if (!contract || !fhevmInstance || !signer) {
        throw new Error("Contract or FHEVM instance not initialized");
      }

      setIsLoading(true);
      setMessage("Encrypting data...");

      try {
        const userAddress = await signer.getAddress();

        // Create encrypted input
        const input = fhevmInstance.createEncryptedInput(contractAddress!, userAddress);
        
        // Add all fields in correct order
        input.add16(entry.bedtime);                              // bedtime
        input.add16(entry.wakeTime);                             // wakeTime
        input.add16(Math.floor(entry.duration * 10));           // duration * 10
        input.add8(entry.deepSleepRatio);                        // deepSleepRatio
        input.add8(entry.wakeCount);                             // wakeCount
        input.add8(entry.sleepScore);                            // sleepScore

        // Encrypt
        const encryptedData = await input.encrypt();

        setMessage("Submitting to blockchain...");

        // Submit to contract
        const tx = await contract.submitSleepData(
          entry.date,
          encryptedData.handles[0],  // bedtime (euint16)
          encryptedData.handles[1],  // wakeTime (euint16)
          encryptedData.handles[2],  // duration (euint16)
          encryptedData.handles[3],  // deepSleepRatio (euint8)
          encryptedData.handles[4],  // wakeCount (euint8)
          encryptedData.handles[5],  // sleepScore (euint8)
          encryptedData.inputProof
        );

        setMessage("Waiting for confirmation...");
        await tx.wait();
        setMessage("Sleep data submitted successfully!");
        return true;
      } catch (error) {
        console.error("Error submitting sleep data:", error);
        setMessage("Failed to submit sleep data");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, fhevmInstance, signer, contractAddress]
  );

  // Get user entries count
  const getUserEntriesCount = useCallback(async (): Promise<number> => {
    if (!contract || !signer) return 0;

    try {
      const address = await signer.getAddress();
      const count = await contract.getUserEntriesCount(address);
      return Number(count);
    } catch (error) {
      console.error("Error getting entries count:", error);
      return 0;
    }
  }, [contract, signer]);

  // Get and decrypt user data
  const getUserData = useCallback(async (): Promise<DecryptedSleepEntry[]> => {
    if (!contract || !signer || !fhevmInstance || !contractAddress) return [];

    setIsLoading(true);
    setMessage("Fetching data...");

    try {
      const address = await signer.getAddress();
      const count = await contract.getUserEntriesCount(address);

      if (Number(count) === 0) {
        return [];
      }

      setMessage(`Decrypting ${count} entries...`);

      // Get decryption signature
      const sig = await FhevmDecryptionSignature.loadOrSign(
        fhevmInstance,
        [contractAddress],
        signer,
        storageRef.current
      );

      if (!sig) {
        setMessage("Failed to create decryption signature");
        return [];
      }

      setMessage("Fetching encrypted data...");
      const entries: DecryptedSleepEntry[] = [];

      for (let i = 0; i < Number(count); i++) {
        const encrypted = await contract.getUserSleepData(i);

        console.log("[getUserData] Encrypted entry:", {
          i,
          date: encrypted.date,
          bedtime: encrypted.bedtime,
          wakeTime: encrypted.wakeTime,
          duration: encrypted.duration,
          deepSleepRatio: encrypted.deepSleepRatio,
          wakeCount: encrypted.wakeCount,
          sleepScore: encrypted.sleepScore,
        });

        // Extract handles - the contract returns euint types which need to be converted to handles
        const handles = [
          { handle: String(encrypted.bedtime), contractAddress: contractAddress as `0x${string}` },
          { handle: String(encrypted.wakeTime), contractAddress: contractAddress as `0x${string}` },
          { handle: String(encrypted.duration), contractAddress: contractAddress as `0x${string}` },
          { handle: String(encrypted.deepSleepRatio), contractAddress: contractAddress as `0x${string}` },
          { handle: String(encrypted.wakeCount), contractAddress: contractAddress as `0x${string}` },
          { handle: String(encrypted.sleepScore), contractAddress: contractAddress as `0x${string}` },
        ];

        console.log("[getUserData] Decrypting handles:", JSON.stringify(handles, null, 2));

        try {
          const decrypted = await fhevmInstance.userDecrypt(
            handles,
            sig.privateKey,
            sig.publicKey,
            sig.signature,
            sig.contractAddresses,
            sig.userAddress,
            sig.startTimestamp,
            sig.durationDays
          );

          console.log("[getUserData] Decrypted values:", decrypted);

          entries.push({
            date: Number(encrypted.date),
            bedtime: Number(decrypted[handles[0].handle]),
            wakeTime: Number(decrypted[handles[1].handle]),
            duration: Number(decrypted[handles[2].handle]) / 10, // Convert back to hours
            deepSleepRatio: Number(decrypted[handles[3].handle]),
            wakeCount: Number(decrypted[handles[4].handle]),
            sleepScore: Number(decrypted[handles[5].handle]),
          });
        } catch (decryptError) {
          console.error(`[getUserData] Failed to decrypt entry ${i}:`, decryptError);
          // Continue with other entries
        }
      }

      setMessage(`Decrypted ${entries.length} entries`);
      return entries;
    } catch (error) {
      console.error("Error getting user data:", error);
      setMessage("Failed to get user data");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer, fhevmInstance, contractAddress]);

  // Get aggregated stats - calculate from decrypted user data
  const getAggregatedStats = useCallback(async (): Promise<AggregatedStats | null> => {
    if (!contract || !signer) return null;

    setIsLoading(true);
    setMessage("Fetching aggregated stats...");

    try {
      const address = await signer.getAddress();
      const totalEntries = await contract.getUserEntriesCount(address);

      if (Number(totalEntries) === 0) {
        setMessage("No data available");
        return {
          avgDuration: 0,
          avgDeepSleep: 0,
          avgScore: 0,
          totalEntries: 0,
        };
      }

      // Get all user data and calculate stats locally
      setMessage("Calculating stats from decrypted data...");
      const userData = await getUserData();

      if (userData.length === 0) {
        return {
          avgDuration: 0,
          avgDeepSleep: 0,
          avgScore: 0,
          totalEntries: 0,
        };
      }

      const sumDuration = userData.reduce((sum, entry) => sum + entry.duration, 0);
      const sumDeepSleep = userData.reduce((sum, entry) => sum + entry.deepSleepRatio, 0);
      const sumScore = userData.reduce((sum, entry) => sum + entry.sleepScore, 0);

      const result = {
        avgDuration: sumDuration / userData.length,
        avgDeepSleep: sumDeepSleep / userData.length,
        avgScore: sumScore / userData.length,
        totalEntries: userData.length,
      };

      setMessage("Stats loaded");
      return result;
    } catch (error) {
      console.error("Error getting aggregated stats:", error);
      setMessage("Failed to get stats");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, signer, getUserData]);

  // Get global stats
  const getGlobalStats = useCallback(async (): Promise<GlobalStats | null> => {
    if (!contract || !fhevmInstance || !contractAddress) return null;

    setIsLoading(true);
    setMessage("Fetching global stats...");

    try {
      if (!contract) {
        setMessage("Contract not initialized");
        return null;
      }

      const participants = await contract.totalParticipants();

      if (Number(participants) === 0) {
        setMessage("No global data available");
        return {
          avgDuration: 0,
          avgDeepSleep: 0,
          avgScore: 0,
          participants: 0,
        };
      }

      setMessage("Getting global aggregated stats...");
      
      // Call with signer to trigger transient authorization
      if (!signer) {
        setMessage("Need signer for global stats");
        return null;
      }

      // Call getGlobalAverageStats to authorize and get encrypted data
      // This function will authorize the caller to decrypt the values
      let stats;
      try {
        const tx = await contract.getGlobalAverageStats();
        const receipt = await tx.wait();
        console.log("[getGlobalStats] Authorization transaction complete:", receipt?.hash);
        
        // Now get the return values using staticCall
        stats = await contract.getGlobalAverageStats.staticCall();
        console.log("[getGlobalStats] Stats retrieved:", stats);
      } catch (error) {
        console.error("[getGlobalStats] Failed to get stats:", error);
        setMessage("Failed to get global stats");
        return {
          avgDuration: 0,
          avgDeepSleep: 0,
          avgScore: 0,
          participants: Number(participants),
        };
      }

      console.log("[getGlobalStats] Stats returned:", stats);

      // stats is already an array of [avgDuration, avgDeepSleep, avgScore, participants]
      const [avgDuration, avgDeepSleep, avgScore, participantsCount] = stats;

      console.log("[getGlobalStats] Parsed:", { avgDuration, avgDeepSleep, avgScore, participantsCount });

      // Decrypt the encrypted values using userDecrypt
      try {
        // Create decryption signature
        const sig = await FhevmDecryptionSignature.loadOrSign(
          fhevmInstance,
          [contractAddress as `0x${string}`],
          signer,
          storageRef.current
        );

        if (!sig) {
          setMessage("Failed to create decryption signature");
          return {
            avgDuration: 0,
            avgDeepSleep: 0,
            avgScore: 0,
            participants: Number(participantsCount),
          };
        }

        // Prepare handles for decryption
        const handles = [
          { handle: String(avgDuration), contractAddress: contractAddress as `0x${string}` },
          { handle: String(avgDeepSleep), contractAddress: contractAddress as `0x${string}` },
          { handle: String(avgScore), contractAddress: contractAddress as `0x${string}` },
        ];

        console.log("[getGlobalStats] Attempting decryption with handles:", handles);
        
        // Decrypt using userDecrypt
        const decrypted = await fhevmInstance.userDecrypt(
          handles,
          sig.privateKey,
          sig.publicKey,
          sig.signature,
          sig.contractAddresses,
          sig.userAddress,
          sig.startTimestamp,
          sig.durationDays
        );

        // Extract decrypted values
        const decryptedDuration = Number(decrypted[handles[0].handle]);
        const decryptedDeepSleep = Number(decrypted[handles[1].handle]);
        const decryptedScore = Number(decrypted[handles[2].handle]);

        console.log("[getGlobalStats] Decrypted values:", { decryptedDuration, decryptedDeepSleep, decryptedScore });

        const result = {
          avgDuration: decryptedDuration / Number(participantsCount) / 10, // Convert to hours
          avgDeepSleep: decryptedDeepSleep / Number(participantsCount),
          avgScore: decryptedScore / Number(participantsCount),
          participants: Number(participantsCount),
        };

        setMessage("Global stats loaded successfully");
        return result;
      } catch (decryptError) {
        console.error("[getGlobalStats] Decryption failed:", decryptError);
        setMessage(`Decryption failed: ${decryptError instanceof Error ? decryptError.message : 'Unknown error'}`);
        return {
          avgDuration: 0,
          avgDeepSleep: 0,
          avgScore: 0,
          participants: Number(participantsCount),
        };
      }
    } catch (error) {
      console.error("Error getting global stats:", error);
      setMessage("Failed to get global stats");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [contract, fhevmInstance, contractAddress]);

  // Update privacy settings
  const updatePrivacySettings = useCallback(
    async (allowAggregation: boolean, allowAnonymous: boolean) => {
      if (!contract) {
        throw new Error("Contract not initialized");
      }

      setIsLoading(true);
      setMessage("Updating settings...");

      try {
        const tx = await contract.updatePrivacySettings(allowAggregation, allowAnonymous);
        await tx.wait();
        setMessage("Settings updated!");
        return true;
      } catch (error) {
        console.error("Error updating settings:", error);
        setMessage("Failed to update settings");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  return {
    contractAddress,
    isDeployed: !!contractAddress,
    isLoading,
    message,
    hasProfile,
    createProfile,
    submitSleepData,
    getUserEntriesCount,
    getUserData,
    getAggregatedStats,
    getGlobalStats,
    updatePrivacySettings,
  };
}




