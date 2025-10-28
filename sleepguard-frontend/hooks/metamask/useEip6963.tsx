"use client";

import { useEffect, useState } from "react";
import type {
  EIP6963AnnounceProviderEvent,
  EIP6963ProviderDetail,
} from "./Eip6963Types";

export function useEip6963() {
  const [providers, setProviders] = useState<EIP6963ProviderDetail[]>([]);

  useEffect(() => {
    const handleAnnouncement = (event: EIP6963AnnounceProviderEvent) => {
      setProviders((prevProviders) => {
        const exists = prevProviders.some(
          (p) => p.info.uuid === event.detail.info.uuid
        );
        if (exists) {
          return prevProviders;
        }
        return [...prevProviders, event.detail];
      });
    };

    window.addEventListener(
      "eip6963:announceProvider",
      handleAnnouncement as EventListener
    );

    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener(
        "eip6963:announceProvider",
        handleAnnouncement as EventListener
      );
    };
  }, []);

  return { providers };
}





