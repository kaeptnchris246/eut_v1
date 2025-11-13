import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import useWallet from "@/hooks/useWallet";
import { shortenAddress } from "@/utils/wallet";
import { toast } from "sonner";

function WalletConnector() {
  const {
    address,
    chain,
    connect,
    connectors,
    disconnect,
    isConnected,
    isConnecting,
    isDisconnecting,
    isSwitching,
    chains,
    switchChain,
    balance,
    error,
  } = useWallet();

  const availableConnectors = useMemo(
    () => connectors.filter((connector) => connector.ready !== false),
    [connectors],
  );

  const handleConnect = useCallback(
    async (connectorId) => {
      try {
        await connect(connectorId);
      } catch (err) {
        toast.error(err?.message ?? "Unable to connect wallet");
      }
    },
    [connect],
  );

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
    } catch (err) {
      toast.error(err?.message ?? "Unable to disconnect wallet");
    }
  }, [disconnect]);

  const handleCopy = useCallback(async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  }, [address]);

  const handleSwitchChain = useCallback(
    async (targetId) => {
      try {
        await switchChain(targetId);
        toast.success("Network switched");
      } catch (err) {
        toast.error(err?.message ?? "Unable to switch network");
      }
    },
    [switchChain],
  );

  if (!availableConnectors.length) {
    return null;
  }

  if (!isConnected) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isConnecting}>Connect Wallet</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Select a wallet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableConnectors.map((connector) => (
            <DropdownMenuItem
              key={connector.id}
              onSelect={() => handleConnect(connector.id)}
              disabled={isConnecting || connector.ready === false}
            >
              {connector.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isDisconnecting || isSwitching}>
          <span className="mr-2 flex items-center gap-2">
            <span>{shortenAddress(address)}</span>
            {chain?.name && <Badge variant="secondary">{chain.name}</Badge>}
          </span>
          {balance?.formatted && (
            <span className="text-muted-foreground text-xs">{balance.formatted}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Your wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleCopy}>Copy address</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Switch network</DropdownMenuLabel>
        {chains.map((item) => (
          <DropdownMenuItem
            key={item.id}
            disabled={item.id === chain?.id || isSwitching}
            onSelect={() => handleSwitchChain(item.id)}
          >
            {item.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleDisconnect}
          className="text-destructive focus:text-destructive"
        >
          Disconnect
        </DropdownMenuItem>
        {error && (
          <div className="px-2 py-1 text-xs text-destructive">{error.message ?? String(error)}</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WalletConnector;
