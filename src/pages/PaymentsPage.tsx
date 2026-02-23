import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  refunded: "bg-muted text-muted-foreground",
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      setPayments(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground">M-Pesa payment history and transactions</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <CreditCard className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium text-foreground">No payments yet</p>
            <p className="text-sm text-muted-foreground">Payment records will appear after transactions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((pay) => (
              <Card key={pay.id} className="shadow-card animate-fade-in">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {pay.mpesa_receipt || pay.transaction_id || "Payment"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pay.phone_number} · {new Date(pay.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-heading font-bold text-foreground">KES {Number(pay.amount).toLocaleString()}</p>
                    <Badge variant="outline" className={statusColors[pay.status] || ""}>{pay.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PaymentsPage;
