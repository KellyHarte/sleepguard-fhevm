"use client";

import { useEffect, useState, useCallback } from "react";
import type { Eip1193Provider } from "ethers";
import { useEip6963 } from "./useEip6963";

const STORAGE_KEY = "wallet.connected";
const STORAGE_ACCOUNTS = "wallet.lastAccounts";
const STORAGE_CHAIN_ID = "wallet.lastChainId";

export function useMetaMaskProvider() {
  const { providers } = useEip6963();
  const [selectedProvider, setSelectedProvider] = useState<Eip1193Provider | undefined>(undefined);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [isConnecting, setIsConnecting] = useState(false);

  // Auto-select MetaMask if available
  useEffect(() => {
    if (providers.length > 0 && !selectedProvider) {
      const metamask = providers.find((p) =>
        p.info.name.toLowerCase().includes("metamask")
      );
      if (metamask) {
        setSelectedProvider(metamask.provider);
      } else {
        setSelectedProvider(providers[0].provider);
      }
    }
  }, [providers, selectedProvider]);

  // Auto-reconnect on page load
  useEffect(() => {
    if (!selectedProvider) return;

    const wasConnected = localStorage.getItem(STORAGE_KEY) === "true";
    if (wasConnected) {
      // Silent reconnect using eth_accounts (no popup)
      selectedProvider
        .request({ method: "eth_accounts" })
        .then((existingAccounts) => {
          if (Array.isArray(existingAccounts) && existingAccounts.length > 0) {
            setAccounts(existingAccounts as string[]);
            
            // Get chain ID
            return selectedProvider.request({ method: "eth_chainId" }).then((chainIdHex) => {
              if (typeof chainIdHex === "string") {
                setChainId(parseInt(chainIdHex, 16));
              }
            });
          }
        })
        .catch((error) => {
          console.warn("Failed to auto-reconnect:", error);
          // Clear storage if auto-reconnect fails
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_ACCOUNTS);
          localStorage.removeItem(STORAGE_CHAIN_ID);
        });
    }
  }, [selectedProvider]);

  // Handle account changes
  useEffect(() => {
    if (!selectedProvider) return;

    const handleAccountsChanged = (newAccounts: unknown) => {
      if (Array.isArray(newAccounts)) {
        setAccounts(newAccounts as string[]);
      }
    };

    const handleChainChanged = (newChainId: unknown) => {
      if (typeof newChainId === "string") {
        setChainId(parseInt(newChainId, 16));
      }
    };

    // Cast to any for event handling
    const provider = selectedProvider as any;
    
    if (provider.on) {
      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (provider.removeListener) {
        provider.removeListener("accountsChanged", handleAccountsChanged);
        provider.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [selectedProvider]);

  const connect = useCallback(async () => {
    if (!selectedProvider) {
      throw new Error("No provider available");
    }

    setIsConnecting(true);
    try {
      const newAccounts = await selectedProvider.request({
        method: "eth_requestAccounts",
      });

      if (Array.isArray(newAccounts)) {
        setAccounts(newAccounts as string[]);
        localStorage.setItem(STORAGE_ACCOUNTS, JSON.stringify(newAccounts));
      }

      const chainIdHex = await selectedProvider.request({
        method: "eth_chainId",
      });

      if (typeof chainIdHex === "string") {
        const cid = parseInt(chainIdHex, 16);
        setChainId(cid);
        localStorage.setItem(STORAGE_CHAIN_ID, cid.toString());
      }

      // Mark as connected
      localStorage.setItem(STORAGE_KEY, "true");

      return newAccounts as string[];
    } catch (error) {
      console.error("Failed to connect:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [selectedProvider]);

  const disconnect = useCallback(() => {
    setAccounts([]);
    setChainId(undefined);
    
    // Clear storage
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_ACCOUNTS);
    localStorage.removeItem(STORAGE_CHAIN_ID);
  }, []);

  return {
    provider: selectedProvider,
    accounts,
    chainId,
    isConnecting,
    connect,
    disconnect,
    isConnected: accounts.length > 0,
  };
}

