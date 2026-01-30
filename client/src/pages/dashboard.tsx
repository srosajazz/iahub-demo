import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";
import {
  ArrowRight,
  Check,
  ClipboardList,
  Database,
  Flag,
  Radar,
  Sparkles,
  Timer,
} from "lucide-react";

type PipelineStage = {
  name: "Discovery" | "Cultivation" | "Solicitation" | "Stewardship";
  count: number;
};

type InitiativeTimelineStep = {
  label: string;
  weeks: number;
  owner: string;
};

type ActionItem = {
  id: string;
  title: string;
  why: string;
  owner: string;
  horizon: "Now" | "This quarter" | "This year";
  impact: "High" | "Medium" | "Low";
  metric: string;
};

type DashboardData = {
  disclaimer: string;
  donorPipeline: PipelineStage[];
  campaign: {
    goal: number;
    projected: number;
    asOfLabel: string;
  };
  engagement: {
    reachableAudience: number;
    activeDonorRate: number;
    note: string;
  };
  dataQuality: {
    missingCapacityPct: number;
    duplicateRiskPct: number;
    staleContactPct: number;
  };
  strategy: {
    initiativeName: string;
    goalFrame: string;
    northStar: {
      label: string;
      value: string;
      note: string;
    };
    progress: {
      label: string;
      currentPct: number;
      note: string;
    };
    timeline: InitiativeTimelineStep[];
    challenges: string[];
    crossFunctional: string[];
    technology: string[];
  };
  actions: ActionItem[];
  narrative: {
    question1: {
      headline: string;
      bullets: string[];
    };
    question3: {
      headline: string;
      bullets: string[];
    };
  };
};

function formatCompact(n: number) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

function formatPercent(n: number) {
  return `${Math.round(n * 100)}%`;
}

function clampPct(n: number) {
  return Math.max(0, Math.min(1, n));
}

