import { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/StatCard";
import Table from "@/components/Table";
import useToken from "@/hooks/useToken";
import useWallet from "@/hooks/useWallet";
import api from "@/services/api";

const fetchDashboard = async () => {
  const [fundsResponse, commitmentsResponse, transactionsResponse] = await Promise.all([
    api.getFunds(),
    api.getMyCommitments(),
    api.getMyTransactions(),
  ]);
  return {
    funds: fundsResponse.funds ?? [],
    commitments: commitmentsResponse.commitments ?? [],
    transactions: transactionsResponse.transactions ?? [],
  };
};

const formatCurrency = (value, currency = "EUR") =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(value ?? 0);

function Dashboard() {
  const [data, setData] = useState({ funds: [], commitments: [], transactions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [tokenBalanceError, setTokenBalanceError] = useState(null);
  const [tokenBalanceLoading, setTokenBalanceLoading] = useState(false);
  const wallet = useWallet();
  const token = useToken();

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchDashboard()
      .then((result) => {
        if (!active) return;
        setData(result);
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

  const stats = useMemo(() => {
    if (!data) {
      return {
        totalCommitment: 0,
        openFunds: 0,
        recentTransactions: [],
        totalFunds: 0,
      };
    }
    const totalCommitment = data.commitments.reduce((acc, commitment) => acc + Number(commitment.amount ?? 0), 0);
    const openFunds = data.funds.filter((fund) => fund.status === "open").length;
    const recentTransactions = data.transactions.slice(0, 5);
    return {
      totalCommitment,
      openFunds,
      totalFunds: data.funds.length,
      recentTransactions,
    };
  }, [data]);

  useEffect(() => {
    if (!wallet.isConnected || !wallet.address) {
      setTokenBalance(null);
      setTokenBalanceError(null);
      return;
    }

    let active = true;
    setTokenBalanceLoading(true);
    token
      .balanceOf(wallet.address)
      .then((balance) => {
        if (!active) return;
        setTokenBalance(balance);
        setTokenBalanceError(null);
      })
      .catch((err) => {
        if (!active) return;
        setTokenBalanceError(err);
      })
      .finally(() => {
        if (!active) return;
        setTokenBalanceLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, wallet.address, wallet.isConnected]);

  if (loading) {
    return <div className="text-muted-foreground">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-destructive">Unable to load dashboard. Please try again.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Commitments" value={formatCurrency(stats.totalCommitment)} />
        <StatCard title="Open Funds" value={stats.openFunds} description="Funds accepting new commitments" />
        <StatCard title="Total Funds" value={stats.totalFunds} description="Active and archived" />
        <StatCard
          title={token.metadata?.symbol ? `${token.metadata.symbol} Balance` : "Token Balance"}
          value={
            wallet.isConnected
              ? tokenBalanceLoading
                ? "Loading..."
                : tokenBalance ?? "0"
              : "Connect wallet"
          }
          description={
            wallet.isConnected
              ? tokenBalanceError
                ? "Unable to fetch balance"
                : wallet.address
              : "Link a wallet to view on-chain balances"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Commitments</h2>
          <Table
            columns={[
              { header: "Fund", accessor: "fundId" },
              { header: "Amount", accessor: "amount", cell: (row) => formatCurrency(row.amount) },
              { header: "Status", accessor: "status", cell: (row) => row.status.toUpperCase() },
              { header: "Date", accessor: "createdAt", cell: (row) => new Date(row.createdAt).toLocaleString() },
            ]}
            data={data.commitments}
            emptyMessage="No commitments yet. Start by reserving a fund."
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Table
            columns={[
              { header: "Type", accessor: "type", cell: (row) => row.type.toUpperCase() },
              { header: "Amount", accessor: "amount", cell: (row) => formatCurrency(row.amount) },
              { header: "Fund", accessor: "fundId" },
              { header: "Created", accessor: "createdAt", cell: (row) => new Date(row.createdAt).toLocaleString() },
            ]}
            data={stats.recentTransactions}
            emptyMessage="No transactions recorded yet."
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-lg border bg-background p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Wallet Status</h2>
          {wallet.isConnected ? (
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Address</dt>
                <dd className="font-mono text-xs break-all">{wallet.address}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Network</dt>
                <dd>{wallet.chain?.name ?? `Chain ${wallet.chain?.id ?? "unknown"}`}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Native balance</dt>
                <dd>{wallet.balance?.formatted ?? "-"}</dd>
              </div>
              {token.metadata?.symbol && (
                <div>
                  <dt className="text-muted-foreground">{token.metadata.symbol} balance</dt>
                  <dd>
                    {tokenBalanceLoading
                      ? "Loading..."
                      : tokenBalanceError
                        ? "Unavailable"
                        : tokenBalance ?? "0"}
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connect a wallet from the header to view token balances and initiate on-chain actions.
            </p>
          )}
        </div>
        <div className="space-y-3 rounded-lg border bg-background p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Token details</h2>
          {token.loading ? (
            <p className="text-sm text-muted-foreground">Loading token metadata…</p>
          ) : token.error ? (
            <p className="text-sm text-destructive">{token.error.message ?? "Unable to read token metadata."}</p>
          ) : token.metadata ? (
            <dl className="grid gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd>{token.metadata.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Symbol</dt>
                <dd>{token.metadata.symbol}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Decimals</dt>
                <dd>{token.metadata.decimals}</dd>
              </div>
              {token.metadata.totalSupply && (
                <div>
                  <dt className="text-muted-foreground">Total supply</dt>
                  <dd>{token.metadata.totalSupply}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">Token metadata unavailable.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
