import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { dueItems, actionItems, donors } from "@shared/schema";

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

  // Seed donors
  const donorsData = [
    {
      name: "Margaret Chen",
      type: "Individual",
      organization: null,
      totalGiven: "250000.00",
      lastGiftDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      lastGiftAmount: "50000.00",
      email: "m.chen@email.com",
      phone: "(617) 555-0101",
      city: "Boston",
      state: "MA",
    },
    {
      name: "The Morrison Family Foundation",
      type: "Foundation",
      organization: "Morrison Family Foundation",
      totalGiven: "1500000.00",
      lastGiftDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
      lastGiftAmount: "500000.00",
      email: "grants@morrisonfoundation.org",
      phone: "(212) 555-0202",
      city: "New York",
      state: "NY",
    },
    {
      name: "Harmony Music Corp",
      type: "Corporation",
      organization: "Harmony Music Corporation",
      totalGiven: "750000.00",
      lastGiftDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      lastGiftAmount: "100000.00",
      email: "giving@harmonymusic.com",
      phone: "(310) 555-0303",
      city: "Los Angeles",
      state: "CA",
    },
    {
      name: "Robert Williams Jr.",
      type: "Individual",
      organization: "Williams Holdings LLC",
      totalGiven: "125000.00",
      lastGiftDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      lastGiftAmount: "25000.00",
      email: "rwilliams@williams-llc.com",
      phone: "(617) 555-0404",
      city: "Cambridge",
      state: "MA",
    },
    {
      name: "Fender Musical Instruments Foundation",
      type: "Foundation",
      organization: "Fender Foundation",
      totalGiven: "2000000.00",
      lastGiftDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
      lastGiftAmount: "250000.00",
      email: "foundation@fender.com",
      phone: "(480) 555-0505",
      city: "Scottsdale",
      state: "AZ",
    },
    {
      name: "Sarah Martinez",
      type: "Individual",
      organization: null,
      totalGiven: "45000.00",
      lastGiftDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      lastGiftAmount: "5000.00",
      email: "sarah.m@gmail.com",
      phone: "(617) 555-0606",
      city: "Brookline",
      state: "MA",
    },
    {
      name: "SoundWave Technologies",
      type: "Corporation",
      organization: "SoundWave Technologies Inc.",
      totalGiven: "350000.00",
      lastGiftDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      lastGiftAmount: "75000.00",
      email: "csr@soundwavetech.com",
      phone: "(415) 555-0707",
      city: "San Francisco",
      state: "CA",
    },
    {
      name: "The Berklee Alumni Association",
      type: "Foundation",
      organization: "Berklee Alumni Fund",
      totalGiven: "890000.00",
      lastGiftDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      lastGiftAmount: "15000.00",
      email: "alumni@berklee.edu",
      phone: "(617) 555-0808",
      city: "Boston",
      state: "MA",
    },
  ];

  for (const donor of donorsData) {
    await db.insert(donors).values(donor);
  }

  console.log("Seeding complete!");
  await pool.end();
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
