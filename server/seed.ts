import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { dueItems, actionItems } from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function seed() {
  console.log("Seeding database...");

  // Seed action items
  const actions = [
    {
      id: "definitions",
      title: "Lock stage definitions + entry/exit criteria",
      why: "Without shared definitions, pipeline metrics can't be trusted for decision-making.",
      owner: "Advancement Services",
      horizon: "Now",
      impact: "High",
      metric: "% opportunities with valid stage + last move date",
    },
    {
      id: "contactability",
      title: "Prioritize contactability cleanup for reachable audience",
      why: "Improve activation odds by ensuring we can reliably reach constituents.",
      owner: "AS + IT",
      horizon: "This quarter",
      impact: "High",
      metric: "Stale contact % and bounce rate trend",
    },
    {
      id: "capacity",
      title: "Fill capacity/affinity placeholders for top segments",
      why: "Better qualification improves officer focus and reduces wasted outreach.",
      owner: "Prospect Research",
      horizon: "This quarter",
      impact: "Medium",
      metric: "Missing capacity % in top tiers",
    },
    {
      id: "dedupe",
      title: "Run a monthly duplicate-risk review",
      why: "Duplicates distort counts, suppress outreach, and harm stewardship experience.",
      owner: "Data Steward",
      horizon: "This year",
      impact: "Medium",
      metric: "Duplicate risk % and merge throughput",
    },
  ];

  for (const action of actions) {
    await db.insert(actionItems).values(action).onConflictDoNothing();
  }

  // Seed due items
  const dueItemsData = [
    {
      title: "Publish data governance definitions + policy",
      owner: "Advancement Services",
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 30), // 30 hours from now
      status: "Open",
      notes: "Finalize definitions, access rules, and change-control cadence.",
    },
    {
      title: "Amplify campaign briefing (internal)",
      owner: "IA",
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 90), // 90 hours from now
      status: "Open",
      notes: "Confirm goal framing, segmentation emphasis, and outreach calendar.",
    },
    {
      title: "Stewardship touchpoint pack for re-activation",
      owner: "Stewardship",
      dueAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago (expired)
      status: "Open",
      notes: "Templates + next-best-action cues; validate tone + compliance.",
    },
  ];

  for (const item of dueItemsData) {
    await db.insert(dueItems).values(item);
  }

  console.log("Seeding complete!");
  await pool.end();
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