const SYNTHETIC_DASHBOARD: DashboardData = {
  disclaimer: "Illustrative dashboard using synthetic data. Conceptual example only.",
  donorPipeline: [
    { name: "Discovery", count: 820 },
    { name: "Cultivation", count: 460 },
    { name: "Solicitation", count: 210 },
    { name: "Stewardship", count: 340 },
  ],
  campaign: {
    goal: 12000000,
    projected: 8600000,
    asOfLabel: "As of this quarter",
  },
  engagement: {
    reachableAudience: 140000,
    activeDonorRate: 0.02,
    note:
      "Large reachable audience; a small activated segment suggests meaningful stewardship and qualification opportunity.",
  },
  dataQuality: {
    missingCapacityPct: 0.34,
    duplicateRiskPct: 0.08,
    staleContactPct: 0.22,
  },
  strategy: {
    initiativeName: "Activation + Pipeline Visibility Initiative",
    goalFrame:
      "Increase activated donors, improve pipeline conversion visibility, and strengthen forecasting confidence with governance-aware reporting.",
    northStar: {
      label: "Active donor activation (concept)",
      value: "2% → 3%",
      note:
        "Contextual example only; used to align outreach, stewardship, and segmentation priorities.",
    },
    progress: {
      label: "Readiness / adoption (illustrative)",
      currentPct: 0.62,
      note:
        "Reflects dashboard adoption, data-quality remediation progress, and moves-management consistency. (Synthetic.)",
    },
    timeline: [
      { label: "Baseline + definitions", weeks: 2, owner: "Advancement Services" },
      { label: "Dashboard v1 + governance", weeks: 4, owner: "AS + IT" },
      { label: "Pilot moves management", weeks: 6, owner: "Gift Officers" },
      { label: "Scale + iterate", weeks: 8, owner: "All teams" },
    ],
    challenges: [
      "Low activation requires careful stewardship framing (avoid misinterpretation)",
      "Inconsistent stage definitions reduce comparability",
      "Data completeness (capacity, contactability) limits segmentation confidence",
      "Change management: adoption across teams",
    ],
    crossFunctional: [
      "IT (data feeds, CRM admin, access controls)",
      "Finance (recon, gift processing integrity)",
      "Student Services / Alumni Relations (engagement signals)",
      "Leadership (definitions, thresholds, and decision cadence)",
    ],
    technology: [
      "CRM + reporting layer (concept)",
      "Dashboards + automated refresh (concept)",
      "Prospect research inputs + scoring (concept)",
      "Moves management discipline + stage hygiene (concept)",
    ],
  },
  actions: [
    {
      id: "definitions",
      title: "Lock stage definitions + entry/exit criteria",
      why: "Without shared definitions, pipeline metrics can’t be trusted for decision-making.",
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
  ],
  narrative: {
    question1: {
      headline: "Analytics-driven pipeline strengthening",
      bullets: [
        "Set clear stage-based goals (volume + conversion + velocity)",
        "Measured progress with weekly pacing + monthly cohort conversion",
        "Aligned short-term activation with long-term pipeline health (stewardship + qualification)",
        "Used dashboards for exec visibility; officers used a short action list",
        "Partnered with Prospect Research + IT + Finance for consistent definitions and trustworthy reporting",
      ],
    },
    question3: {
      headline: "Advancement Services data strategy (campaign readiness)",
      bullets: [
        "Govern definitions, policies, and role-based access (trust + compliance)",
        "Modernize reporting: fewer dashboards, clearer decisions, consistent cadence",
        "Improve CRM hygiene (contactability, dedupe, capacity fields) to enable segmentation",
        "Strengthen gift ops + reconciliation confidence to support forecasting",
        "Build collaborative relationships across IT/Finance/Alumni to connect engagement signals to strategy",
      ],
    },
  },
};

export default function DashboardPage() {
  const data = SYNTHETIC_DASHBOARD;
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const pipelineTotal = useMemo(
    () => data.donorPipeline.reduce((sum, s) => sum + s.count, 0),
    [data],
  );

  const campaignPct = clampPct(data.campaign.projected / data.campaign.goal);

  const pipelineColors = {
    Discovery: "hsl(var(--chart-3))",
    Cultivation: "hsl(var(--chart-2))",
    Solicitation: "hsl(var(--chart-4))",
    Stewardship: "hsl(var(--chart-1))",
  } as const;

  const quality = [
    {
      key: "Missing capacity",
      value: data.dataQuality.missingCapacityPct,
      icon: Database,
    },
    {
      key: "Duplicate risk",
      value: data.dataQuality.duplicateRiskPct,
      icon: Radar,
    },
    {
      key: "Stale contact",
      value: data.dataQuality.staleContactPct,
      icon: Sparkles,
    },
  ];

  const doneCount = doneIds.size;
  const actionsTotal = data.actions.length;
  const actionsDonePct = actionsTotal > 0 ? doneCount / actionsTotal : 0;

  function toggleDone(id: string) {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-dvh hero-wash grain">
      <header className="mx-auto w-full max-w-6xl px-5 pt-10 pb-6">
        <div className="flex flex-col gap-3">
          <Badge
            variant="secondary"
            className="w-fit rounded-full px-3 py-1 text-[12px]"
            data-testid="badge-disclaimer"
          >
            {data.disclaimer}
          </Badge>

          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-1">
              <h1
                className="font-serif text-3xl leading-tight tracking-[-0.02em] md:text-4xl"
                data-testid="text-title"
              >
                Advancement Services Dashboard
              </h1>
              <p
                className="text-sm text-muted-foreground md:text-[15px]"
                data-testid="text-subtitle"
              >
                Conceptual view of pipeline flow, campaign outlook, engagement opportunity, and data
                quality signals.
              </p>
            </div>

            <div className="flex items-center gap-2" data-testid="group-asof">
              <span className="text-xs text-muted-foreground" data-testid="text-asof-label">
                {data.campaign.asOfLabel}
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-xs" data-testid="text-records-note">
                Synthetic indicators only
              </span>
            </div>
          </div>

          <div className="mt-1 grid gap-3 md:grid-cols-12" data-testid="row-exec-strip">
            <Card className="md:col-span-8 border-border/70 bg-card/70 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/55">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary">
                      <ClipboardList className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <div className="text-sm font-medium" data-testid="text-actions-title">
                        Top actions
                      </div>
                      <div className="text-xs text-muted-foreground" data-testid="text-actions-subtitle">
                        A short, practical list pulled from the prompts.
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant="secondary"
                    className="rounded-full"
                    data-testid="badge-actions-progress"
                  >
                    {doneCount}/{actionsTotal} done
                  </Badge>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted" data-testid="progress-actions">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(actionsDonePct * 100)}%`,
                      background: "linear-gradient(90deg, hsl(var(--chart-3)), hsl(var(--chart-2)))",
                    }}
                  />
                </div>

                <div className="text-xs text-muted-foreground" data-testid="text-actions-helper">
                  Mark items as done to simulate weekly operating cadence.
                </div>
              </div>
            </Card>

            <Card className="md:col-span-4 border-border/70 bg-card/70 p-4 backdrop-blur supports-[backdrop-filter]:bg-card/55">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground" data-testid="text-northstar-label">
                    {data.strategy.northStar.label}
                  </div>
                  <div className="mt-1 font-serif text-2xl" data-testid="text-northstar-value">
                    {data.strategy.northStar.value}
                  </div>
                </div>
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl bg-secondary"
                  aria-hidden="true"
                >
                  <Flag className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground" data-testid="text-northstar-note">
                {data.strategy.northStar.note}
              </div>
            </Card>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-14">
        <Tabs defaultValue="act" className="w-full" data-testid="tabs-sections">
          <TabsList
            className="h-10 w-full justify-start rounded-xl bg-card/60 p-1 backdrop-blur supports-[backdrop-filter]:bg-card/40"
            data-testid="tabslist-sections"
          >
            <TabsTrigger value="act" className="rounded-lg text-xs md:text-sm" data-testid="tab-act">
              Act now
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="rounded-lg text-xs md:text-sm"
              data-testid="tab-dashboard"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="strategy"
              className="rounded-lg text-xs md:text-sm"
              data-testid="tab-strategy"
            >
              Strategy notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="act" className="mt-4" data-testid="tabcontent-act">
            <div className="grid gap-4 md:grid-cols-12">
              <Card className="md:col-span-7 overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-medium" data-testid="text-actionlist-title">
                        Action list (from the prompts)
                      </h2>
                      <p className="text-xs text-muted-foreground" data-testid="text-actionlist-subtitle">
                        Keep this tight: definitions, contactability, capacity, dedupe.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      className="h-9 rounded-full"
                      onClick={() => setDoneIds(new Set())}
                      data-testid="button-reset-actions"
                    >
                      Reset
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3" data-testid="list-actions">
                    {data.actions.map((a) => {
                      const done = doneIds.has(a.id);
                      const impactTone =
                        a.impact === "High"
                          ? "bg-primary/10 text-foreground"
                          : a.impact === "Medium"
                            ? "bg-secondary text-foreground"
                            : "bg-muted text-muted-foreground";

                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => toggleDone(a.id)}
                          className="group w-full rounded-xl border border-border/70 bg-background/55 p-4 text-left transition hover:bg-background/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          data-testid={`button-action-${a.id}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span
                                className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl border border-border/70 bg-card/60"
                                aria-hidden="true"
                              >
                                {done ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Timer className="h-4 w-4 opacity-70" />
                                )}
                              </span>
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <div
                                    className="text-sm font-semibold transition group-hover:translate-x-[1px]"
                                    data-testid={`text-action-title-${a.id}`}
                                  >
                                    {a.title}
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className={`rounded-full px-2 py-0.5 text-[11px] ${impactTone}`}
                                    data-testid={`badge-action-impact-${a.id}`}
                                  >
                                    {a.impact}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="rounded-full px-2 py-0.5 text-[11px]"
                                    data-testid={`badge-action-horizon-${a.id}`}
                                  >
                                    {a.horizon}
                                  </Badge>
                                </div>

                                <div
                                  className="mt-1 text-xs text-muted-foreground"
                                  data-testid={`text-action-why-${a.id}`}
                                >
                                  {a.why}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                  <span className="text-muted-foreground">Owner:</span>
                                  <span data-testid={`text-action-owner-${a.id}`}>{a.owner}</span>
                                  <Separator orientation="vertical" className="h-4" />
                                  <span className="text-muted-foreground">Metric:</span>
                                  <span
                                    className="text-muted-foreground"
                                    data-testid={`text-action-metric-${a.id}`}
                                  >
                                    {a.metric}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <Badge
                                variant="secondary"
                                className={`rounded-full px-2 py-0.5 text-[11px] ${
                                  done
                                    ? "bg-emerald-500/15 text-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                                data-testid={`badge-action-status-${a.id}`}
                              >
                                {done ? "Done" : "Open"}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              <Card className="md:col-span-5 overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-medium" data-testid="text-initiative-title">
                        Initiative snapshot
                      </h2>
                      <p className="text-xs text-muted-foreground" data-testid="text-initiative-subtitle">
                        The executive framing behind the dashboard.
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-full" data-testid="badge-initiative">
                      Concept
                    </Badge>
                  </div>

                  <div
                    className="mt-4 rounded-xl border border-border/70 bg-background/55 p-4"
                    data-testid="panel-goalframe"
                  >
                    <div className="text-[11px] text-muted-foreground">Goal</div>
                    <div className="mt-1 text-sm font-medium" data-testid="text-goalframe">
                      {data.strategy.goalFrame}
                    </div>
                  </div>

                  <div
                    className="mt-3 rounded-xl border border-border/70 bg-background/55 p-4"
                    data-testid="panel-progress"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] text-muted-foreground">
                          {data.strategy.progress.label}
                        </div>
                        <div className="mt-1 text-lg font-semibold" data-testid="text-progress-value">
                          {formatPercent(data.strategy.progress.currentPct)}
                        </div>
                      </div>
                      <span
                        className="grid h-9 w-9 place-items-center rounded-xl bg-secondary"
                        aria-hidden="true"
                      >
                        <Timer className="h-4 w-4" />
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" data-testid="progress-readiness">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(clampPct(data.strategy.progress.currentPct) * 100)}%`,
                          background: "linear-gradient(90deg, hsl(var(--chart-2)), hsl(var(--chart-1)))",
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground" data-testid="text-progress-note">
                      {data.strategy.progress.note}
                    </div>
                  </div>

                  <div
                    className="mt-3 rounded-xl border border-border/70 bg-background/55 p-4"
                    data-testid="panel-timeline"
                  >
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" aria-hidden="true" />
                      <div className="text-sm font-medium" data-testid="text-timeline-title">
                        Timeline (illustrative)
                      </div>
                    </div>
                    <div className="mt-3 space-y-2" data-testid="list-timeline">
                      {data.strategy.timeline.map((t, idx) => (
                        <div
                          key={t.label}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/60 px-3 py-2"
                          data-testid={`row-timeline-${idx}`}
                        >
                          <div>
                            <div className="text-xs font-medium" data-testid={`text-timeline-label-${idx}`}>
                              {t.label}
                            </div>
                            <div
                              className="text-[11px] text-muted-foreground"
                              data-testid={`text-timeline-owner-${idx}`}
                            >
                              {t.owner}
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className="rounded-full"
                            data-testid={`badge-timeline-weeks-${idx}`}
                          >
                            {t.weeks}w
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="mt-4" data-testid="tabcontent-dashboard">
            <div className="grid gap-4 md:grid-cols-12">
              <Card className="md:col-span-7 overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col">
                      <h2 className="text-sm font-medium" data-testid="text-pipeline-title">
                        Donor pipeline stages
                      </h2>
                      <p className="text-xs text-muted-foreground" data-testid="text-pipeline-subtitle">
                        Illustrative counts by stage; used to discuss staffing, handoffs, and next-best actions.
                      </p>
                    </div>
                    <div className="rounded-full bg-secondary px-3 py-1 text-xs" data-testid="text-pipeline-total">
                      Total: {formatCompact(pipelineTotal)}
                    </div>
                  </div>

                  <div className="mt-4 h-[300px]" data-testid="chart-pipeline">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.donorPipeline} margin={{ left: 4, right: 10, top: 8 }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.35}
                        />
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          width={38}
                        />
                        <Tooltip
                          cursor={{ fill: "hsl(var(--primary) / 0.06)" }}
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 12,
                            boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                          itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Bar dataKey="count" radius={[12, 12, 12, 12]}>
                          {data.donorPipeline.map((stage) => (
                            <Cell key={stage.name} fill={pipelineColors[stage.name]} opacity={0.92} />
                          ))}
                          <LabelList
                            dataKey="count"
                            position="top"
                            formatter={(v: number) => formatCompact(v)}
                            style={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div
                    className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4"
                    data-testid="grid-pipeline-kpis"
                  >
                    {data.donorPipeline.map((s) => (
                      <div
                        key={s.name}
                        className="rounded-xl border border-border/70 bg-background/55 px-3 py-2"
                        data-testid={`kpi-stage-${s.name.toLowerCase()}`}
                      >
                        <div className="text-[11px] text-muted-foreground">{s.name}</div>
                        <div className="mt-1 text-sm font-semibold">{formatCompact(s.count)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="md:col-span-5 overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-medium" data-testid="text-campaign-title">
                        Campaign goal vs projection
                      </h2>
                      <p className="text-xs text-muted-foreground" data-testid="text-campaign-subtitle">
                        A simple view to anchor pacing and scenario discussion.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Projected</div>
                      <div className="text-sm font-semibold" data-testid="text-projected">
                        ${formatCompact(data.campaign.projected)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 h-[240px]" data-testid="chart-campaign">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 12,
                            boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                          itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Pie
                          dataKey="value"
                          data={[
                            { name: "Projected", value: data.campaign.projected },
                            {
                              name: "Remaining to goal",
                              value: Math.max(0, data.campaign.goal - data.campaign.projected),
                            },
                          ]}
                          innerRadius={64}
                          outerRadius={92}
                          paddingAngle={3}
                          stroke="hsl(var(--border))"
                          strokeWidth={1}
                        >
                          <Cell fill="hsl(var(--chart-1))" opacity={0.95} />
                          <Cell fill="hsl(var(--muted))" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-1 rounded-xl border border-border/70 bg-background/55 px-4 py-3">
                    <div className="flex items-center justify-between" data-testid="row-campaign-kpis">
                      <div>
                        <div className="text-[11px] text-muted-foreground">Goal</div>
                        <div className="text-sm font-semibold" data-testid="text-goal">
                          ${formatCompact(data.campaign.goal)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-muted-foreground">Progress</div>
                        <div className="text-sm font-semibold" data-testid="text-progress">
                          {formatPercent(campaignPct)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" data-testid="progress-campaign">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round(campaignPct * 100)}%`,
                          background:
                            "linear-gradient(90deg, hsl(var(--chart-1)), hsl(var(--chart-2)))",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="md:col-span-7 overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-medium" data-testid="text-engagement-title">
                        Engagement opportunity
                      </h2>
                      <p className="text-xs text-muted-foreground" data-testid="text-engagement-subtitle">
                        A leadership-friendly framing of reach vs activation.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      <span data-testid="text-engagement-callout">Focus: activation</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3" data-testid="grid-engagement">
                    <div
                      className="rounded-xl border border-border/70 bg-background/55 px-4 py-3"
                      data-testid="panel-reachable"
                    >
                      <div className="text-[11px] text-muted-foreground">Reachable audience (illustrative)</div>
                      <div className="mt-1 text-2xl font-semibold">
                        {formatCompact(data.engagement.reachableAudience)}
                      </div>
                    </div>

                    <div
                      className="rounded-xl border border-border/70 bg-background/55 px-4 py-3"
                      data-testid="panel-active-rate"
                    >
                      <div className="text-[11px] text-muted-foreground">Active donor rate (context)</div>
                      <div className="mt-1 font-serif text-2xl" data-testid="text-active-rate">
                        {formatPercent(data.engagement.activeDonorRate)}
                      </div>
                    </div>

                    <div
                      className="rounded-xl border border-border/70 bg-background/55 px-4 py-3"
                      data-testid="panel-opportunity"
                    >
                      <div className="text-[11px] text-muted-foreground">Message for leadership</div>
                      <p className="mt-1 text-sm text-muted-foreground" data-testid="text-opportunity-note">
                        {data.engagement.note}
                      </p>
                    </div>
                  </div>

                  <div
                    className="mt-4 rounded-xl border border-border/70 bg-background/55 p-4"
                    data-testid="panel-opportunity-funnel"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium">Opportunity funnel (conceptual)</div>
                        <div className="text-xs text-muted-foreground">
                          A lightweight way to explain the “large base → small activated segment” challenge.
                        </div>
                      </div>
                      <Badge variant="secondary" className="rounded-full" data-testid="badge-opportunity">
                        Illustrative
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div
                        className="rounded-xl border border-border/70 bg-card/60 px-4 py-3"
                        data-testid="funnel-reachable"
                      >
                        <div className="text-[11px] text-muted-foreground">Reachable</div>
                        <div className="mt-1 text-lg font-semibold">
                          {formatCompact(data.engagement.reachableAudience)}
                        </div>
                      </div>
                      <div
                        className="rounded-xl border border-border/70 bg-card/60 px-4 py-3"
                        data-testid="funnel-activated"
                      >
                        <div className="text-[11px] text-muted-foreground">Activated</div>
                        <div className="mt-1 text-lg font-semibold">
                          {formatCompact(
                            Math.round(data.engagement.reachableAudience * data.engagement.activeDonorRate),
                          )}
                        </div>
                      </div>
                      <div
                        className="rounded-xl border border-border/70 bg-card/60 px-4 py-3"
                        data-testid="funnel-next"
                      >
                        <div className="text-[11px] text-muted-foreground">Near-term focus</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Improve targeting, reduce friction, and strengthen stewardship pathways.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="md:col-span-5 overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
                <div className="p-5">
                  <h2 className="text-sm font-medium" data-testid="text-quality-title">
                    Data-quality indicators
                  </h2>
                  <p className="text-xs text-muted-foreground" data-testid="text-quality-subtitle">
                    Signals that shape confidence in modeling, segmentation, and forecasting.
                  </p>

                  <div className="mt-4 space-y-3" data-testid="list-quality">
                    {quality.map((q) => {
                      const Icon = q.icon;
                      const pct = clampPct(q.value);
                      const barColor =
                        pct >= 0.3
                          ? "linear-gradient(90deg, hsl(var(--chart-5)), hsl(var(--chart-4)))"
                          : "linear-gradient(90deg, hsl(var(--chart-3)), hsl(var(--chart-1)))";

                      return (
                        <div
                          key={q.key}
                          className="rounded-xl border border-border/70 bg-background/55 p-4"
                          data-testid={`row-quality-${q.key.toLowerCase().replaceAll(" ", "-")}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary">
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </span>
                              <div>
                                <div className="text-sm font-medium">{q.key}</div>
                                <div className="text-xs text-muted-foreground">Indicator (synthetic)</div>
                              </div>
                            </div>
                            <div
                              className="text-sm font-semibold"
                              data-testid={`text-quality-${q.key.toLowerCase().replaceAll(" ", "-")}`}
                            >
                              {formatPercent(pct)}
                            </div>
                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.round(pct * 100)}%`, background: barColor }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="mt-4 rounded-xl border border-border/70 bg-background/55 p-4"
                    data-testid="panel-quality-note"
                  >
                    <div className="text-xs text-muted-foreground">
                      These indicators are intentionally simplified to support governance-aware discussion (e.g.,
                      stewardship confidence, dedupe work, and capacity modeling).
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="strategy" className="mt-4" data-testid="tabcontent-strategy">
            <div className="grid gap-4 md:grid-cols-12">
              <Card className="md:col-span-6 overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-medium" data-testid="text-q1-title">
                        Prompt 1: Initiative summary
                      </h2>
                      <p className="text-xs text-muted-foreground" data-testid="text-q1-subtitle">
                        A compact outline you can speak to in 60–90 seconds.
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-full" data-testid="badge-q1">
                      Narrative
                    </Badge>
                  </div>

                  <div className="mt-4 rounded-xl border border-border/70 bg-background/55 p-4" data-testid="panel-q1">
                    <div className="text-sm font-medium" data-testid="text-q1-headline">
                      {data.narrative.question1.headline}
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground" data-testid="list-q1-bullets">
                      {data.narrative.question1.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2" data-testid={`row-q1-${i}`}>
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden="true" />
                          <span data-testid={`text-q1-bullet-${i}`}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 rounded-xl border border-border/70 bg-background/55 p-4" data-testid="panel-q1-challenges">
                    <div className="text-sm font-medium">Key challenges to mention</div>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground" data-testid="list-challenges">
                      {data.strategy.challenges.map((c, i) => (
                        <li key={i} className="flex gap-2" data-testid={`row-challenge-${i}`}>
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden="true" />
                          <span data-testid={`text-challenge-${i}`}>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="md:col-span-6 overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-medium" data-testid="text-q3-title">
                        Prompt 3: How to strengthen Advancement Services
                      </h2>
                      <p className="text-xs text-muted-foreground" data-testid="text-q3-subtitle">
                        Data strategy themes: governance, CRM hygiene, reporting cadence, and cross-functional trust.
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-full" data-testid="badge-q3">
                      Strategy
                    </Badge>
                  </div>

                  <div className="mt-4 rounded-xl border border-border/70 bg-background/55 p-4" data-testid="panel-q3">
                    <div className="text-sm font-medium" data-testid="text-q3-headline">
                      {data.narrative.question3.headline}
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground" data-testid="list-q3-bullets">
                      {data.narrative.question3.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2" data-testid={`row-q3-${i}`}>
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden="true" />
                          <span data-testid={`text-q3-bullet-${i}`}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 rounded-xl border border-border/70 bg-background/55 p-4" data-testid="panel-collaboration">
                    <div className="text-sm font-medium">Cross-functional partners</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Show how you work across the institution to drive outcomes.
                    </div>
                    <div className="mt-3 grid gap-2" data-testid="list-partners">
                      {data.strategy.crossFunctional.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card/60 px-3 py-2"
                          data-testid={`row-partner-${i}`}
                        >
                          <div className="text-sm" data-testid={`text-partner-${i}`}>{p}</div>
                          <Badge variant="secondary" className="rounded-full" data-testid={`badge-partner-${i}`}>
                            Partner
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-border/70 bg-background/55 p-4" data-testid="panel-tech">
                    <div className="text-sm font-medium">Technology (concept)</div>
                    <div className="mt-3 grid gap-2" data-testid="list-tech">
                      {data.strategy.technology.map((t, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-3 py-2"
                          data-testid={`row-tech-${i}`}
                        >
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary" aria-hidden="true">
                            <Sparkles className="h-4 w-4" />
                          </span>
                          <div className="text-sm" data-testid={`text-tech-${i}`}>{t}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
