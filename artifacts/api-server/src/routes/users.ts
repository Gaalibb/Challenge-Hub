import { Router } from "express";
import { db, responsesTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const result = await db
    .select({
      name: responsesTable.authorName,
      score: sql<number>`cast(count(*) as int)`,
    })
    .from(responsesTable)
    .groupBy(responsesTable.authorName)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  res.json(result);
});

export default router;
