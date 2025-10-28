"use client";

import { useEffect, useState } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import type { Eip1193Provider } from "ethers";

export function useMetaMaskEthersSigner(
  provider: Eip1193Provider | undefined,
  accounts: string[]
) {
  const [signer, setSigner] = useState<JsonRpcSigner | undefined>(undefined);

  useEffect(() => {
    if (!provider || accounts.length === 0) {
      setSigner(undefined);
      return;
    }

    const getSigner = async () => {
      try {
        const ethersProvider = new BrowserProvider(provider);
        const newSigner = await ethersProvider.getSigner();
        setSigner(newSigner);
      } catch (error) {
        console.error("Failed to get signer:", error);
        setSigner(undefined);
      }
    };

    getSigner();
  }, [provider, accounts]);

  return signer;
}





