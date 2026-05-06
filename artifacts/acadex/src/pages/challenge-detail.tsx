import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetChallenge,
  getGetChallengeQueryKey,
  useCreateResponse,
  getGetChallengeStatsQueryKey,
  getGetRecentActivityQueryKey,
  getListChallengesQueryKey
} from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { formatTimeAgo, formatDate } from "@/lib/date-utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Clock, Loader2, MessageSquare, User, Star, TrendingUp, Users, Hash, GraduationCap, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StudyCircle from "@/components/StudyCircle";

interface TalentUser {
  authorName: string;
  totalResponses: number;
  qualityScore: number;
  engagementScore: number;
  talentScore: number;
}

function useTalentMap() {
  const [map, setMap] = useState<Record<string, TalentUser>>({});
  useEffect(() => {
    fetch("/api/talent")
      .then((r) => r.json())
      .then((d: { topHelpers: TalentUser[]; potentialTutors: TalentUser[] }) => {
        const merged: Record<string, TalentUser> = {};
        [...d.topHelpers, ...d.potentialTutors].forEach((u) => {
          merged[u.authorName] = u;
        });
        setMap(merged);
      })
      .catch(() => {});
  }, []);
  return map;
}

function TalentBadge({ score }: { score: number }) {
  if (score >= 70)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 px-1.5 py-0.5 rounded">
        <Star className="h-3 w-3" />
        Top Helper
      </span>
    );
  if (score >= 40)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 rounded">
        <TrendingUp className="h-3 w-3" />
        Rising
      </span>
    );
  return null;
}

const LEVEL_DISPLAY: Record<string, string> = {
  beginner: "100",
  intermediate: "200",
  advanced: "300",
};

const responseSchema = z.object({
  content: z.string().min(10, "Response must be at least 10 characters"),
  authorName: z.string().min(2, "Author name is required").max(50),
});

type ResponseFormValues = z.infer<typeof responseSchema>;

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

export default function ChallengeDetail() {
  const params = useParams<{ id: string }>();
  const challengeId = parseInt(params.id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: challenge, isLoading, isError } = useGetChallenge(challengeId, {
    query: {
      enabled: !!challengeId && !isNaN(challengeId),
      queryKey: getGetChallengeQueryKey(challengeId)
    }
  });

  const createResponse = useCreateResponse();
  const talentMap = useTalentMap();
  const [showStudyCircle, setShowStudyCircle] = useState(false);

  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      content: "",
      authorName: "",
    },
  });

  const onSubmit = (data: ResponseFormValues) => {
    createResponse.mutate(
      { id: challengeId, data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetChallengeQueryKey(challengeId) });
          queryClient.invalidateQueries({ queryKey: getListChallengesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetChallengeStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });

          toast({
            title: "Response Posted",
            description: "Your response has been added to the discussion.",
          });

          form.reset();
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to post your response. Please try again.",
          });
        }
      }
    );
  };

  if (!challengeId || isNaN(challengeId)) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Invalid Challenge ID</h2>
        <p className="text-muted-foreground mt-2">The challenge you are looking for does not exist.</p>
        <Link href="/">
          <Button className="mt-6" variant="outline">Return to Home</Button>
        </Link>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Challenge Not Found</h2>
        <p className="text-muted-foreground mt-2">This challenge may have been removed or never existed.</p>
        <Link href="/">
          <Button className="mt-6" variant="outline">Return to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-32 w-full mt-6" />
          </div>
        ) : challenge ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary leading-tight">
                  {challenge.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Badge
                  variant="secondary"
                  className={`shrink-0 text-xs ${getLevelColor(challenge.difficulty)}`}
                  data-testid="badge-challenge-level"
                >
                  Level {LEVEL_DISPLAY[challenge.difficulty] ?? challenge.difficulty}
                </Badge>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {challenge.courseCode
                    ? `${challenge.courseCode} — ${challenge.subject}`
                    : challenge.subject}
                </span>
                {challenge.lecturerName && (
                  <>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {challenge.lecturerName}
                    </span>
                  </>
                )}
                <span>&bull;</span>
                <span className="flex items-center gap-1 font-medium text-foreground">
                  <User className="h-4 w-4" />
                  {challenge.authorName}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1" title={formatDate(challenge.createdAt)}>
                  <Clock className="h-4 w-4" />
                  {formatTimeAgo(challenge.createdAt)}
                </span>
              </div>

              {challenge.topic && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-md px-3 py-2 w-fit">
                  <Tag className="h-4 w-4 shrink-0" />
                  <span><span className="font-medium text-foreground">Topic:</span> {challenge.topic}</span>
                </div>
              )}
            </div>

            <div className="bg-card border rounded-lg p-6 md:p-8 text-card-foreground shadow-sm">
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none font-serif leading-relaxed whitespace-pre-wrap">
                {challenge.description}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-4 rounded-lg border border-[#25D366]/30 bg-[#25D366]/5">
              <div className="flex items-center gap-3">
                <div className="bg-[#25D366] text-white p-2 rounded-md shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Study with peers on this topic</p>
                  <p className="text-xs text-muted-foreground">Join a {challenge.subject} StudyCircle WhatsApp group</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366] shrink-0"
                onClick={() => setShowStudyCircle((v) => !v)}
                data-testid="button-join-studycircle"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {showStudyCircle ? "Hide Groups" : "Join StudyCircle"}
              </Button>
            </div>

            {showStudyCircle && (
              <div className="animate-in slide-in-from-top-2 duration-200">
                <StudyCircle subjectFilter={challenge.subject} showAll />
              </div>
            )}
          </div>
        ) : null}
      </div>

      <Separator />

      <div className="space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Discussion
          {!isLoading && challenge && (
            <span className="text-muted-foreground font-normal text-lg ml-2">
              ({challenge.responses?.length || 0})
            </span>
          )}
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : challenge?.responses?.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No responses yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:ml-[1.9rem] before:h-full before:w-0.5 before:bg-border/50">
            {challenge?.responses?.map((response) => (
              <div key={response.id} className="relative flex items-start gap-4">
                <div className="flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-full border-2 border-background bg-secondary text-secondary-foreground font-bold shrink-0 z-10 shadow-sm mt-1">
                  {response.authorName.substring(0, 2).toUpperCase()}
                </div>

                <Card className="flex-1 border shadow-sm">
                  <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-primary">{response.authorName}</span>
                        {talentMap[response.authorName] && (
                          <TalentBadge score={talentMap[response.authorName].talentScore} />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground" title={formatDate(response.createdAt)}>
                        {formatTimeAgo(response.createdAt)}
                      </span>
                    </div>
                    {talentMap[response.authorName] && (
                      <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-emerald-500" />
                          Quality {talentMap[response.authorName].qualityScore}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-blue-500" />
                          Engagement {talentMap[response.authorName].engagementScore}
                        </span>
                        <span>{talentMap[response.authorName].totalResponses} total responses</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="py-4 px-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none font-serif whitespace-pre-wrap">
                      {response.content}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {!isLoading && (
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl">Post a Response</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Solution or Thoughts</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed explanation, proof, or approach..."
                          className="min-h-[150px] resize-y font-mono text-sm bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="w-full sm:max-w-xs">
                    <FormField
                      control={form.control}
                      name="authorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Dr. Smith or Student123" className="bg-background" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={createResponse.isPending} className="w-full sm:w-auto">
                    {createResponse.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Response"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
