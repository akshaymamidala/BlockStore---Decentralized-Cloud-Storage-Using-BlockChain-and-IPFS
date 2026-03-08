"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useAccount, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";

export default function ConnectButton() {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [actionError, setActionError] = useState("");

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const metaMaskConnector = useMemo(
    () => connectors.find((c) => c.id.includes("metaMask") || c.name === "MetaMask"),
    [connectors]
  );

  if (!isClient) {
    return (
      <button disabled className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-70">
        Connect Wallet
      </button>
    );
  }

  if (!isConnected || !address) {
    return (
      <button
        onClick={() => {
          setActionError("");
          if (metaMaskConnector) {
            connect({ connector: metaMaskConnector });
          }
        }}
        disabled={isPending || !metaMaskConnector}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
    );
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const onSepolia = chainId === sepolia.id;

  return (
    <div className="flex items-center gap-2">
      <span className="hidden rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 sm:inline-flex">
        {shortAddress}
      </span>

      {!onSepolia && (
        <button
          className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSwitching}
          onClick={async () => {
            try {
              setActionError("");
              await switchChainAsync({ chainId: sepolia.id });
            } catch {
              setActionError("Network switch rejected in wallet.");
            }
          }}
        >
          {isSwitching ? "Switching..." : "Switch Network"}
        </button>
      )}

      <button
        onClick={() => disconnect()}
        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Disconnect
      </button>

      {actionError && (
        <span className="hidden rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 lg:inline-flex">
          {actionError}
        </span>
      )}
    </div>
  );
}

