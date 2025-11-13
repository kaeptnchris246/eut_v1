export type TokenType = "utility" | "security";

export interface TokenDefinition {
  identifier: string;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  type: TokenType;
  chainId: number;
  rate: bigint;
  allowlist: string[];
}

const ONE_ETHER = 1_000000000000000000n;

type TokenRegistry = {
  tokens: TokenDefinition[];
  byAddress: Map<string, TokenDefinition>;
  byIdentifier: Map<string, TokenDefinition>;
};

const parseIdentifiers = (): string[] => {
  const raw = process.env.VITE_SPV_TOKEN_IDENTIFIERS ?? "";
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.toUpperCase());
};

const parseDecimals = (value: string | undefined, fallback = 18) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseRate = (value: string | undefined) => {
  try {
    if (!value) return ONE_ETHER;
    const trimmed = value.trim();
    if (!trimmed) return ONE_ETHER;
    const parsed = BigInt(trimmed);
    return parsed > 0n ? parsed : ONE_ETHER;
  } catch (error) {
    console.warn("Invalid token rate", value, error);
    return ONE_ETHER;
  }
};

const parseAllowlist = (value: string | undefined) => {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .filter((entry, index, arr) => arr.indexOf(entry) === index);
};

const parseChainId = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

let registryCache: TokenRegistry | null = null;

const buildRegistry = (): TokenRegistry => {
  const tokens: TokenDefinition[] = [];

  const defaultChainId = parseChainId(process.env.VITE_CHAIN_ID, 1);
  const utilityAddress = process.env.VITE_TOKEN_ADDRESS?.trim();
  if (utilityAddress) {
    tokens.push({
      identifier: "EUT",
      name: process.env.VITE_TOKEN_NAME?.trim() || "EUT Utility Token",
      symbol: process.env.VITE_TOKEN_SYMBOL?.trim() || "EUT",
      address: utilityAddress,
      decimals: parseDecimals(process.env.VITE_TOKEN_DECIMALS, 18),
      type: "utility",
      chainId: parseChainId(process.env.VITE_TOKEN_CHAIN_ID, defaultChainId),
      rate: ONE_ETHER,
      allowlist: [],
    });
  }

  const identifiers = parseIdentifiers();
  identifiers.forEach((identifier) => {
    const address = process.env[`VITE_SPV_TOKEN_ADDRESS_${identifier}`]?.trim();
    if (!address) {
      return;
    }
    tokens.push({
      identifier,
      name: process.env[`VITE_SPV_TOKEN_NAME_${identifier}`]?.trim() || `${identifier} Security Token`,
      symbol: process.env[`VITE_SPV_TOKEN_SYMBOL_${identifier}`]?.trim() || identifier,
      address,
      decimals: parseDecimals(process.env[`VITE_SPV_TOKEN_DECIMALS_${identifier}`], 18),
      type: "security",
      chainId: parseChainId(process.env[`VITE_SPV_TOKEN_CHAIN_${identifier}`], defaultChainId),
      rate: parseRate(process.env[`VITE_SPV_TOKEN_RATE_${identifier}`]),
      allowlist: parseAllowlist(process.env[`SECURITY_TOKEN_WHITELIST_${identifier}`]),
    });
  });

  const byAddress = new Map<string, TokenDefinition>();
  const byIdentifier = new Map<string, TokenDefinition>();
  tokens.forEach((token) => {
    byAddress.set(token.address.toLowerCase(), token);
    byIdentifier.set(token.identifier.toUpperCase(), token);
  });

  return { tokens, byAddress, byIdentifier };
};

const getRegistry = () => {
  if (!registryCache) {
    registryCache = buildRegistry();
  }
  return registryCache;
};

export const refreshRegistry = () => {
  registryCache = buildRegistry();
  return registryCache;
};

export const getTokens = () => getRegistry().tokens;

export const getTokenByAddress = (address: string) => {
  if (!address) return undefined;
  return getRegistry().byAddress.get(address.toLowerCase());
};

export const getTokenByIdentifier = (identifier: string) => {
  if (!identifier) return undefined;
  return getRegistry().byIdentifier.get(identifier.toUpperCase());
};

export const toPublicToken = (token: TokenDefinition) => ({
  identifier: token.identifier,
  name: token.name,
  symbol: token.symbol,
  address: token.address,
  decimals: token.decimals,
  type: token.type,
  chainId: token.chainId,
  rate: token.rate.toString(),
  allowlist: token.allowlist,
});

export const TOKEN_RATE_SCALE = ONE_ETHER;
