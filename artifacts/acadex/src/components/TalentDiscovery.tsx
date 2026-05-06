import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Users, TrendingUp, Award } from "lucide-react";

interface TalentUser {
  authorName: string;
  totalResponses: number;
  qualityScore: number;
  engagementScore: number;
  talentScore: number;
}

interface TalentData {
  topHelpers: TalentUser[];
  potentialTutors: TalentUser[];
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.max(4, value)}%` }}
      />
    </div>
  );
}

function TalentCard({ user, rank, showEngagement }: { user: TalentUser; rank: number; showEngagement?: boolean }) {
  const initials = user.authorName.substring(0, 2).toUpperCase();
  const rankColors = ["bg-yellow-400 text-yellow-900", "bg-gray-300 text-gray-800", "bg-amber-600 text-amber-100"];
  const rankColor = rankColors[rank - 1] ?? "bg-secondary text-secondary-foreground";

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 ${rankColor}`}>
        {rank}
      </div>
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm text-foreground truncate">{user.authorName}</span>
          <Badge variant="secondary" className="text-xs shrink-0 font-mono">
            {user.talentScore}
          </Badge>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Quality</span>
            <span className="font-mono">{user.qualityScore}</span>
          </div>
          <ScoreBar value={user.qualityScore} color="bg-emerald-500" />

          {showEngagement && (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Engagement</span>
                <span className="font-mono">{user.engagementScore}</span>
              </div>
              <ScoreBar value={user.engagementScore} color="bg-blue-500" />
            </>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-0.5">
            <span>{user.totalResponses} {user.totalResponses === 1 ? "response" : "responses"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TalentDiscovery() {
  const [data, setData] = useState<TalentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"helpers" | "tutors">("helpers");

  useEffect(() => {
    fetch("/api/talent")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Talent Discovery
        </CardTitle>
        <div className="flex gap-1 mt-2">
          <button
            onClick={() => setTab("helpers")}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              tab === "helpers"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
            data-testid="tab-top-helpers"
          >
            <Award className="h-3.5 w-3.5" />
            Top Helpers
          </button>
          <button
            onClick={() => setTab("tutors")}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              tab === "tutors"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
            data-testid="tab-potential-tutors"
          >
            <Users className="h-3.5 w-3.5" />
            Potential Tutors
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-1">
        {loading ? (
          <div className="space-y-4 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !data || (data.topHelpers.length === 0 && data.potentialTutors.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No talent data yet. Start responding to challenges!
          </p>
        ) : tab === "helpers" ? (
          <div>
            {data.topHelpers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No helpers yet.</p>
            ) : (
              data.topHelpers.map((u, i) => (
                <TalentCard key={u.authorName} user={u} rank={i + 1} />
              ))
            )}
          </div>
        ) : (
          <div>
            {data.potentialTutors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No tutors identified yet.</p>
            ) : (
              data.potentialTutors.map((u, i) => (
                <TalentCard key={u.authorName} user={u} rank={i + 1} showEngagement />
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
