import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateChallenge, getListChallengesQueryKey, getGetChallengeStatsQueryKey, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Loader2, Hash, GraduationCap, Tag, User } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title is too long"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  subject: z.string().min(2, "Course Title is required"),
  courseCode: z.string().optional(),
  lecturerName: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  authorName: z.string().min(2, "Author name is required").max(50),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewChallenge() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      courseCode: "",
      lecturerName: "",
      topic: "",
      difficulty: "intermediate",
      authorName: "",
    },
  });

  const createChallenge = useCreateChallenge();

  const onSubmit = (data: FormValues) => {
    createChallenge.mutate(
      {
        data: {
          ...data,
          courseCode: data.courseCode || null,
          lecturerName: data.lecturerName || null,
          topic: data.topic || null,
        },
      },
      {
        onSuccess: (challenge) => {
          queryClient.invalidateQueries({ queryKey: getListChallengesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetChallengeStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });

          toast({
            title: "Challenge Posted",
            description: "Your academic challenge has been successfully published.",
          });

          setLocation(`/challenges/${challenge.id}`);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to post the challenge. Please try again.",
          });
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Post a Challenge</h1>
        <p className="text-muted-foreground mt-1">Share an academic problem for the community to solve.</p>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Challenge Details
          </CardTitle>
          <CardDescription>
            Be precise and provide enough context for others to form a thoughtful response.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* ── Challenge Title ─────────────── */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenge Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Explain the principle of reversibility in thermodynamics" {...field} />
                    </FormControl>
                    <FormDescription>A clear, specific title for the problem.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ── Course Info row 1: Code + Title ─ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        Course Code
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ECE 514" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        Course Title <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Cyberpreneurship" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ── Course Info row 2: Lecturer + Topic ─ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lecturerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                        Lecturer Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Dr. Mary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        Topic
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Introduction to Cyberpreneurship" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ── Level ───────────────────────── */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem className="max-w-[200px]">
                    <FormLabel>Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-level">
                          <SelectValue placeholder="Select a level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Level 100</SelectItem>
                        <SelectItem value="intermediate">Level 200</SelectItem>
                        <SelectItem value="advanced">Level 300</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ── Description ─────────────────── */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detail the problem, known constraints, and what a successful solution looks like..."
                        className="min-h-[180px] resize-y font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Provide enough context for others to give a thoughtful response.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ── Author ──────────────────────── */}
              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Your Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. Smith or Student123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/">
                  <Button type="button" variant="ghost">Cancel</Button>
                </Link>
                <Button type="submit" disabled={createChallenge.isPending}>
                  {createChallenge.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Challenge"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
