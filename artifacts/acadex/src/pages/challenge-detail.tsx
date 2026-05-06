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
import { ArrowLeft, BookOpen, Clock, Loader2, MessageSquare, User, Star, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
                  {challenge.subject}
                </span>
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
            </div>

            <div className="bg-card border rounded-lg p-6 md:p-8 text-card-foreground shadow-sm">
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none font-serif leading-relaxed whitespace-pre-wrap">
                {challenge.description}
              </div>
            </div>
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
