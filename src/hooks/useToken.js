import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveTokens,
  burnTokens,
  getTokenMetadata,
  mintTokens,
  readTokenBalance,
  transferTokens,
} from "@/services/contracts";
import useWallet from "@/hooks/useWallet";

function useToken() {
  const { address, isConnected, getSigner } = useWallet();
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getTokenMetadata()
      .then((result) => {
        if (!active) return;
        setMetadata(result);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const balanceOf = useCallback(
    async (walletAddress = address) => {
      if (!walletAddress) {
        throw new Error("Wallet address is required to fetch balance.");
      }
      return readTokenBalance(walletAddress);
    },
    [address],
  );

  const transfer = useCallback(
    async ({ to, amount }) =>
      transferTokens({ signerFactory: getSigner, to, amount }),
    [getSigner],
  );

  const approve = useCallback(
    async ({ spender, amount }) =>
      approveTokens({ signerFactory: getSigner, spender, amount }),
    [getSigner],
  );

  const mint = useCallback(
    async ({ to, amount }) => mintTokens({ signerFactory: getSigner, to, amount }),
    [getSigner],
  );

  const burn = useCallback(
    async ({ amount }) => burnTokens({ signerFactory: getSigner, amount }),
    [getSigner],
  );

  const ready = useMemo(
    () => Boolean(metadata?.name && metadata?.symbol && !loading && !error),
    [metadata, loading, error],
  );

  return {
    address,
    isConnected,
    metadata,
    loading,
    error,
    balanceOf,
    transfer,
    approve,
    mint,
    burn,
    ready,
  };
}

export default useToken;
