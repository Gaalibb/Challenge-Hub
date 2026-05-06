import { Router } from "express";
import { db, responsesTable, challengesTable } from "@workspace/db";
import { sql, eq, count } from "drizzle-orm";

const router = Router();

router.get("/talent", async (req, res) => {
  const responseStats = await db
    .select({
      authorName: responsesTable.authorName,
      totalResponses: sql<number>`cast(count(*) as int)`,
      avgContentLength: sql<number>`cast(avg(length(${responsesTable.content})) as int)`,
      uniqueChallenges: sql<number>`cast(count(distinct ${responsesTable.challengeId}) as int)`,
    })
    .from(responsesTable)
    .groupBy(responsesTable.authorName);

  const totalChallenges = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(challengesTable);

  const total = totalChallenges[0]?.count ?? 1;

  const talents = responseStats.map((u) => {
    const qualityScore = Math.min(100, Math.round((u.avgContentLength / 600) * 100));
    const engagementScore = Math.min(100, Math.round((u.uniqueChallenges / total) * 100));
    const talentScore = Math.round(qualityScore * 0.5 + engagementScore * 0.3 + Math.min(100, u.totalResponses * 10) * 0.2);
    return {
      authorName: u.authorName,
      totalResponses: u.totalResponses,
      qualityScore,
      engagementScore,
      talentScore,
    };
  });

  const topHelpers = [...talents]
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 5);

  const potentialTutors = [...talents]
    .sort((a, b) => b.engagementScore - a.engagementScore || b.totalResponses - a.totalResponses)
    .slice(0, 5);

  res.json({ topHelpers, potentialTutors });
});

export default router;
