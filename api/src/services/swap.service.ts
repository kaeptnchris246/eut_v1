import { AuthenticatedUser } from "../middlewares/auth.js";
import { badRequest, forbidden } from "../utils/errors.js";
import { TOKEN_RATE_SCALE, TokenDefinition, getTokenByAddress } from "./token-registry.service.js";

const SWAP_POOL_ADDRESS = process.env.SWAP_POOL_ADDRESS?.trim();
const SWAP_POOL_FEE_BPS = Number.parseInt(
  process.env.SWAP_POOL_FEE_BPS ?? process.env.VITE_SWAP_POOL_FEE_BPS ?? "0",
  10,
);

const PRIVILEGED_ROLES = new Set(["admin", "spv_manager"]);

const normaliseRole = (role: string | undefined) => role?.toLowerCase() ?? "investor";

const ensureSwapPoolConfigured = () => {
  if (!SWAP_POOL_ADDRESS) {
    throw badRequest("SWAP_POOL_ADDRESS is not configured");
  }
  return SWAP_POOL_ADDRESS;
};

const pow10 = (decimals: number): bigint => {
  let result = 1n;
  for (let i = 0; i < decimals; i += 1) {
    result *= 10n;
  }
  return result;
};

const parsePositiveAmount = (amount: string, decimals: number) => {
  const trimmed = amount?.trim();
  if (!trimmed) {
    throw badRequest("Amount is required");
  }
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw badRequest("Amount must be a positive number");
  }
  const [wholePart, fractionPart = ""] = trimmed.split(".");
  const scale = pow10(decimals);
  let result = BigInt(wholePart) * scale;
  if (decimals > 0) {
    const fraction = fractionPart.slice(0, decimals).padEnd(decimals, "0");
    if (fraction) {
      result += BigInt(fraction);
    }
  }
  if (result <= 0) {
    throw badRequest("Amount must be greater than zero");
  }
  return result;
};

const formatAmount = (value: bigint, decimals: number) => {
  if (decimals === 0) {
    return value.toString();
  }
  const scale = pow10(decimals);
  const whole = value / scale;
  const fraction = value % scale;
  if (fraction === 0n) {
    return whole.toString();
  }
  const fractionString = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole.toString()}.${fractionString}`;
};

const ensureSecurityPermissions = (
  token: TokenDefinition | undefined,
  walletAddress: string,
  user: AuthenticatedUser,
) => {
  if (!token || token.type !== "security") {
    return;
  }
  if (!walletAddress) {
    throw badRequest("walletAddress is required for security token swaps");
  }
  const normalisedWallet = walletAddress.toLowerCase();
  if (token.allowlist.length > 0) {
    if (!token.allowlist.includes(normalisedWallet)) {
      throw forbidden("Wallet address is not authorised for this security token");
    }
    return;
  }
  if (!PRIVILEGED_ROLES.has(normaliseRole(user.role))) {
    throw forbidden("User role is not authorised to trade this security token");
  }
};

const resolveTokens = (fromAddress: string, toAddress: string) => {
  const fromToken = getTokenByAddress(fromAddress);
  const toToken = getTokenByAddress(toAddress);
  if (!fromToken || !toToken) {
    throw badRequest("Unknown token address provided");
  }
  if (fromToken.address.toLowerCase() === toToken.address.toLowerCase()) {
    throw badRequest("Select two different tokens for swap");
  }
  if (
    !(
      (fromToken.type === "utility" && toToken.type === "security") ||
      (fromToken.type === "security" && toToken.type === "utility")
    )
  ) {
    throw badRequest("Swaps are only supported between the EUT utility token and configured security tokens");
  }
  return { fromToken, toToken };
};

const formatFeeBps = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

export interface SwapRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  walletAddress: string;
  user: AuthenticatedUser;
}

export const stageSwapTransaction = async ({
  fromToken: fromAddress,
  toToken: toAddress,
  amount,
  walletAddress,
  user,
}: SwapRequest) => {
  if (!amount) {
    throw badRequest("Amount is required");
  }
  if (!walletAddress) {
    throw badRequest("walletAddress is required");
  }

  const { fromToken, toToken } = resolveTokens(fromAddress, toAddress);
  ensureSecurityPermissions(fromToken.type === "security" ? fromToken : toToken, walletAddress, user);

  const feeBps = formatFeeBps(SWAP_POOL_FEE_BPS);
  const poolAddress = ensureSwapPoolConfigured();
  const direction = fromToken.type === "utility" ? "utility_to_security" : "security_to_utility";
  const utilityToken = fromToken.type === "utility" ? fromToken : toToken;
  const securityToken = fromToken.type === "security" ? fromToken : toToken;

  const amountUnits = parsePositiveAmount(amount, fromToken.decimals);
  const feeUnits = (amountUnits * BigInt(feeBps)) / 10000n;

  if (direction === "utility_to_security") {
    const netUnits = amountUnits - feeUnits;
    const rate = toToken.rate ?? TOKEN_RATE_SCALE;
    const amountOutUnits = rate > 0n ? (netUnits * rate) / TOKEN_RATE_SCALE : 0n;

    return {
      quote: {
        direction,
        amountIn: amount,
        amountOut: formatAmount(amountOutUnits, toToken.decimals),
        fee: formatAmount(feeUnits, fromToken.decimals),
        feeBps,
      },
      transaction: {
        contractAddress: poolAddress,
        method: "swapEutForSpv",
        args: [securityToken.address, amountUnits.toString(), walletAddress],
        value: "0",
        chainId: utilityToken.chainId,
      },
    };
  }

  const rate = fromToken.rate ?? TOKEN_RATE_SCALE;
  if (rate === 0n) {
    throw badRequest("Swap rate for the selected security token is zero");
  }
  const grossEut = (amountUnits * TOKEN_RATE_SCALE) / rate;
  const feeOnEut = (grossEut * BigInt(feeBps)) / 10000n;
  const netEut = grossEut - feeOnEut;

  return {
    quote: {
      direction,
      amountIn: amount,
      amountOut: formatAmount(netEut, toToken.decimals),
      fee: formatAmount(feeOnEut, toToken.decimals),
      feeBps,
    },
    transaction: {
      contractAddress: poolAddress,
      method: "swapSpvForEut",
      args: [securityToken.address, amountUnits.toString(), walletAddress],
      value: "0",
      chainId: utilityToken.chainId,
    },
  };
};
