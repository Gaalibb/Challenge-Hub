import { Router } from "express";
import { db } from "../lib/db";
import { responses, users } from "../lib/schema";
import { eq } from "drizzle-orm";

const router = Router();

// POST a new response
router.post("/", async (req, res) => {
  try {
    const { challengeId, author, content } = req.body;

    if (!challengeId || !author || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert the response
    const inserted = await db
      .insert(responses)
      .values({
        challengeId,
        author,
        content,
        createdAt: new Date(),
      })
      .returning();

    // ⭐ TalentDiscovery scoring logic
    // Every response gives the author +1 point
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.name, author));

    if (existingUser.length === 0) {
      // Create new user with score = 1
      await db.insert(users).values({
        name: author,
        score: 1,
      });
    } else {
      // Increase score by 1
      await db
        .update(users)
        .set({ score: existingUser[0].score + 1 })
        .where(eq(users.name, author));
    }

    return res.json({ success: true, response: inserted[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET all responses for a challenge
router.get("/:challengeId", async (req, res) => {
  try {
    const challengeId = Number(req.params.challengeId);

    const result = await db
      .select()
      .from(responses)
      .where(eq(responses.challengeId, challengeId));

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;