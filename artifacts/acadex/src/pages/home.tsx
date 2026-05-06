import Leaderboard from "../components/Leaderboard";
import TalentDiscovery from "../components/TalentDiscovery";
import StudyCircle from "../components/StudyCircle";
import { useListChallenges, useGetChallengeStats, useGetRecentActivity } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatTimeAgo } from "@/lib/date-utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, BookOpen, User, Flame, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
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

  const apiDifficulty = LEVEL_TO_API[levelFilter] || (levelFilter && !LEVEL_TO_API[levelFilter] ? levelFilter : undefined);

  const { data: challenges, isLoading: challengesLoading } = useListChallenges({
    subject: subjectFilter && subjectFilter !== "all" ? subjectFilter : undefined,
    difficulty: apiDifficulty,
  });

  const { data: stats, isLoading: statsLoading } = useGetChallengeStats();
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
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
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="300">300</SelectItem>
                <SelectItem value="400">400</SelectItem>
                <SelectItem value="500">500</SelectItem>
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

      <div className="space-y-8">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Platform Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            {statsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-md p-3 border shadow-sm">
                    <div className="text-2xl font-serif font-bold text-primary">{stats.totalChallenges}</div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Challenges</div>
                  </div>
                  <div className="bg-background rounded-md p-3 border shadow-sm">
                    <div className="text-2xl font-serif font-bold text-primary">{stats.totalResponses}</div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Responses</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">By Courses</h4>
                  <div className="space-y-2">
                    {stats.bySubject.map((s) => (
                      <div key={s.subject} className="flex justify-between items-center text-muted-foreground">
                        <span className="truncate pr-2">{s.subject}</span>
                        <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">By Topics</h4>
                  <div className="space-y-2">
                    {stats.byDifficulty.map((d) => (
                      <div key={d.difficulty} className="flex justify-between items-center text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className={`inline-block w-2 h-2 rounded-full ${getLevelColor(d.difficulty).split(" ")[0]}`} />
                          Level {LEVEL_DISPLAY[d.difficulty] ?? d.difficulty}
                        </span>
                        <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-xs">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
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
              <div className="relative space-y-4 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {activity.map((item, i) => (
                  <div key={`${item.type}-${item.id}-${i}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-background bg-secondary shrink-0 z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm">
                      {item.type === "challenge" ? (
                        <BookOpen className="h-2.5 w-2.5 text-primary" />
                      ) : (
                        <MessageSquare className="h-2.5 w-2.5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-background p-3 rounded border shadow-sm text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-foreground truncate max-w-[80%]">
                          {item.authorName}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatTimeAgo(item.createdAt).replace("about ", "")}
                        </span>
                      </div>
                      <p className="text-muted-foreground line-clamp-1">
                        {item.type === "challenge" ? "Posted challenge: " : "Responded to: "}
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

        <div style={{ marginTop: "2rem" }}>
          <TalentDiscovery />
        </div>

        <div style={{ marginTop: "2rem" }}>
          <StudyCircle />
        </div>

        <div style={{ marginTop: "2rem" }}>
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
