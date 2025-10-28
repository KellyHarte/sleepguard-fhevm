"use client";

interface WalletConnectProps {
  accounts?: string[];
  isConnecting?: boolean;
  isConnected?: boolean;
  connect: () => Promise<string[] | undefined>;
  disconnect: () => void;
}

export function WalletConnect({ accounts = [], isConnecting = false, isConnected = false, connect, disconnect }: WalletConnectProps) {
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isConnected && accounts.length > 0) {
    return (
      <div className="flex items-center gap-4">
        <div className="glass px-4 py-2 rounded-lg">
          <span className="text-sm font-mono">{formatAddress(accounts[0])}</span>
        </div>
        <button
          onClick={disconnect}
          className="btn-outline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className={isConnecting ? "btn-disabled" : "btn-primary"}
    >
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}




