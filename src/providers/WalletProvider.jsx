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

const DEFAULT_CHAIN_ID = Number.parseInt(import.meta.env.VITE_CHAIN_ID ?? "1", 10);
const CHAIN_NAME = import.meta.env.VITE_CHAIN_NAME?.trim() || `Chain ${DEFAULT_CHAIN_ID}`;
const CHAIN_SYMBOL = import.meta.env.VITE_CHAIN_SYMBOL?.trim() || "ETH";
const RPC_URL = import.meta.env.VITE_RPC_URL?.trim() || "";
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() || "";

const CHAINS = [
  {
    id: DEFAULT_CHAIN_ID,
    name: CHAIN_NAME,
    symbol: CHAIN_SYMBOL,
    rpcUrl: RPC_URL,
  },
];

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

  if (RPC_URL) {
    connectors.push({
      id: "coinbase",
      name: "Coinbase Wallet",
      ready: true,
    });
  }

  if (RPC_URL && WALLETCONNECT_PROJECT_ID) {
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
  if (!RPC_URL) {
    throw new Error("VITE_RPC_URL is required for WalletConnect.");
  }
  if (!WALLETCONNECT_PROJECT_ID) {
    throw new Error("VITE_WALLETCONNECT_PROJECT_ID is missing.");
  }

  const module = await import(
    /* @vite-ignore */ "https://esm.sh/@walletconnect/ethereum-provider@2.17.0?bundle"
  );
  const EthereumProvider = module?.default ?? module?.EthereumProvider ?? module;
  const provider = await EthereumProvider.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    chains: [DEFAULT_CHAIN_ID],
    rpcMap: { [DEFAULT_CHAIN_ID]: RPC_URL },
    showQrModal: true,
  });
  const accounts = await provider.enable();
  const chainId = parseChainId(provider.chainId ?? DEFAULT_CHAIN_ID);
  return { provider, accounts, chainId };
}

async function connectWithCoinbase() {
  if (!RPC_URL) {
    throw new Error("VITE_RPC_URL is required for Coinbase Wallet.");
  }
  const module = await import(
    /* @vite-ignore */ "https://esm.sh/@coinbase/wallet-sdk@3.10.3?bundle"
  );
  const CoinbaseWalletSDK = module?.default ?? module?.CoinbaseWalletSDK ?? module;
  if (!CoinbaseWalletSDK) {
    throw new Error("Unable to load Coinbase Wallet SDK.");
  }
  const sdk = new CoinbaseWalletSDK({ appName: "EUT Platform" });
  const provider = sdk.makeWeb3Provider({ rpcUrl: RPC_URL, chainId: DEFAULT_CHAIN_ID });
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
    setState((prev) => ({
      ...INITIAL_STATE,
      chainId: prev.chainId ?? DEFAULT_CHAIN_ID,
    }));
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
      setState((prev) => ({
        ...prev,
        chainId: parseChainId(nextChain),
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

        setState({
          address: connection.accounts[0],
          chainId: connection.chainId ?? DEFAULT_CHAIN_ID,
          chainName: CHAIN_NAME,
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
      await state.provider.request?.({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChain }],
      });
      setState((prev) => ({ ...prev, chainId }));
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
