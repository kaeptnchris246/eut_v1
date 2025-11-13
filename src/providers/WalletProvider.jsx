import PropTypes from "prop-types";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { getBrowserProvider } from "@/lib/ethers-client.js";
import { getPrimaryChain, getSupportedChains } from "@/services/tokenRegistry";

const SUPPORTED_CHAINS = getSupportedChains();
const PRIMARY_CHAIN = getPrimaryChain() ?? {
  id: Number.parseInt(import.meta.env.VITE_CHAIN_ID ?? "1", 10),
  name: import.meta.env.VITE_CHAIN_NAME?.trim() || "Primary Chain",
  symbol: import.meta.env.VITE_CHAIN_SYMBOL?.trim() || "ETH",
  rpcUrl: import.meta.env.VITE_RPC_URL?.trim() || "",
};

const DEFAULT_CHAIN_ID = PRIMARY_CHAIN.id;
const CHAIN_NAME = PRIMARY_CHAIN.name;
const RPC_URL = PRIMARY_CHAIN.rpcUrl ?? "";
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() || "";

const CHAINS = SUPPORTED_CHAINS.length ? SUPPORTED_CHAINS : [PRIMARY_CHAIN];
const RPC_MAP = CHAINS.reduce((map, chain) => {
  if (chain.rpcUrl) {
    map[chain.id] = chain.rpcUrl;
  }
  return map;
}, {});
const WALLETCONNECT_CHAIN_IDS = CHAINS.map((chain) => chain.id);

const getChainById = (chainId) => CHAINS.find((chain) => chain.id === chainId);

const WalletContext = createContext(null);

const INITIAL_STATE = {
  address: null,
  chainId: DEFAULT_CHAIN_ID,
  chainName: CHAIN_NAME,
  connectorId: null,
  provider: null,
  isConnecting: false,
  error: null,
};

const toHexChainId = (chainId) => `0x${chainId.toString(16)}`;

const parseChainId = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    return Number.parseInt(value, value.startsWith("0x") ? 16 : 10);
  }
  return DEFAULT_CHAIN_ID;
};

const createConnectorList = () => {
  const isBrowser = typeof window !== "undefined";
  const hasInjected = isBrowser && Boolean(window.ethereum);

  const connectors = [
    {
      id: "metamask",
      name: "MetaMask / Injected",
      ready: hasInjected,
    },
  ];

  const hasRpc = Object.keys(RPC_MAP).length > 0 || Boolean(RPC_URL);

  if (hasRpc) {
    connectors.push({
      id: "coinbase",
      name: "Coinbase Wallet",
      ready: true,
    });
  }

  if (hasRpc && WALLETCONNECT_PROJECT_ID && WALLETCONNECT_CHAIN_IDS.length) {
    connectors.push({
      id: "walletconnect",
      name: "WalletConnect",
      ready: true,
    });
  }

  return connectors;
};

async function connectWithInjected() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet detected.");
  }
  const provider = window.ethereum;
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const chainHex = await provider.request({ method: "eth_chainId" });
  return {
    provider,
    accounts,
    chainId: parseChainId(chainHex),
  };
}

async function connectWithWalletConnect() {
  if (!WALLETCONNECT_PROJECT_ID) {
    throw new Error("VITE_WALLETCONNECT_PROJECT_ID is missing.");
  }

  const rpcEntries = Object.keys(RPC_MAP).length ? RPC_MAP : RPC_URL ? { [DEFAULT_CHAIN_ID]: RPC_URL } : {};
  const chainIds = WALLETCONNECT_CHAIN_IDS.length ? WALLETCONNECT_CHAIN_IDS : [DEFAULT_CHAIN_ID];

  if (!Object.keys(rpcEntries).length) {
    throw new Error("Configure at least one RPC endpoint to enable WalletConnect.");
  }

  const module = await import(
    /* @vite-ignore */ "https://esm.sh/@walletconnect/ethereum-provider@2.17.0?bundle"
  );
  const EthereumProvider = module?.default ?? module?.EthereumProvider ?? module;
  const provider = await EthereumProvider.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: chainIds,
    rpcMap: rpcEntries,
    showQrModal: true,
  });
  const accounts = await provider.enable();
  const chainId = parseChainId(provider.chainId ?? DEFAULT_CHAIN_ID);
  return { provider, accounts, chainId };
}

async function connectWithCoinbase() {
  const rpcUrl = RPC_MAP[DEFAULT_CHAIN_ID] ?? RPC_URL;
  if (!rpcUrl) {
    throw new Error("Configure an RPC endpoint to use Coinbase Wallet.");
  }
  const module = await import(
    /* @vite-ignore */ "https://esm.sh/@coinbase/wallet-sdk@3.10.3?bundle"
  );
  const CoinbaseWalletSDK = module?.default ?? module?.CoinbaseWalletSDK ?? module;
  if (!CoinbaseWalletSDK) {
    throw new Error("Unable to load Coinbase Wallet SDK.");
  }
  const sdk = new CoinbaseWalletSDK({ appName: "EUT Platform" });
  const provider = sdk.makeWeb3Provider({ rpcUrl, chainId: DEFAULT_CHAIN_ID });
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  return { provider, accounts, chainId: DEFAULT_CHAIN_ID };
}

