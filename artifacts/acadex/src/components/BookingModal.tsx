import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Calendar, Clock, BookOpen, Star } from "lucide-react";
import OPayModal from "./OPayModal";

interface TalentUser {
  authorName: string;
  totalResponses: number;
  qualityScore: number;
  engagementScore: number;
  talentScore: number;
}

const SESSION_RATES: Record<string, { label: string; amount: number }> = {
  "30": { label: "30 minutes", amount: 2500 },
  "60": { label: "60 minutes", amount: 4500 },
  "90": { label: "90 minutes", amount: 6500 },
  "120": { label: "120 minutes", amount: 8500 },
};

interface BookingModalProps {
  tutor: TalentUser;
  onClose: () => void;
}

export default function BookingModal({ tutor, onClose }: BookingModalProps) {
  const today = new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(today);
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [note, setNote] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const session = SESSION_RATES[duration];
  const initials = tutor.authorName.substring(0, 2).toUpperCase();
  const rating = Math.min(5, Math.round((tutor.qualityScore / 20) * 10) / 10);

  const handleConfirm = () => {
    if (!date || !time || !duration) return;
    setShowPayment(true);
  };

  if (showPayment) {
    return (
      <OPayModal
        tutor={tutor}
        date={date}
        time={time}
        duration={session.label}
        amount={session.amount}
        onClose={onClose}
        onBack={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="modal-booking"
    >
      <div className="bg-background border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-bold">Book a Session</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-md p-1 hover:bg-secondary"
            data-testid="button-close-booking"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold shrink-0">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-foreground">{tutor.authorName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3 w-3 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {tutor.totalResponses} responses · Quality score {tutor.qualityScore}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="booking-date" className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date
              </Label>
              <Input
                id="booking-date"
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                data-testid="input-booking-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-time" className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Time
              </Label>
              <Input
                id="booking-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                data-testid="input-booking-time"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Duration
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger data-testid="select-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SESSION_RATES).map(([val, info]) => (
                    <SelectItem key={val} value={val}>
                      {info.label} — ₦{info.amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-note">Note to tutor (optional)</Label>
              <Input
                id="booking-note"
                placeholder="e.g., I need help with integration by parts..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                data-testid="input-booking-note"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-muted-foreground">Session fee</span>
              <span className="font-bold text-lg text-primary">₦{session.amount.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {session.label} with {tutor.authorName}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={!date || !time}
                data-testid="button-confirm-booking"
              >
                Confirm & Pay
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
