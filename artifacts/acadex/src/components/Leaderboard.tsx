import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Star } from "lucide-react";
import { Link } from "wouter";

interface TalentUser {
  authorName: string;
  totalResponses: number;
  qualityScore: number;
  engagementScore: number;
  talentScore: number;
}

const COURSE_SPECIALIZATION: Record<string, string> = {
  "Max Planck": "Physics",
  "Donald Knuth": "Computer Science",
  "Leonhard Euler": "Mathematics",
  "Emmy Noether": "Mathematics",
  "Marie Curie": "Physics",
  "Ada Lovelace": "Computer Science",
  "Richard Feynman": "Physics",
  "Alan Turing": "Computer Science",
  "Carl Gauss": "Mathematics",
  "Bakare": "Physics",
};

function getSpecialization(name: string): string {
  return COURSE_SPECIALIZATION[name] ?? "Multi-Course";
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-900 shrink-0">
        <Trophy className="h-3 w-3" />
      </span>
    );
  if (rank === 2)
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-700 shrink-0">
        <Medal className="h-3 w-3" />
      </span>
    );
  if (rank === 3)
    return (
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-amber-100 shrink-0">
        <Medal className="h-3 w-3" />
      </span>
    );
  return (
    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-muted-foreground text-xs font-bold shrink-0">
      {rank}
    </span>
  );
}

export default function Leaderboard() {
  const [users, setUsers] = useState<TalentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/talent")
      .then((res) => res.json())
      .then((data: { topHelpers: TalentUser[]; potentialTutors: TalentUser[] }) => {
        const seen = new Set<string>();
        const merged: TalentUser[] = [];
        [...(data.topHelpers ?? []), ...(data.potentialTutors ?? [])].forEach((u) => {
          if (!u?.authorName) return;
          if (!seen.has(u.authorName)) {
            seen.add(u.authorName);
            merged.push(u);
          }
        });
        setUsers(merged.sort((a, b) => b.talentScore - a.talentScore));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-5 w-10 rounded" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No leaderboard data yet. Respond to challenges to earn a rank!
          </p>
        ) : (
          <ol className="space-y-3">
            {users.map((u, i) => {
              const initials = u.authorName.substring(0, 2).toUpperCase();
              const specialization = getSpecialization(u.authorName);
              return (
                <li key={u.authorName} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                  <RankBadge rank={i + 1} />
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate leading-tight">
                      {u.authorName}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {specialization}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-3 w-3 text-primary" />
                      <span className="text-xs font-bold text-primary font-mono">{u.talentScore}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">talent</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <div className="pt-3 mt-1 border-t">
          <Link href="/smart-connect">
            <button className="text-xs text-primary hover:underline w-full text-center">
              Book a top tutor →
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