const CONNECTORS = createConnectorList();

export function WalletProvider({ children }) {
  const [state, setState] = useState(INITIAL_STATE);
  const cleanupRef = useRef(null);

  const resetState = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setState({
      ...INITIAL_STATE,
      chainId: DEFAULT_CHAIN_ID,
      chainName: CHAIN_NAME,
    });
  }, []);

  const attachListeners = useCallback((provider) => {
    if (!provider?.on) {
      return () => {};
    }

    const handleAccountsChanged = (accounts) => {
      setState((prev) => ({
        ...prev,
        address: accounts?.[0] ?? null,
      }));
    };

    const handleChainChanged = (nextChain) => {
      const parsed = parseChainId(nextChain);
      const metadata = getChainById(parsed);
      setState((prev) => ({
        ...prev,
        chainId: parsed,
        chainName: metadata?.name ?? CHAIN_NAME,
      }));
    };

    const handleDisconnect = () => {
      resetState();
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    provider.on("disconnect", handleDisconnect);

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
      provider.removeListener?.("disconnect", handleDisconnect);
    };
  }, [resetState]);

const connect = useCallback(
    async (connectorId) => {
      setState((prev) => ({ ...prev, isConnecting: true, error: null }));
      try {
        let connection;
        if (connectorId === "metamask") {
          connection = await connectWithInjected();
        } else if (connectorId === "walletconnect") {
          connection = await connectWithWalletConnect();
        } else if (connectorId === "coinbase") {
          connection = await connectWithCoinbase();
        } else {
          throw new Error(`Unknown connector: ${connectorId}`);
        }

        if (!connection.accounts?.length) {
          throw new Error("No accounts returned from wallet.");
        }

        if (cleanupRef.current) {
          cleanupRef.current();
        }
        cleanupRef.current = attachListeners(connection.provider);

        const activeChainId = connection.chainId ?? DEFAULT_CHAIN_ID;
        const chainMeta = getChainById(activeChainId);
        setState({
          address: connection.accounts[0],
          chainId: activeChainId,
          chainName: chainMeta?.name ?? CHAIN_NAME,
          connectorId,
          provider: connection.provider,
          isConnecting: false,
          error: null,
        });
      } catch (err) {
        console.error("Wallet connection failed", err);
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
        setState((prev) => ({ ...prev, isConnecting: false, error: err }));
        throw err;
      }
    },
    [attachListeners],
  );

  const disconnect = useCallback(async () => {
    const { connectorId, provider } = state;
    try {
      if (connectorId === "walletconnect" && provider?.disconnect) {
        await provider.disconnect();
      }
      if (connectorId === "coinbase") {
        provider?.disconnect?.();
        provider?.close?.();
      }
    } catch (err) {
      console.warn("Wallet disconnect warning", err);
    } finally {
      resetState();
    }
  }, [resetState, state]);

  const switchChain = useCallback(
    async (chainId) => {
      if (!state.provider) {
        throw new Error("Connect a wallet before switching chains.");
      }
      const hexChain = toHexChainId(chainId);
      try {
        await state.provider.request?.({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: hexChain }],
        });
      } catch (err) {
        const metadata = getChainById(chainId);
        if (err?.code === 4902 && metadata?.rpcUrl) {
          await state.provider.request?.({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexChain,
                chainName: metadata.name,
                nativeCurrency: {
                  name: metadata.symbol ?? metadata.name,
                  symbol: metadata.symbol ?? "ETH",
                  decimals: 18,
                },
                rpcUrls: [metadata.rpcUrl],
              },
            ],
          });
          await state.provider.request?.({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: hexChain }],
          });
        } else {
          throw err;
        }
      }
      const metadata = getChainById(chainId);
      setState((prev) => ({
        ...prev,
        chainId,
        chainName: metadata?.name ?? CHAIN_NAME,
      }));
    },
    [state.provider],
  );

  const getSigner = useCallback(async () => {
    if (!state.provider) {
      throw new Error("Wallet is not connected.");
    }
    const provider = await getBrowserProvider(state.provider);
    return provider.getSigner();
  }, [state.provider]);

  const value = useMemo(
    () => ({
      address: state.address,
      chainId: state.chainId,
      chainName: state.chainName,
      connectorId: state.connectorId,
      isConnected: Boolean(state.address),
      isConnecting: state.isConnecting,
      error: state.error,
      connectors: CONNECTORS,
      chains: CHAINS,
      connect,
      disconnect,
      switchChain,
      getSigner,
      provider: state.provider,
    }),
    [state, connect, disconnect, switchChain, getSigner],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

WalletProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
};

export default WalletProvider;
