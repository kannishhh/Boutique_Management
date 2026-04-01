import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Wallet,
  CreditCard,
  Smartphone,
  Calendar,
  Plus,
  TrendingUp,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function PaymentLedgerSection({
  totalPrice,
  totalPaid,
  payments = [],
  onAddPayment,
  showAddButton = true,
  maxVisiblePayments,
  onViewFullHistory,
}) {
  const balance = totalPrice - totalPaid;
  const percentage = totalPrice > 0 ? (totalPaid / totalPrice) * 100 : 0;

  const getPaymentStatus = () => {
    if (balance === 0) return { status: 'PAID', color: "green", label: "Fully Paid" };
    if (totalPaid > 0) return { status: 'PARTIAL', color: "orange", label: "Partially Paid" };
    return { status: 'PENDING', color: "red", label: "Payment Pending" };
  };

  const paymentStatus = getPaymentStatus();

  const getPaymentIcon = (method) => {
    const normalized = method?.toUpperCase();
    switch (normalized) {
      case "UPI":
        return <Smartphone className="w-4 h-4" />;
      case "CARD":
        return <CreditCard className="w-4 h-4" />;
      case "CASH":
        return <Wallet className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getMethodStyle = (method) => {
    const normalized = method?.toUpperCase();
    switch (normalized) {
      case 'UPI':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'CARD':
        return 'text-violet-700 bg-violet-50 border-violet-200'
      case 'CASH':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200'
      default:
        return 'text-secondary bg-foreground border-secondary/20'
    }
  };

  const getStatusColors = () => {
    switch (paymentStatus.color) {
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: 'text-green-600',
          progressBg: 'from-green-500 to-green-600',
        };
      case 'orange':  
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          icon: 'text-orange-600',
          progressBg: 'from-orange-500 to-orange-600',
        };
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: 'text-red-600',
          progressBg: 'from-red-500 to-red-600',
        };
    }
  };

  const statusColors = getStatusColors();
  const visiblePayments = Number.isFinite(maxVisiblePayments)
    ? payments.slice(0, Math.max(0, maxVisiblePayments))
    : payments;

  return (
    <div className="space-y-5">

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[#C9A961]/10">
            <Wallet className="w-5 h-5 text-[#C9A961]" />
          </div>
          <div>
            <h1 className="font-semibold text-2xl text-secondary-foreground">Payment Ledger</h1>
            <p className="text-xs text-muted-foreground">
              Track all payments
            </p>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusColors.bg} ${statusColors.border}`}
        >
          <span className={`text-sm font-medium  ${statusColors.text}`}>
            {paymentStatus.label}
          </span>
        </div>
      </div>


      <Card className="p-6 rounded-2xl border-border/50 bg-muted/30 shadow-sm">
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Total Price</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm text-muted-foreground">₹</span>
              <p className="text-2xl font-semibold text-muted-foreground">{totalPrice}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Paid</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm text-muted-foreground">₹</span>
              <p className="text-2xl font-semibold text-green-600">{totalPaid}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Balance</p>
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm text-muted-foreground">₹</span>
              <p className={`text-2xl font-semibold ${balance === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {balance}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Payment Progress</span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className={`w-3.5 h-3.5 ${statusColors.icon}`} />
              <span className="font-semibold text-[#C9A961]">{percentage.toFixed(0)}%</span>
            </div>
          </div>

          <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 bg-gradient-to-r ${statusColors.progressBg} rounded-full transition-all duration-500 shadow-sm`}
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20" />
            </div>
          </div>
        </div>

        <div className={`mt-5 ${statusColors.bg} ${statusColors.border} border rounded-xl p-3.5 flex items-center gap-3`}>
          {balance === 0 ? (
            <CheckCircle2 className={`w-5 h-5 ${statusColors.icon}`} />
          ) : (
            <Clock className={`w-5 h-5 ${statusColors.icon}`} />
          )}
          <p className={`text-sm font-medium ${statusColors.text}`}>
            {balance === 0
              ? 'Payment completed successfully'
              : balance > 0
                ? `₹${balance} remaining to be collected`
                : 'Payment pending'}
          </p>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-secondary-foreground">Payment History</h4>
          <span className="text-xs text-muted-foreground">
            {payments.length} {payments.length === 1 ? 'payment' : 'payments'}
          </span>
        </div>

        {payments.length === 0 ? (
          <Card className="p-8 rounded-2xl border-border/50 border-dashed bg-muted/10">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                <Wallet className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <p className="text-base font-medium text-muted-foreground mb-1">No payments yet</p>
              <p className="text-sm text-muted-foreground/70">
                Payment records will appear here once added
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {visiblePayments.map((payment, index) => (
              <Card
                key={payment.payment_id}
                className="group p-4 rounded-xl border-border/50 bg-muted/30 hover:bg-[#FFFBF0]/50 hover:border-[#C9A961]/30 hover:shadow-sm transition-all duration-200 "
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-[#C9A961]/10 text-[#C9A961] flex items-center justify-center text-sm font-semibold border border-[#C9A961]/20">
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-semibold text-muted-foreground">
                          ₹{payment.amount.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="font-medium">Success</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${getMethodStyle(payment.payment_method)}`}>
                          {getPaymentIcon(payment.payment_method)}
                          <span className="font-medium">{payment.payment_method || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-primary">
                          <Calendar className="w-4 h-4" />
                          <span>{payment.payment_date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C9A961] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Card>
            ))}

            {payments.length > visiblePayments.length && onViewFullHistory && (
              <Button
                type="button"
                variant="outline"
                onClick={onViewFullHistory}
                className="w-full rounded-xl border-[#C9A961]/40 text-[#C9A961] hover:bg-[#C9A961]/10"
              >
                View full payment history
              </Button>
            )}
          </div>
        )}
      </div>


      {showAddButton && balance > 0 && (
        <Button
          onClick={onAddPayment}
          className="w-full h-12 bg-gradient-to-r from-[#C9A961] to-[#B89851] hover:from-[#B89851] hover:to-[#A78841] text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Payment
        </Button>
      )}

      {balance === 0 && (
        <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">All payments completed</span>
        </div>

      )}
    </div>
  );
}