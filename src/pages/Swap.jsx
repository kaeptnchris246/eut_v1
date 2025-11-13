import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import api from "@/services/api";
import {
  getRegisteredTokens,
  getSwapFeeBps,
} from "@/services/tokenRegistry";
import { formatUnitsValue, parseUnitsValue } from "@/lib/ethers-client.js";
import useWallet from "@/hooks/useWallet";
import { readTokenBalance } from "@/services/contracts";
import { toast } from "sonner";

const toIdentifierList = (tokens) => tokens.map((token) => token.identifier);

const swapSchema = z
  .object({
    from: z.string().min(1, "Select a token to swap"),
    to: z.string().min(1, "Select a token to receive"),
    amount: z
      .string()
      .min(1, "Enter an amount")
      .refine((value) => Number.parseFloat(value) > 0, "Amount must be greater than zero"),
  })
  .refine((data) => data.from !== data.to, {
    message: "Choose two different tokens",
    path: ["to"],
  });

const ONE_ETHER = 1_000000000000000000n;

const formatBalance = (value, symbol) => {
  if (value === undefined || value === null) return "—";
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric)) return `${value} ${symbol}`;
  return `${numeric.toFixed(4)} ${symbol}`;
};

function Swap() {
  const [tokens] = useState(() => getRegisteredTokens());
  const utilityToken = useMemo(
    () => tokens.find((token) => token.type === "utility") ?? tokens[0],
    [tokens],
  );
  const firstSecurityToken = useMemo(
    () => tokens.find((token) => token.type === "security" && token.identifier !== utilityToken?.identifier),
    [tokens, utilityToken],
  );
  const feeBps = useMemo(() => getSwapFeeBps(), []);
  const { address, isConnected } = useWallet();

  const form = useForm({
    resolver: zodResolver(swapSchema),
    defaultValues: {
      from: utilityToken?.identifier ?? "",
      to:
        utilityToken && firstSecurityToken && utilityToken.identifier !== firstSecurityToken.identifier
          ? firstSecurityToken.identifier
          : "",
      amount: "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const fromValue = watch("from");
  const toValue = watch("to");
  const amountValue = watch("amount");

  const findToken = useCallback(
    (identifier) => tokens.find((token) => token.identifier === identifier),
    [tokens],
  );

  const fromToken = useMemo(() => findToken(fromValue) ?? utilityToken ?? null, [findToken, fromValue, utilityToken]);
  const toToken = useMemo(() => findToken(toValue) ?? firstSecurityToken ?? null, [findToken, toValue, firstSecurityToken]);

  const [balances, setBalances] = useState({});
  const [balanceError, setBalanceError] = useState(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [swapPlan, setSwapPlan] = useState(null);

  const refreshBalances = useCallback(async () => {
    if (!address || !fromToken || !toToken) {
      setBalances({});
      setBalanceError(null);
      return;
    }
    const uniqueTokens = toIdentifierList([fromToken, toToken].filter(Boolean)).filter(
      (identifier, index, arr) => arr.indexOf(identifier) === index,
    );
    if (!uniqueTokens.length) {
      setBalances({});
      setBalanceError(null);
      return;
    }
    setIsBalanceLoading(true);
    try {
      const results = await Promise.all(
        uniqueTokens.map(async (identifier) => {
          const token = findToken(identifier);
          if (!token) return [identifier, null];
          try {
            const value = address ? await readTokenBalance(address, token) : null;
            return [identifier, value];
          } catch (error) {
            console.warn("Failed to fetch balance", token, error);
            return [identifier, null];
          }
        }),
      );
      const nextBalances = Object.fromEntries(results);
      setBalances(nextBalances);
      setBalanceError(null);
    } catch (error) {
      setBalanceError(error);
    } finally {
      setIsBalanceLoading(false);
    }
  }, [address, findToken, fromToken, toToken]);

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  useEffect(() => {
    setSwapPlan(null);
  }, [fromValue, toValue, amountValue]);

  useEffect(() => {
    let cancelled = false;
    const calculateQuote = async () => {
      if (!fromToken || !toToken) {
        setQuote(null);
        setQuoteError(null);
        return;
      }
      if (!amountValue) {
        setQuote(null);
        setQuoteError(null);
        return;
      }
      setIsQuoting(true);
      try {
        const amountUnits = await parseUnitsValue(String(amountValue), fromToken.decimals ?? 18);
        if (amountUnits <= 0) {
          setQuote(null);
          setQuoteError(null);
          return;
        }
        const feeUnits = (amountUnits * BigInt(feeBps ?? 0)) / 10000n;
        if (fromToken.type === "utility" && toToken.type === "security") {
          const netUnits = amountUnits - feeUnits;
          const rate = toToken.rate ?? ONE_ETHER;
          const outUnits = rate > 0n ? (netUnits * rate) / ONE_ETHER : 0n;
          const [outFormatted, feeFormatted] = await Promise.all([
            formatUnitsValue(outUnits, toToken.decimals ?? 18),
            formatUnitsValue(feeUnits, fromToken.decimals ?? 18),
          ]);
          if (!cancelled) {
            setQuote({
              direction: "utility_to_security",
              amountOut: outFormatted,
              fee: feeFormatted,
              rate: toToken.rateHint,
            });
            setQuoteError(null);
          }
        } else if (fromToken.type === "security" && toToken.type === "utility") {
          const rate = fromToken.rate ?? ONE_ETHER;
          if (rate === 0n) {
            throw new Error("Swap rate is not configured for the selected security token.");
          }
          const grossEut = (amountUnits * ONE_ETHER) / rate;
          const feeOnEut = (grossEut * BigInt(feeBps ?? 0)) / 10000n;
          const eutNet = grossEut - feeOnEut;
          const [outFormatted, feeFormatted] = await Promise.all([
            formatUnitsValue(eutNet, toToken.decimals ?? 18),
            formatUnitsValue(feeOnEut, toToken.decimals ?? 18),
          ]);
          if (!cancelled) {
            setQuote({
              direction: "security_to_utility",
              amountOut: outFormatted,
              fee: feeFormatted,
              rate: fromToken.rateHint,
            });
            setQuoteError(null);
          }
        } else {
          setQuote(null);
          setQuoteError(new Error("Swaps are only supported between EUT and SPV security tokens."));
        }
      } catch (error) {
        if (!cancelled) {
          setQuote(null);
          setQuoteError(error);
        }
      } finally {
        if (!cancelled) {
          setIsQuoting(false);
        }
      }
    };

    calculateQuote();
    return () => {
      cancelled = true;
    };
  }, [amountValue, feeBps, fromToken, toToken]);

  const handleSwapDirection = () => {
    if (!fromValue && !toValue) return;
    setValue("from", toValue, { shouldValidate: true });
    setValue("to", fromValue, { shouldValidate: true });
  };

  const onSubmit = async (values) => {
    if (!fromToken || !toToken) {
      toast.error("Select tokens before swapping");
      return;
    }
    if (!isConnected || !address) {
      toast.error("Connect a wallet to stage a swap");
      return;
    }

    try {
      const response = await api.stageSwap({
        fromToken: fromToken.address,
        toToken: toToken.address,
        amount: values.amount,
        walletAddress: address,
      });
      setSwapPlan(response);
      toast.success("Swap prepared. Review the transaction details below.");
    } catch (error) {
      toast.error(error?.message ?? "Unable to prepare swap");
    }
  };

  const disableSubmit = !fromToken || !toToken || fromToken.identifier === toToken.identifier;

  if (!utilityToken || !firstSecurityToken) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Token swap</h1>
        <p className="text-muted-foreground">
          Configure at least one utility token and one SPV security token in the environment variables to enable swaps.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Token swap</h1>
        <p className="text-muted-foreground">
          Exchange the EUT utility token against authorised SPV security tokens at the configured pool rate.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Swap configuration</CardTitle>
          <CardDescription>
            Wallet connection {isConnected ? "active" : "required"}. Fee: {feeBps ?? 0} bps on the EUT leg.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from">From token</Label>
                <Select
                  value={fromValue}
                  onValueChange={(value) => {
                    setValue("from", value, { shouldValidate: true });
                    if (value === toValue) {
                      const alternative = tokens.find((token) => token.identifier !== value);
                      if (alternative) {
                        setValue("to", alternative.identifier, { shouldValidate: true });
                      }
                    }
                  }}
                >
                  <SelectTrigger id="from">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.identifier} value={token.identifier} disabled={token.identifier === toValue}>
                        {token.name} ({token.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.from ? <p className="text-sm text-destructive">{errors.from.message}</p> : null}
                <p className="text-xs text-muted-foreground">
                  Balance: {isBalanceLoading ? "Loading…" : formatBalance(balances[fromToken?.identifier], fromToken?.symbol)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">To token</Label>
                <Select
                  value={toValue}
                  onValueChange={(value) => {
                    setValue("to", value, { shouldValidate: true });
                    if (value === fromValue) {
                      const alternative = tokens.find((token) => token.identifier !== value);
                      if (alternative) {
                        setValue("from", alternative.identifier, { shouldValidate: true });
                      }
                    }
                  }}
                >
                  <SelectTrigger id="to">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens.map((token) => (
                      <SelectItem key={token.identifier} value={token.identifier} disabled={token.identifier === fromValue}>
                        {token.name} ({token.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.to ? <p className="text-sm text-destructive">{errors.to.message}</p> : null}
                <p className="text-xs text-muted-foreground">
                  Balance: {isBalanceLoading ? "Loading…" : formatBalance(balances[toToken?.identifier], toToken?.symbol)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({fromToken?.symbol ?? "Token"})</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                min="0"
                value={amountValue}
                onChange={(event) => setValue("amount", event.target.value, { shouldValidate: true })}
              />
              {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={handleSwapDirection} disabled={!fromToken || !toToken}>
                Swap direction
              </Button>
              <Button type="submit" disabled={disableSubmit || isSubmitting}>
                {isSubmitting ? "Preparing…" : "Prepare swap"}
              </Button>
              {!isConnected ? (
                <span className="text-sm text-muted-foreground">Connect a wallet to execute swaps.</span>
              ) : null}
            </div>
          </form>

          <Separator />

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Quote</h2>
            {isQuoting ? <p className="text-muted-foreground">Calculating quote…</p> : null}
            {!isQuoting && quote ? (
              <div className="rounded-md border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated output</span>
                  <span className="font-medium">{quote.amountOut ?? "—"} {toToken?.symbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Estimated fee</span>
                  <span>{quote.fee ?? "0"} {fromToken?.type === "utility" ? fromToken?.symbol : toToken?.symbol}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Indicative rate</span>
                  <span>{quote.rate ?? "—"}</span>
                </div>
              </div>
            ) : null}
            {!isQuoting && !quote && quoteError ? (
              <p className="text-sm text-destructive">{quoteError.message ?? "Unable to calculate quote"}</p>
            ) : null}
          </div>

          {balanceError ? (
            <p className="text-sm text-destructive">{balanceError.message ?? "Unable to load balances"}</p>
          ) : null}
        </CardContent>
      </Card>

      {swapPlan ? (
        <Card>
          <CardHeader>
            <CardTitle>Prepared transaction</CardTitle>
            <CardDescription>Sign the payload in your wallet to execute the swap.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-1">
              <span className="text-muted-foreground">Contract</span>
              <span className="font-mono text-xs">{swapPlan.transaction?.contractAddress ?? "—"}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-muted-foreground">Method</span>
              <span className="font-mono text-xs">{swapPlan.transaction?.method ?? "swapEutForSpv"}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-muted-foreground">Arguments</span>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
{JSON.stringify(swapPlan.transaction?.args ?? [], null, 2)}
              </pre>
            </div>
            <div className="grid gap-1">
              <span className="text-muted-foreground">Amount in</span>
              <span>{swapPlan.quote?.amountIn ?? amountValue} {fromToken?.symbol}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-muted-foreground">Amount out</span>
              <span>{swapPlan.quote?.amountOut ?? quote?.amountOut ?? "—"} {toToken?.symbol}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export default Swap;
