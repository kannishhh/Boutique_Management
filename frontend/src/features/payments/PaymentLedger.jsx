import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CheckCircle2, CreditCard, Wallet, Smartphone, Calendar, TrendingUp } from "lucide-react";
import {
  Dialog, DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

export function PaymentHistoryModal({ open, onClose, payments, orderTotal, orderPaid }) {
  const getPaymentIcon = (method) => {
    switch (method?.toUpperCase()) {
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

  const getMethodColor = (method) => {
    switch (method?.toUpperCase()) {
      case "UPI":
        return "text-blue-600 bg-blue-50 border-blue-100";
      case "CARD":
        return "text-purple-600 bg-purple-50 border-purple-100";
      case "CASH":
        return "text-green-600 bg-green-50 border-green-100";
      default:
        return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-120 max-h-[90vh] flex flex-col rounded-3xl border-[#C9A961]/20 p-0 overflow-hidden">

        <div className="px-4 pt-6 pb-4 bg-muted/30">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif text-foreground">Payment History</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Track all payments for this order
            </DialogDescription>
          </DialogHeader>

        </div>

        <div className="px-8 pb-8 max-h-100 overflow-y-auto ">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">No payments yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Payment records will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment, index) => (
                <div
                  key={payment.payment_id}
                  className="group p-4 rounded-xl border-border/50 bg-muted/30 hover:bg-[#FFFBF0]/50 hover:border-[#C9A961]/30 hover:shadow-sm transition-all duration-200 "
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-[#C9A961]/10 text-[#C9A961] flex items-center justify-center text-sm font-semibold border border-[#C9A961]/20">
                        #{index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl font-semibold text-muted-foreground">₹{payment.amount.toLocaleString()}</span>
                          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="font-medium">Success</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${getMethodColor(payment.payment_method)}`}>
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

                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#C9A961] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-8 py-5 bg-muted/30 to-transparent border-t border-border/30">
          <Button
            onClick={onClose}
            className="w-full bg-[#C9A961] hover:bg-[#B89851] text-white rounded-2xl h-12 font-medium shadow-sm hover:shadow-md transition-all duration-300"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog >
  );
}

export function AddPaymentDialog({ open, onClose, onAddPayment, currentPaid, totalPrice, remainingBalance }) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");

    const numAmount = Number(amount);

    if (!amount || numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (numAmount > remainingBalance) {
      setError(`Amount cannot exceed balance of ₹${remainingBalance}`);
      return;
    }

    onAddPayment(numAmount, paymentMethod);
    setAmount("");
    setPaymentMethod("CASH");
    setError("");
  };

  const handleClose = () => {
    setAmount("");
    setPaymentMethod("CASH");
    setError("");
    onClose();
  };

  const presetAmounts = [500, 1000, 2000, remainingBalance];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-120 max-h-[90vh] flex flex-col rounded-3xl border-[#C9A961]/20 p-0 overflow-hidden">
        <div className="px-4 pt-6 pb-4 bg-muted/30 ">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif text-foreground">Add Payment</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              Record a new payment for this order
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-8 pb-8 space-y-6 overflow-y-auto flex-1 min-h-0">
          <div className="bg-muted rounded-2xl p-5 border border-[#C9A961]/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Paid</p>
                <p className="text-lg font-semibold text-green-600">₹{currentPaid}</p>
              </div>
              <div className="h-12 w-px bg-border/50" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                <p className="text-lg font-semibold text-orange-600">₹{remainingBalance}</p>
              </div>
              <div className="h-12 w-px bg-border/50" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-lg font-semibold text-muted-foreground">₹{totalPrice}</p>
              </div>
            </div>

            <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                style={{ width: `${totalPrice > 0 ? (currentPaid / totalPrice) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {(totalPrice > 0 ? (currentPaid / totalPrice) * 100 : 0).toFixed(0)}% paid
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="payment-amount" className="text-sm font-medium text-foreground">
              Payment Amount
            </Label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                ₹
              </span>
              <Input
                id="payment-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                className="pl-10 pr-4 h-14 text-lg font-semibold rounded-2xl border-border/50 focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/20 transition-all"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setAmount(String(preset));
                    setError("");
                  }}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground bg-muted/30 hover:bg-[#C9A961]/10 hover:text-[#C9A961] rounded-xl border border-transparent hover:border-[#C9A961]/20 transition-all"
                >
                  ₹{preset}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-600 font-medium flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="payment-method" className="text-sm font-medium text-foreground">
              Payment Method
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'CASH', label: 'Cash' },
                { value: 'UPI', label: 'UPI' },
                { value: 'CARD', label: 'Card' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPaymentMethod(value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === value
                    ? 'border-[#C9A961] bg-[#C9A961]/5 shadow-sm'
                    : 'border-border/50 hover:border-[#C9A961]/30 hover:bg-muted/20'
                    }`}
                >
                  {value === 'CASH' && <Wallet className={`w-5 h-5 ${paymentMethod === value ? 'text-[#C9A961]' : 'text-muted-foreground'}`} />}
                  {value === 'UPI' && <Smartphone className={`w-5 h-5 ${paymentMethod === value ? 'text-[#C9A961]' : 'text-muted-foreground'}`} />}
                  {value === 'CARD' && <CreditCard className={`w-5 h-5 ${paymentMethod === value ? 'text-[#C9A961]' : 'text-muted-foreground'}`} />}
                  <span className={`text-sm font-medium ${paymentMethod === value ? 'text-[#C9A961]' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {amount && Number(amount) > 0 && !error && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-2">
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide">Payment Preview</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">New Amount Paid</p>
                  <p className="text-2xl font-semibold text-green-600">₹{currentPaid + Number(amount)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600/30" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-green-200/50">
                <p className="text-sm text-green-700">Remaining Balance</p>
                <p className="text-lg font-semibold text-orange-600">₹{remainingBalance - Number(amount)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-5 bg-muted/30 to-transparent border-t border-border/30 shrink-0">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 rounded-2xl border-border/50 hover:bg-muted/70 font-medium transition-all"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 h-12 bg-[#C9A961] hover:bg-[#B89851] text-white rounded-2xl font-medium shadow-sm hover:shadow-md transition-all duration-300"
            >
              Add Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentSummaryCard({ totalPrice, totalPaid, className = "" }) {
  const balance = totalPrice - totalPaid;
  const percentage = (totalPaid / totalPrice) * 100;

  const getStatusColor = () => {
    if (balance === 0) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100' };
    if (totalPaid > 0) return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100' };
    return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100' };
  };

  const colors = getStatusColor();

  return (
    <Card className={`rounded-2xl border-border/50 shadow-sm overflow-hidden ${className}`}>
      <div className="bg-gradient-to-br from-[#FFFBF0] to-white p-5 border-b border-border/30">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Payment Summary</h3>
          <PaymentBadge status={balance === 0 ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'PENDING'} />
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Price</p>
            <p className="text-xl font-semibold text-[#1a1a1a]">₹{totalPrice}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Paid</p>
            <p className="text-xl font-semibold text-green-600">₹{totalPaid}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Balance</p>
            <p className="text-xl font-semibold text-orange-600">₹{balance}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Payment Progress</p>
            <p className="text-xs font-semibold text-[#C9A961]">{percentage.toFixed(0)}%</p>
          </div>
          <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        <div className={`${colors.bg} ${colors.border} border rounded-xl p-4 flex items-center gap-3`}>
          <div className={`w-2 h-2 rounded-full ${colors.badge} ${colors.text}`} />
          <p className={`text-sm font-medium ${colors.text}`}>
            {balance === 0 ? 'Payment completed successfully' : balance > 0 ? `₹${balance} remaining` : 'Payment pending'}
          </p>
        </div>
      </div>
    </Card>
  );
}


export function PaymentBadge({ status, size = 'md' }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'PAID':
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200',
          dot: 'bg-green-500',
          label: 'Paid',
        };
      case 'PARTIAL':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          border: 'border-orange-200',
          dot: 'bg-orange-500',
          label: 'Partial',
        };
      case 'PENDING':
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200',
          dot: 'bg-red-500',
          label: 'Pending',
        };
    }
  };

  const config = getStatusConfig();
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} ${config.border} border rounded-full ${sizeClasses[size]} font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </div>
  );
}