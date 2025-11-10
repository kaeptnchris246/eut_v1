import { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/StatCard";
import Table from "@/components/Table";
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

  if (loading) {
    return <div className="text-muted-foreground">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-destructive">Unable to load dashboard. Please try again.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Commitments" value={formatCurrency(stats.totalCommitment)} />
        <StatCard title="Open Funds" value={stats.openFunds} description="Funds accepting new commitments" />
        <StatCard title="Total Funds" value={stats.totalFunds} description="Active and archived" />
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
    </div>
  );
}

export default Dashboard;
