import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Table from "@/components/Table";
import api from "@/services/api";
import { toast } from "sonner";

const reserveSchema = z.object({
  amount: z.coerce.number({ invalid_type_error: "Amount is required" }).positive("Amount must be positive"),
});

const formatCurrency = (value, currency = "EUR") =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(value ?? 0);

function FundDetail() {
  const { id } = useParams();
  const [fund, setFund] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const loadFund = useCallback(async () => {
    if (!id) return;
    const response = await api.getFund(id);
    setFund(response.fund);
  }, [id]);

  const loadCommitments = useCallback(async () => {
    if (!id) return;
    const response = await api.getMyCommitments();
    setCommitments(response.commitments.filter((commitment) => commitment.fundId === id));
  }, [id]);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        await Promise.all([loadFund(), loadCommitments()]);
        if (active) {
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => {
      active = false;
    };
  }, [loadCommitments, loadFund]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(reserveSchema), defaultValues: { amount: 0 } });

  const handleReserve = async (values) => {
    if (!id) return;
    try {
      await api.createCommitment({ fundId: id, amount: values.amount });
      toast.success("Commitment reserved");
      await Promise.all([loadCommitments(), loadFund()]);
      reset();
    } catch (err) {
      toast.error(err.message ?? "Unable to reserve commitment");
    }
  };

  const handleConfirm = async (commitmentId) => {
    try {
      setConfirmingId(commitmentId);
      await api.confirmCommitment(commitmentId);
      toast.success("Commitment confirmed");
      await Promise.all([loadCommitments(), loadFund()]);
    } catch (err) {
      toast.error(err.message ?? "Unable to confirm commitment");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancel = async (commitmentId) => {
    try {
      setCancellingId(commitmentId);
      await api.cancelCommitment(commitmentId);
      toast.success("Commitment cancelled");
      await Promise.all([loadCommitments(), loadFund()]);
    } catch (err) {
      toast.error(err.message ?? "Unable to cancel commitment");
    } finally {
      setCancellingId(null);
    }
  };

  const totalCommitted = useMemo(
    () => commitments.reduce((sum, commitment) => sum + Number(commitment.amount ?? 0), 0),
    [commitments],
  );

  if (loading) {
    return <div className="text-muted-foreground">Loading fund details...</div>;
  }

  if (error || !fund) {
    return <div className="text-destructive">Unable to load fund details.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{fund.name}</CardTitle>
          <CardDescription>{fund.code}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">{fund.description ?? "No description available."}</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Target amount</span>
              <span>{formatCurrency(fund.targetAmount, fund.currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Minimum commitment</span>
              <span>{formatCurrency(fund.minCommitment, fund.currency)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize">{fund.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Your total commitment</span>
              <span>{formatCurrency(totalCommitted, fund.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reserve additional commitment</CardTitle>
          <CardDescription>Reserve funds while the opportunity is open.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(handleReserve)}>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register("amount", { valueAsNumber: true })} />
              {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isSubmitting || fund.status !== "open"}>
                {isSubmitting ? "Submitting..." : fund.status === "open" ? "Reserve" : "Fund closed"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Your commitments</h2>
        <Table
          columns={[
            { header: "Amount", accessor: "amount", cell: (row) => formatCurrency(row.amount, fund.currency) },
            { header: "Status", accessor: "status", cell: (row) => row.status.toUpperCase() },
            { header: "Created", accessor: "createdAt", cell: (row) => new Date(row.createdAt).toLocaleString() },
            {
              header: "Actions",
              accessor: "actions",
              cell: (row) => (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={row.status !== "reserved" || confirmingId === row.id}
                    onClick={() => handleConfirm(row.id)}
                  >
                    {confirmingId === row.id ? "Confirming..." : "Confirm"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={row.status !== "reserved" || cancellingId === row.id}
                    onClick={() => handleCancel(row.id)}
                  >
                    {cancellingId === row.id ? "Cancelling..." : "Cancel"}
                  </Button>
                </div>
              ),
            },
          ]}
          data={commitments}
          emptyMessage="No commitments yet for this fund."
        />
      </div>
    </div>
  );
}

export default FundDetail;
