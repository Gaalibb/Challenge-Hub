import Leaderboard from "../components/Leaderboard";
import TalentDiscovery from "../components/TalentDiscovery";
import StudyCircle from "../components/StudyCircle";
import { ALL_STUDY_GROUPS } from "../components/StudyCircle";
import { useListChallenges, useGetChallengeStats, useGetRecentActivity } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatTimeAgo } from "@/lib/date-utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare, Clock, BookOpen, User, Flame, Search,
  BarChart3, Users, GraduationCap, Layers,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LEVEL_DISPLAY: Record<string, string> = {
  beginner: "100",
  intermediate: "200",
  advanced: "300",
};

const LEVEL_TO_API: Record<string, string> = {
  "100": "beginner",
  "200": "intermediate",
  "300": "advanced",
};

function getLevelColor(difficulty: string) {
  switch (difficulty) {
    case "beginner":
    case "100":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "intermediate":
    case "200":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "advanced":
    case "300":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    case "400":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "500":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function Home() {
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tutorCount, setTutorCount] = useState<number | null>(null);

  const apiDifficulty = LEVEL_TO_API[levelFilter] || (levelFilter && !LEVEL_TO_API[levelFilter] ? levelFilter : undefined);

  const { data: challenges, isLoading: challengesLoading } = useListChallenges({
    subject: subjectFilter && subjectFilter !== "all" ? subjectFilter : undefined,
    difficulty: apiDifficulty,
  });

  const { data: stats, isLoading: statsLoading } = useGetChallengeStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  useEffect(() => {
    fetch("/api/talent")
      .then((r) => r.json())
      .then((d: { topHelpers: { authorName: string }[]; potentialTutors: { authorName: string }[] }) => {
        const seen = new Set([
          ...d.topHelpers.map((u) => u.authorName),
          ...d.potentialTutors.map((u) => u.authorName),
        ]);
        setTutorCount(seen.size);
      })
      .catch(() => {});
  }, []);

  const filteredChallenges = useMemo(() => {
    if (!challenges) return challenges;
    if (!searchQuery.trim()) return challenges;
    const q = searchQuery.toLowerCase();
    return challenges.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [challenges, searchQuery]);

  const groupCount = ALL_STUDY_GROUPS.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* ── Main feed ─────────────────────────── */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Challenge Feed</h1>
            <p className="text-muted-foreground mt-1">Browse and respond to academic challenges.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              data-testid="input-search"
              className="pl-9"
              placeholder="Search challenges by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-course-filter">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Physics">Physics</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Literature">Literature</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="Chemistry">Chemistry</SelectItem>
                <SelectItem value="Biology">Biology</SelectItem>
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[130px]" data-testid="select-level-filter">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="100">Level 100</SelectItem>
                <SelectItem value="200">Level 200</SelectItem>
                <SelectItem value="300">Level 300</SelectItem>
                <SelectItem value="400">Level 400</SelectItem>
                <SelectItem value="500">Level 500</SelectItem>
              </SelectContent>
            </Select>

            {((subjectFilter && subjectFilter !== "all") || (levelFilter && levelFilter !== "all") || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSubjectFilter(""); setLevelFilter(""); setSearchQuery(""); }}
                data-testid="button-clear-filters"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {challengesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5 mt-2" />
                </CardContent>
              </Card>
            ))
          ) : filteredChallenges?.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20 border-dashed">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No challenges found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your filters or post a new challenge.</p>
              <Link href="/new">
                <Button className="mt-4" variant="outline">Post Challenge</Button>
              </Link>
            </div>
          ) : (
            filteredChallenges?.map((challenge) => (
              <Link key={challenge.id} href={`/challenges/${challenge.id}`} className="block group">
                <Card className="hover:border-primary/50 transition-colors h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1.5 flex-1">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                          {challenge.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground items-center">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {challenge.subject}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {challenge.authorName}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTimeAgo(challenge.createdAt)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`shrink-0 ${getLevelColor(challenge.difficulty)}`}
                        data-testid={`badge-level-${challenge.id}`}
                      >
                        Level {LEVEL_DISPLAY[challenge.difficulty] ?? challenge.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                      {challenge.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-md text-secondary-foreground font-medium">
                      <MessageSquare className="h-4 w-4" />
                      {challenge.responseCount} {challenge.responseCount === 1 ? "response" : "responses"}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* ── Sidebar ────────────────────────────── */}
      <div className="space-y-6">

        {/* Platform Stats */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              Platform Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            {statsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : stats ? (
              <>
                {/* 4-stat grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3 border shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      Challenges
                    </div>
                    <div className="text-2xl font-bold text-primary font-mono">{stats.totalChallenges}</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 border shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                      Responses
                    </div>
                    <div className="text-2xl font-bold text-blue-600 font-mono">{stats.totalResponses}</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 border shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-amber-500" />
                      Tutors
                    </div>
                    <div className="text-2xl font-bold text-amber-600 font-mono">
                      {tutorCount ?? "—"}
                    </div>
                  </div>
                  <div className="bg-background rounded-lg p-3 border shadow-sm flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <svg viewBox="0 0 24 24" fill="#25D366" className="h-3.5 w-3.5">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Groups
                    </div>
                    <div className="text-2xl font-bold text-[#25D366] font-mono">{groupCount}</div>
                  </div>
                </div>

                {/* By Courses */}
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    By Courses
                  </h4>
                  <div className="space-y-1.5">
                    {stats.bySubject.map((s) => (
                      <div key={s.subject} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground truncate pr-2">{s.subject}</span>
                        <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs text-secondary-foreground shrink-0">
                          {s.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Topics */}
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    By Topics
                  </h4>
                  <div className="space-y-1.5">
                    {stats.byDifficulty.map((d) => (
                      <div key={d.difficulty} className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${getLevelColor(d.difficulty).split(" ")[0]}`} />
                          Level {LEVEL_DISPLAY[d.difficulty] ?? d.difficulty}
                        </span>
                        <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs text-secondary-foreground shrink-0">
                          {d.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Challenges */}
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5" />
                    By Challenges
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Open (no answers)</span>
                      <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs text-secondary-foreground">
                        {(challenges ?? []).filter((c) => c.responseCount === 0).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Answered</span>
                      <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs text-secondary-foreground">
                        {(challenges ?? []).filter((c) => c.responseCount > 0).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* By Tutors */}
                <div>
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    By Tutors
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Active tutors</span>
                      <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs text-secondary-foreground">
                        {tutorCount ?? "—"}
                      </span>
                    </div>
                    <div className="pt-1">
                      <Link href="/smart-connect">
                        <button className="text-xs text-primary hover:underline">
                          Book a session →
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-3">
                {activity.map((item, i) => (
                  <div key={`${item.type}-${item.id}-${i}`} className="flex items-start gap-2.5">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-secondary shrink-0 mt-0.5">
                      {item.type === "challenge" ? (
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 bg-muted/30 rounded-md p-2.5 text-sm border">
                      <div className="flex justify-between items-center gap-2 mb-0.5">
                        <span className="font-semibold text-foreground text-xs truncate">{item.authorName}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                          {formatTimeAgo(item.createdAt).replace("about ", "")}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs line-clamp-1">
                        {item.type === "challenge" ? "Posted: " : "Replied to: "}
                        <Link
                          href={`/challenges/${item.challengeId || item.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {item.title}
                        </Link>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-4">
                No recent activity.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard — below recent activity */}
        <Leaderboard />

        {/* Talent Discovery */}
        <TalentDiscovery />

        {/* Study Circle */}
        <StudyCircle />
      </div>
    </div>
  );
}
