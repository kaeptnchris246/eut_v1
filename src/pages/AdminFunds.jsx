import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Table from "@/components/Table";
import api from "@/services/api";
import { toast } from "sonner";

const schema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  currency: z.string().default("EUR"),
  targetAmount: z.coerce.number().positive(),
  minCommitment: z.coerce.number().positive(),
  status: z.enum(["open", "closed"]).default("open"),
});

const formatCurrency = (value, currency = "EUR") =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency }).format(value ?? 0);

function AdminFunds() {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      currency: "EUR",
      targetAmount: 1000000,
      minCommitment: 1000,
      status: "open",
    },
  });

  const onSubmit = async (values) => {
    try {
      await api.createFund(values);
      toast.success("Fund created");
      await loadFunds();
      reset();
    } catch (err) {
      toast.error(err.message ?? "Unable to create fund");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create new fund</CardTitle>
          <CardDescription>Configure a new investment opportunity for investors.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="code">Fund code</Label>
              <Input id="code" placeholder="GREENWAVE" {...register("code")} />
              {errors.code ? <p className="text-sm text-destructive">{errors.code.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="GreenWave Energy Fund" {...register("name")} />
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Short summary" {...register("description")} />
              {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" maxLength={3} {...register("currency")} />
              {errors.currency ? <p className="text-sm text-destructive">{errors.currency.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target amount</Label>
              <Input id="targetAmount" type="number" step="0.01" {...register("targetAmount", { valueAsNumber: true })} />
              {errors.targetAmount ? <p className="text-sm text-destructive">{errors.targetAmount.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minCommitment">Minimum commitment</Label>
              <Input id="minCommitment" type="number" step="0.01" {...register("minCommitment", { valueAsNumber: true })} />
              {errors.minCommitment ? <p className="text-sm text-destructive">{errors.minCommitment.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("status")}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
              {errors.status ? <p className="text-sm text-destructive">{errors.status.message}</p> : null}
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create fund"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Existing funds</h2>
        {loading ? (
          <div className="text-muted-foreground">Loading funds...</div>
        ) : error ? (
          <div className="text-destructive">Unable to load funds.</div>
        ) : (
          <Table
            columns={[
              { header: "Code", accessor: "code" },
              { header: "Name", accessor: "name" },
              { header: "Target", accessor: "targetAmount", cell: (row) => formatCurrency(row.targetAmount, row.currency) },
              { header: "Minimum", accessor: "minCommitment", cell: (row) => formatCurrency(row.minCommitment, row.currency) },
              { header: "Status", accessor: "status", cell: (row) => row.status.toUpperCase() },
            ]}
            data={funds}
            emptyMessage="No funds have been created yet."
          />
        )}
      </div>
    </div>
  );
}

export default AdminFunds;
