import tokenAbi from "@/contracts/eut-token.json";
import {
  createContract,
  formatUnitsValue,
  getBrowserProvider,
  getJsonRpcProvider,
  parseUnitsValue,
} from "@/lib/ethers-client.js";

const TOKEN_DECIMALS = Number.parseInt(import.meta.env.VITE_TOKEN_DECIMALS ?? "18", 10);
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS?.trim();
const RPC_URL = import.meta.env.VITE_RPC_URL?.trim();

const ensureTokenAddress = () => {
  if (!TOKEN_ADDRESS) {
    throw new Error("VITE_TOKEN_ADDRESS is not configured.");
  }
  return TOKEN_ADDRESS;
};

const createReadProvider = async () => {
  if (RPC_URL) {
    return getJsonRpcProvider(RPC_URL);
  }
  if (typeof window !== "undefined" && window.ethereum) {
    return getBrowserProvider(window.ethereum);
  }
  throw new Error("No RPC provider available. Configure VITE_RPC_URL or use a browser wallet.");
};

export const getTokenMetadata = async () => {
  const provider = await createReadProvider();
  const contract = await createContract(ensureTokenAddress(), tokenAbi, provider);
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    contract.name?.().catch(() => "EUT Token"),
    contract.symbol?.().catch(() => "EUT"),
    contract.decimals?.().catch(() => TOKEN_DECIMALS),
    contract.totalSupply?.().catch(() => null),
  ]);

  return {
    name,
    symbol,
    decimals: Number(decimals ?? TOKEN_DECIMALS),
    totalSupply: totalSupply
      ? await formatUnitsValue(totalSupply, Number(decimals ?? TOKEN_DECIMALS))
      : null,
  };
};

export const readTokenBalance = async (address) => {
  if (!address) {
    throw new Error("Address is required to fetch token balance.");
  }
  const provider = await createReadProvider();
  const contract = await createContract(ensureTokenAddress(), tokenAbi, provider);
  const balance = await contract.balanceOf(address);
  return formatUnitsValue(balance, TOKEN_DECIMALS);
};

export const executeWithSigner = async (signerFactory, callback) => {
  if (!signerFactory) {
    throw new Error("Signer factory is not available. Connect a wallet first.");
  }
  const signer = await signerFactory();
  if (!signer) {
    throw new Error("Unable to access signer from the connected wallet.");
  }
  const contract = await createContract(ensureTokenAddress(), tokenAbi, signer);
  const tx = await callback(contract);
  return tx.wait?.() ?? tx;
};

export const transferTokens = async ({ signerFactory, to, amount }) => {
  if (!to) throw new Error("Recipient address is required for transfer.");
  if (!amount) throw new Error("Amount is required for transfer.");
  return executeWithSigner(signerFactory, async (contract) => {
    const value = await parseUnitsValue(String(amount), TOKEN_DECIMALS);
    return contract.transfer(to, value);
  });
};

export const approveTokens = async ({ signerFactory, spender, amount }) => {
  if (!spender) throw new Error("Spender address is required for approval.");
  if (amount === undefined || amount === null) throw new Error("Approval amount is required.");
  return executeWithSigner(signerFactory, async (contract) => {
    const value = await parseUnitsValue(String(amount), TOKEN_DECIMALS);
    return contract.approve(spender, value);
  });
};

export const mintTokens = async ({ signerFactory, to, amount }) => {
  if (!to) throw new Error("Destination address is required for mint.");
  if (!amount) throw new Error("Amount is required for mint.");
  return executeWithSigner(signerFactory, async (contract) => {
    const value = await parseUnitsValue(String(amount), TOKEN_DECIMALS);
    return contract.mint(to, value);
  });
};

export const burnTokens = async ({ signerFactory, amount }) => {
  if (!amount) throw new Error("Amount is required for burn.");
  return executeWithSigner(signerFactory, async (contract) => {
    const value = await parseUnitsValue(String(amount), TOKEN_DECIMALS);
    return contract.burn(value);
  });
};
