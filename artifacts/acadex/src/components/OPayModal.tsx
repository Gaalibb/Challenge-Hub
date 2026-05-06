import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, ShieldCheck, Lock } from "lucide-react";

interface OPayModalProps {
  tutor: { authorName: string; qualityScore: number };
  date: string;
  time: string;
  duration: string;
  amount: number;
  onClose: () => void;
  onBack: () => void;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string) {
  try {
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m));
    return d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return timeStr;
  }
}

export default function OPayModal({ tutor, date, time, duration, amount, onClose, onBack }: OPayModalProps) {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      data-testid="modal-opay"
    >
      <div className="bg-background border rounded-xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="bg-[#00A859] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!done && (
              <button
                onClick={onBack}
                className="text-white/80 hover:text-white transition-colors"
                data-testid="button-back-booking"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Secure Payment</p>
              <p className="text-white font-bold text-lg leading-tight">Pay with OPay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            data-testid="button-close-opay"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#00A859]/10 text-[#00A859] mx-auto">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Payment Successful!</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Your session with {tutor.authorName} has been booked.
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{formatDate(date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{formatTime(time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount paid</span>
                <span className="font-bold text-[#00A859]">₦{amount.toLocaleString()}</span>
              </div>
            </div>
            <Button className="w-full bg-[#00A859] hover:bg-[#008a47] text-white" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Session Summary</p>
              <div className="bg-muted/30 rounded-lg divide-y text-sm">
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-muted-foreground">Tutor</span>
                  <span className="font-semibold">{tutor.authorName}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{formatDate(date)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium">{formatTime(time)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-2.5">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{duration}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#00A859]/5 border border-[#00A859]/20 rounded-lg px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-medium text-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-[#00A859]">₦{amount.toLocaleString()}</span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pay via</p>
              <div className="grid grid-cols-3 gap-2">
                {["OPay Wallet", "Bank Transfer", "Card"].map((method) => (
                  <button
                    key={method}
                    className="border rounded-lg py-2.5 px-2 text-xs font-medium text-center hover:border-[#00A859] hover:bg-[#00A859]/5 transition-colors first:border-[#00A859] first:bg-[#00A859]/5 first:text-[#00A859]"
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground justify-center">
              <Lock className="h-3 w-3" />
              <span>Secured by OPay · 256-bit SSL encryption</span>
            </div>

            <Button
              className="w-full bg-[#00A859] hover:bg-[#008a47] text-white font-semibold"
              onClick={handlePay}
              disabled={processing}
              data-testid="button-complete-payment"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Pay ₦${amount.toLocaleString()}`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
