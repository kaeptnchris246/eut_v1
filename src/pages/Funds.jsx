import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import api from "@/services/api";
import { toast } from "sonner";

const reserveSchema = z.object({
  amount: z.coerce.number({ invalid_type_error: "Amount is required" }).positive("Amount must be positive"),
});

const formatCurrency = (value, currency = "EUR") =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(value ?? 0);

function Funds() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFund, setActiveFund] = useState(null);

  const loadFunds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getFunds();
      setFunds(response.funds ?? []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFunds();
  }, [loadFunds]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(reserveSchema), defaultValues: { amount: 0 } });

  const onSubmit = async (values) => {
    if (!activeFund) return;
    try {
      await api.createCommitment({ fundId: activeFund.id, amount: values.amount });
      toast.success("Commitment reserved");
      await loadFunds();
      reset();
      setActiveFund(null);
    } catch (err) {
      toast.error(err.message ?? "Unable to reserve commitment");
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading funds...</div>;
  }

  if (error) {
    return <div className="text-destructive">Unable to load funds. Please try again later.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Investment Funds</h1>
          <p className="text-muted-foreground">Review open opportunities and reserve commitments.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {funds.map((fund) => (
          <Card key={fund.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{fund.name}</CardTitle>
              <CardDescription>{fund.code}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-3">
              <p className="text-sm text-muted-foreground">{fund.description ?? "No description available."}</p>
              <div className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target</span>
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
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                <Button variant="outline" asChild>
                  <Link to={`/funds/${fund.id}`}>View details</Link>
                </Button>
                <Button onClick={() => setActiveFund(fund)} disabled={fund.status !== "open"}>
                  Reserve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(activeFund)} onOpenChange={(open) => (!open ? setActiveFund(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserve commitment</DialogTitle>
            <DialogDescription>
              Reserve a position in {activeFund?.name}. Minimum commitment is {formatCurrency(activeFund?.minCommitment ?? 0,
              activeFund?.currency)}.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" min="0" {...register("amount", { valueAsNumber: true })} />
              {errors.amount ? <p className="text-sm text-destructive">{errors.amount.message}</p> : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setActiveFund(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Reserve"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Funds;
