import { Router } from "express";
import { db, challengesTable, responsesTable } from "@workspace/db";
import {
  ListChallengesQueryParams,
  CreateChallengeBody,
  GetChallengeParams,
  CreateResponseParams,
  CreateResponseBody,
} from "@workspace/api-zod";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

router.get("/challenges", async (req, res) => {
  const query = ListChallengesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { subject, difficulty } = query.data;

  let baseQuery = db
    .select({
      id: challengesTable.id,
      title: challengesTable.title,
      description: challengesTable.description,
      subject: challengesTable.subject,
      courseCode: challengesTable.courseCode,
      lecturerName: challengesTable.lecturerName,
      topic: challengesTable.topic,
      difficulty: challengesTable.difficulty,
      authorName: challengesTable.authorName,
      createdAt: challengesTable.createdAt,
      responseCount: sql<number>`cast(count(${responsesTable.id}) as int)`,
    })
    .from(challengesTable)
    .leftJoin(responsesTable, eq(responsesTable.challengeId, challengesTable.id))
    .groupBy(challengesTable.id)
    .orderBy(desc(challengesTable.createdAt));

  const conditions: ReturnType<typeof eq>[] = [];
  if (subject) conditions.push(eq(challengesTable.subject, subject));
  if (difficulty) conditions.push(eq(challengesTable.difficulty, difficulty));

  let results;
  if (conditions.length > 0) {
    const { and } = await import("drizzle-orm");
    results = await baseQuery.where(and(...conditions));
  } else {
    results = await baseQuery;
  }

  res.json(results);
});

router.post("/challenges", async (req, res) => {
  const body = CreateChallengeBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const [challenge] = await db
    .insert(challengesTable)
    .values(body.data)
    .returning();
  res.status(201).json({ ...challenge, responseCount: 0 });
});

router.get("/challenges/stats/summary", async (req, res) => {
  const [totals] = await db
    .select({
      totalChallenges: sql<number>`cast(count(distinct ${challengesTable.id}) as int)`,
      totalResponses: sql<number>`cast(count(${responsesTable.id}) as int)`,
    })
    .from(challengesTable)
    .leftJoin(responsesTable, eq(responsesTable.challengeId, challengesTable.id));

  const bySubject = await db
    .select({
      subject: challengesTable.subject,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(challengesTable)
    .groupBy(challengesTable.subject)
    .orderBy(desc(sql`count(*)`));

  const byDifficulty = await db
    .select({
      difficulty: challengesTable.difficulty,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(challengesTable)
    .groupBy(challengesTable.difficulty);

  res.json({
    totalChallenges: totals?.totalChallenges ?? 0,
    totalResponses: totals?.totalResponses ?? 0,
    bySubject,
    byDifficulty,
  });
});

router.get("/challenges/recent/activity", async (req, res) => {
  const recentChallenges = await db
    .select({
      type: sql<"challenge">`'challenge'`,
      id: challengesTable.id,
      challengeId: sql<number | null>`null`,
      title: challengesTable.title,
      subject: challengesTable.subject,
      courseCode: challengesTable.courseCode,
      lecturerName: challengesTable.lecturerName,
      topic: challengesTable.topic,
      authorName: challengesTable.authorName,
      createdAt: challengesTable.createdAt,
    })
    .from(challengesTable)
    .orderBy(desc(challengesTable.createdAt))
    .limit(10);

  const recentResponses = await db
    .select({
      type: sql<"response">`'response'`,
      id: responsesTable.id,
      challengeId: responsesTable.challengeId,
      title: challengesTable.title,
      subject: challengesTable.subject,
      courseCode: challengesTable.courseCode,
      lecturerName: challengesTable.lecturerName,
      topic: challengesTable.topic,
      authorName: responsesTable.authorName,
      createdAt: responsesTable.createdAt,
    })
    .from(responsesTable)
    .innerJoin(challengesTable, eq(challengesTable.id, responsesTable.challengeId))
    .orderBy(desc(responsesTable.createdAt))
    .limit(10);

  const combined = [...recentChallenges, ...recentResponses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15);

  res.json(combined);
});

router.get("/challenges/:id", async (req, res) => {
  const params = GetChallengeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const { id } = params.data;

  const [challenge] = await db
    .select({
      id: challengesTable.id,
      title: challengesTable.title,
      description: challengesTable.description,
      subject: challengesTable.subject,
      courseCode: challengesTable.courseCode,
      lecturerName: challengesTable.lecturerName,
      topic: challengesTable.topic,
      difficulty: challengesTable.difficulty,
      authorName: challengesTable.authorName,
      createdAt: challengesTable.createdAt,
    })
    .from(challengesTable)
    .where(eq(challengesTable.id, id));

  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  const responses = await db
    .select()
    .from(responsesTable)
    .where(eq(responsesTable.challengeId, id))
    .orderBy(responsesTable.createdAt);

  res.json({ ...challenge, responseCount: responses.length, responses });
});

router.post("/challenges/:id/responses", async (req, res) => {
  const params = CreateResponseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const body = CreateResponseBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [challenge] = await db
    .select({ id: challengesTable.id })
    .from(challengesTable)
    .where(eq(challengesTable.id, params.data.id));

  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  const [response] = await db
    .insert(responsesTable)
    .values({ challengeId: params.data.id, ...body.data })
    .returning();

  res.status(201).json(response);
});

export default router;
