const env = import.meta.env;

const PRIMARY_CHAIN_ID = Number.parseInt(env.VITE_CHAIN_ID ?? "1", 10);
const PRIMARY_CHAIN_NAME = env.VITE_CHAIN_NAME?.trim() || `Chain ${PRIMARY_CHAIN_ID}`;
const PRIMARY_CHAIN_SYMBOL = env.VITE_CHAIN_SYMBOL?.trim() || "ETH";
const PRIMARY_RPC_URL = env.VITE_RPC_URL?.trim() || "";

const parseAdditionalChains = () => {
  const definition = env.VITE_ADDITIONAL_CHAINS?.trim();
  if (!definition) return [];
  return definition
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [id, name, symbol, rpcUrl] = entry.split(":");
      const chainId = Number.parseInt(id ?? "", 10);
      if (!Number.isFinite(chainId)) {
        return null;
      }
      return {
        id: chainId,
        name: (name ?? `Chain ${chainId}`).trim(),
        symbol: (symbol ?? "ETH").trim(),
        rpcUrl: rpcUrl?.trim() ?? "",
      };
    })
    .filter(Boolean)
    .filter((chain, index, self) => self.findIndex((item) => item.id === chain.id) === index);
};

const CHAINS = Object.freeze([
  Object.freeze({ id: PRIMARY_CHAIN_ID, name: PRIMARY_CHAIN_NAME, symbol: PRIMARY_CHAIN_SYMBOL, rpcUrl: PRIMARY_RPC_URL }),
  ...parseAdditionalChains().map((chain) => Object.freeze(chain)),
]);

const parseIdentifiers = () => {
  const raw = env.VITE_SPV_TOKEN_IDENTIFIERS ?? "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.toUpperCase());
};

const parseDecimals = (value, fallback = 18) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseRate = (value) => {
  try {
    if (!value) return 0n;
    const trimmed = value.toString().trim();
    if (!trimmed) return 0n;
    return BigInt(trimmed);
  } catch (error) {
    console.warn("Invalid token rate", value, error);
    return 0n;
  }
};

const formatFixed = (value, decimals = 18) => {
  if (value === 0n) return "0";
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const base = absolute.toString().padStart(decimals + 1, "0");
  const integer = base.slice(0, -decimals) || "0";
  const fractionRaw = base.slice(-decimals).replace(/0+$/, "");
  const formatted = fractionRaw ? `${integer}.${fractionRaw}` : integer;
  return negative ? `-${formatted}` : formatted;
};

const parseAllowlist = (value) => {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.toLowerCase())
    .filter((item, index, self) => self.indexOf(item) === index);
};

const toNumberRate = (rate) => {
  if (rate === 0n) return 0;
  const asNumber = Number(rate) / 1e18;
  return Number.isFinite(asNumber) ? asNumber : 0;
};

const buildTokens = () => {
  const tokens = [];
  const utilityAddress = env.VITE_TOKEN_ADDRESS?.trim();
  if (utilityAddress) {
    const rate = 1_000000000000000000n;
    tokens.push(
      Object.freeze({
        identifier: "EUT",
        name: env.VITE_TOKEN_NAME?.trim() || "EUT Utility Token",
        symbol: env.VITE_TOKEN_SYMBOL?.trim() || "EUT",
        address: utilityAddress,
        decimals: parseDecimals(env.VITE_TOKEN_DECIMALS, 18),
        type: "utility",
        chainId: CHAINS[0]?.id ?? PRIMARY_CHAIN_ID,
        rate,
        rateHint: formatFixed(rate),
        rateFloat: toNumberRate(rate),
        allowlist: Object.freeze([]),
      }),
    );
  }

  const identifiers = parseIdentifiers();
  identifiers.forEach((identifier) => {
    const address = env[`VITE_SPV_TOKEN_ADDRESS_${identifier}`]?.trim();
    if (!address) {
      return;
    }
    const rate = parseRate(env[`VITE_SPV_TOKEN_RATE_${identifier}`] ?? "1000000000000000000");
    const chainId = Number.parseInt(env[`VITE_SPV_TOKEN_CHAIN_${identifier}`] ?? "", 10);
    const allowlist = parseAllowlist(env[`SECURITY_TOKEN_WHITELIST_${identifier}`]);
    tokens.push(
      Object.freeze({
        identifier,
        name: env[`VITE_SPV_TOKEN_NAME_${identifier}`]?.trim() || `${identifier} Security Token`,
        symbol: env[`VITE_SPV_TOKEN_SYMBOL_${identifier}`]?.trim() || identifier,
        address,
        decimals: parseDecimals(env[`VITE_SPV_TOKEN_DECIMALS_${identifier}`], 18),
        type: "security",
        chainId: Number.isFinite(chainId) ? chainId : CHAINS[0]?.id ?? PRIMARY_CHAIN_ID,
        rate,
        rateHint: formatFixed(rate),
        rateFloat: toNumberRate(rate),
        allowlist: Object.freeze(allowlist),
      }),
    );
  });

  return Object.freeze(tokens);
};

const TOKENS = buildTokens();

export const getSupportedChains = () => CHAINS;
export const getPrimaryChain = () => CHAINS[0];
export const getRegisteredTokens = () => TOKENS;
export const getUtilityToken = () => TOKENS.find((token) => token.type === "utility") ?? null;
export const getSecurityTokens = () => TOKENS.filter((token) => token.type === "security");
export const findTokenByAddress = (address) => {
  if (!address) return undefined;
  const target = address.toLowerCase();
  return TOKENS.find((token) => token.address.toLowerCase() === target);
};
export const findTokenByIdentifier = (identifier) => {
  if (!identifier) return undefined;
  return TOKENS.find((token) => token.identifier === identifier.toUpperCase());
};
export const listSwapPairs = () => {
  const utility = getUtilityToken();
  if (!utility) return [];
  return getSecurityTokens().map((token) => ({ from: utility, to: token }));
};

export const getSwapFeeBps = () => {
  const frontendFee = Number.parseInt(env.VITE_SWAP_POOL_FEE_BPS ?? env.SWAP_POOL_FEE_BPS ?? "0", 10);
  return Number.isFinite(frontendFee) ? frontendFee : 0;
};

export default {
  getSupportedChains,
  getPrimaryChain,
  getRegisteredTokens,
  getUtilityToken,
  getSecurityTokens,
  findTokenByAddress,
  findTokenByIdentifier,
  listSwapPairs,
  getSwapFeeBps,
};
