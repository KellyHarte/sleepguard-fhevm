"use client";

import { useEffect, useState, useCallback } from "react";
import type { Eip1193Provider } from "ethers";
import { createFhevmInstance } from "@/fhevm/fhevm";
import type { FhevmInstance } from "@/fhevm/fhevmTypes";

export function useFhevm(provider: Eip1193Provider | undefined, chainId: number | undefined) {
  const [instance, setInstance] = useState<FhevmInstance | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const createInstance = useCallback(async () => {
    if (!provider) {
      setInstance(undefined);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    const controller = new AbortController();

    try {
      const fhevmInstance = await createFhevmInstance({
        provider,
        signal: controller.signal,
        onStatusChange: (status) => {
          console.log("[useFhevm] Status:", status);
        },
      });

      setInstance(fhevmInstance);
    } catch (err) {
      console.error("[useFhevm] Error:", err);
      setError(err as Error);
      setInstance(undefined);
    } finally {
      setIsLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [provider]);

  useEffect(() => {
    if (provider && chainId) {
      createInstance();
    }
  }, [provider, chainId, createInstance]);

  return {
    instance,
    isLoading,
    error,
    recreateInstance: createInstance,
  };
}





