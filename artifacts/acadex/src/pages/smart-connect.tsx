import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Users, TrendingUp, Award, BookOpen, Zap } from "lucide-react";
import BookingModal from "@/components/BookingModal";

interface TalentUser {
  authorName: string;
  totalResponses: number;
  qualityScore: number;
  engagementScore: number;
  talentScore: number;
}

function getRating(qualityScore: number) {
  return Math.min(5, Math.round((qualityScore / 20) * 10) / 10);
}

function getTutorLevel(talentScore: number) {
  if (talentScore >= 70) return { label: "Expert Tutor", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
  if (talentScore >= 40) return { label: "Verified Tutor", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
  return { label: "Emerging Tutor", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" };
}

function getSessionRate(durationMin: number) {
  const rates: Record<number, number> = { 30: 2500, 60: 4500, 90: 6500, 120: 8500 };
  return rates[durationMin] ?? 4500;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(4, value)}%` }} />
    </div>
  );
}

function TutorCard({ tutor, onBook }: { tutor: TalentUser; onBook: (tutor: TalentUser) => void }) {
  const initials = tutor.authorName.substring(0, 2).toUpperCase();
  const rating = getRating(tutor.qualityScore);
  const level = getTutorLevel(tutor.talentScore);

  return (
    <Card className="hover:border-primary/40 transition-colors flex flex-col" data-testid={`card-tutor-${tutor.authorName}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0 border-2 border-primary/20">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-lg leading-tight">{tutor.authorName}</h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className={`text-xs ${level.color}`}>
                {level.label}
              </Badge>
            </div>
            <div className="mt-2">
              <StarRating rating={rating} />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-bold text-primary">₦4,500</div>
            <div className="text-xs text-muted-foreground">/ 60 min</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-muted/40 rounded-lg p-2">
            <div className="font-bold text-foreground">{tutor.totalResponses}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Responses</div>
          </div>
          <div className="bg-muted/40 rounded-lg p-2">
            <div className="font-bold text-foreground">{tutor.qualityScore}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Quality</div>
          </div>
          <div className="bg-muted/40 rounded-lg p-2">
            <div className="font-bold text-foreground">{tutor.engagementScore}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Engagement</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-emerald-500" /> Quality Score</span>
            <span className="font-mono">{tutor.qualityScore}/100</span>
          </div>
          <ScoreBar value={tutor.qualityScore} color="bg-emerald-500" />

          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-blue-500" /> Engagement</span>
            <span className="font-mono">{tutor.engagementScore}/100</span>
          </div>
          <ScoreBar value={tutor.engagementScore} color="bg-blue-500" />

          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> Talent Score</span>
            <span className="font-mono">{tutor.talentScore}/100</span>
          </div>
          <ScoreBar value={tutor.talentScore} color="bg-primary/70" />
        </div>

        <Button
          className="w-full gap-2"
          onClick={() => onBook(tutor)}
          data-testid={`button-book-${tutor.authorName}`}
        >
          <BookOpen className="h-4 w-4" />
          Book Session
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SmartConnect() {
  const [tutors, setTutors] = useState<TalentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState<TalentUser | null>(null);

  useEffect(() => {
    fetch("/api/talent")
      .then((r) => r.json())
      .then((d: { topHelpers: TalentUser[]; potentialTutors: TalentUser[] }) => {
        const seen = new Set<string>();
        const merged: TalentUser[] = [];
        [...d.topHelpers, ...d.potentialTutors].forEach((u) => {
          if (!seen.has(u.authorName)) {
            seen.add(u.authorName);
            merged.push(u);
          }
        });
        setTutors(merged.sort((a, b) => b.talentScore - a.talentScore));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SmartConnect</h1>
        </div>
        <p className="text-muted-foreground mt-1 ml-14">
          Book a session with top-rated tutors identified from the EduLink360 community.
        </p>
      </div>

      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Award className="h-5 w-5 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          All tutors listed here are ranked by our TalentDiscovery algorithm based on response quality, engagement, and consistency.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Skeleton className="w-14 h-14 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-muted/20 border-dashed">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium">No tutors available yet</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Tutors appear here once community members start responding to challenges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <TutorCard key={tutor.authorName} tutor={tutor} onBook={setSelectedTutor} />
          ))}
        </div>
      )}

      {selectedTutor && (
        <BookingModal
          tutor={selectedTutor}
          onClose={() => setSelectedTutor(null)}
        />
      )}
    </div>
  );
}
