import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatEtherValue,
  getBrowserProvider,
  getJsonRpcProvider,
} from "@/lib/ethers-client.js";
import { useWalletContext } from "@/providers/WalletProvider.jsx";

const RPC_URL = import.meta.env.VITE_RPC_URL?.trim() || "";

function useWallet() {
  const context = useWalletContext();
  const [isSwitching, setIsSwitching] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);
  const [nativeBalance, setNativeBalance] = useState(null);

  const chain = useMemo(
    () =>
      context.chains.find((item) => item.id === context.chainId) ?? {
        id: context.chainId,
        name: context.chainName,
        symbol: context.chains[0]?.symbol ?? "ETH",
      },
    [context.chainId, context.chainName, context.chains],
  );

  const fetchBalance = useCallback(async () => {
    if (!context.address) {
      setNativeBalance(null);
      setBalanceError(null);
      return;
    }
    setIsBalanceLoading(true);
    try {
      let provider;
      if (context.provider) {
        provider = await getBrowserProvider(context.provider);
      } else if (RPC_URL) {
        provider = await getJsonRpcProvider(RPC_URL);
      } else {
        throw new Error("No RPC provider configured for balance lookup.");
      }
      const balance = await provider.getBalance(context.address);
      const formatted = await formatEtherValue(balance);
      setNativeBalance(formatted);
      setBalanceError(null);
    } catch (err) {
      setBalanceError(err);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [context.address, context.provider]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, context.chainId]);

  const connect = useCallback(
    async (connector) => {
      const connectorId = typeof connector === "string" ? connector : connector?.id;
      if (!connectorId) {
        throw new Error("Connector id is required.");
      }
      await context.connect(connectorId);
      await fetchBalance();
    },
    [context, fetchBalance],
  );

  const disconnect = useCallback(async () => {
    await context.disconnect();
    setNativeBalance(null);
    setBalanceError(null);
  }, [context]);

  const switchChain = useCallback(
    async (chainId) => {
      setIsSwitching(true);
      try {
        await context.switchChain(chainId);
        await fetchBalance();
      } finally {
        setIsSwitching(false);
      }
    },
    [context, fetchBalance],
  );

  const balance = useMemo(() => {
    if (!nativeBalance) return null;
    const value = Number.parseFloat(nativeBalance);
    const formatted = Number.isFinite(value) ? `${value.toFixed(4)} ${chain.symbol}` : `${nativeBalance} ${chain.symbol}`;
    return {
      value: nativeBalance,
      formatted,
      symbol: chain.symbol,
    };
  }, [nativeBalance, chain.symbol]);

  return {
    address: context.address,
    chain,
    chainId: context.chainId,
    status: context.isConnected ? "connected" : "disconnected",
    isConnected: context.isConnected,
    isConnecting: context.isConnecting,
    isDisconnecting: false,
    isSwitching,
    connect,
    disconnect,
    switchChain,
    connectors: context.connectors,
    chains: context.chains,
    error: context.error || balanceError,
    balance,
    balanceQuery: {
      data: balance,
      isFetching: isBalanceLoading,
      error: balanceError,
      refetch: fetchBalance,
    },
    refreshBalance: fetchBalance,
    getSigner: context.getSigner,
  };
}

export default useWallet;
