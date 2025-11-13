import tokenAbi from "@/contracts/eut-token.json";
import {
  createContract,
  formatUnitsValue,
  getBrowserProvider,
  getJsonRpcProvider,
  parseUnitsValue,
} from "@/lib/ethers-client.js";
import { getSupportedChains, getUtilityToken } from "@/services/tokenRegistry";

const RPC_URL = import.meta.env.VITE_RPC_URL?.trim();

const resolveToken = (tokenOverride) => tokenOverride ?? getUtilityToken();

const ensureToken = (tokenOverride) => {
  const token = resolveToken(tokenOverride);
  if (!token?.address) {
    throw new Error("Token configuration is missing an address.");
  }
  return token;
};

const findRpcUrlForToken = (token) => {
  const chains = getSupportedChains();
  const match = chains.find((chain) => chain.id === token?.chainId);
  return match?.rpcUrl?.trim() || RPC_URL || "";
};

const createReadProvider = async (token) => {
  const rpcEndpoint = findRpcUrlForToken(token);
  if (rpcEndpoint) {
    return getJsonRpcProvider(rpcEndpoint);
  }
  if (typeof window !== "undefined" && window.ethereum) {
    return getBrowserProvider(window.ethereum);
  }
  throw new Error("No RPC provider available. Configure VITE_RPC_URL or use a browser wallet.");
};

export const getTokenMetadata = async (tokenOverride) => {
  const token = ensureToken(tokenOverride);
  const provider = await createReadProvider(token);
  const contract = await createContract(token.address, tokenAbi, provider);
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.name?.().catch(() => token.name ?? "Token"),
    contract.symbol?.().catch(() => token.symbol ?? "TOK"),
    contract.decimals?.().catch(() => token.decimals ?? 18),
    contract.totalSupply?.().catch(() => null),
  ]);

  const decimalsNumber = Number(decimals ?? token.decimals ?? 18);

  return {
    name,
    symbol,
    decimals: decimalsNumber,
    totalSupply: totalSupply ? await formatUnitsValue(totalSupply, decimalsNumber) : null,
  };
};

export const readTokenBalance = async (address, tokenOverride) => {
  if (!address) {
    throw new Error("Address is required to fetch token balance.");
  }
  const token = ensureToken(tokenOverride);
  const provider = await createReadProvider(token);
  const contract = await createContract(token.address, tokenAbi, provider);
  const balance = await contract.balanceOf(address);
  return formatUnitsValue(balance, token.decimals ?? 18);
};

export const executeWithSigner = async (signerFactory, callback, tokenOverride) => {
  if (!signerFactory) {
    throw new Error("Signer factory is not available. Connect a wallet first.");
  }
  const signer = await signerFactory();
  if (!signer) {
    throw new Error("Unable to access signer from the connected wallet.");
  }
  const token = ensureToken(tokenOverride);
  const contract = await createContract(token.address, tokenAbi, signer);
  const tx = await callback(contract, token);
  return tx.wait?.() ?? tx;
};

export const transferTokens = async ({ signerFactory, to, amount, token }) => {
  if (!to) throw new Error("Recipient address is required for transfer.");
  if (!amount) throw new Error("Amount is required for transfer.");
  return executeWithSigner(signerFactory, async (contract, definition) => {
    const value = await parseUnitsValue(String(amount), definition.decimals ?? 18);
    return contract.transfer(to, value);
  }, token);
};

export const approveTokens = async ({ signerFactory, spender, amount, token }) => {
  if (!spender) throw new Error("Spender address is required for approval.");
  if (amount === undefined || amount === null) throw new Error("Approval amount is required.");
  return executeWithSigner(signerFactory, async (contract, definition) => {
    const value = await parseUnitsValue(String(amount), definition.decimals ?? 18);
    return contract.approve(spender, value);
  }, token);
};

export const mintTokens = async ({ signerFactory, to, amount, token }) => {
  if (!to) throw new Error("Destination address is required for mint.");
  if (!amount) throw new Error("Amount is required for mint.");
  return executeWithSigner(signerFactory, async (contract, definition) => {
    const value = await parseUnitsValue(String(amount), definition.decimals ?? 18);
    return contract.mint(to, value);
  }, token);
};

export const burnTokens = async ({ signerFactory, amount, token }) => {
  if (!amount) throw new Error("Amount is required for burn.");
  return executeWithSigner(signerFactory, async (contract, definition) => {
    const value = await parseUnitsValue(String(amount), definition.decimals ?? 18);
    return contract.burn(value);
  }, token);
};
