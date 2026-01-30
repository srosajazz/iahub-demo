import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { ArrowRight, Database, Radar, Sparkles } from "lucide-react";

type PipelineStage = {
  name: "Discovery" | "Cultivation" | "Solicitation" | "Stewardship";
  count: number;
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
};

export default function DashboardPage() {
  const data = SYNTHETIC_DASHBOARD;

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
      tone: "text-muted-foreground",
    },
    {
      key: "Duplicate risk",
      value: data.dataQuality.duplicateRiskPct,
      icon: Radar,
      tone: "text-muted-foreground",
    },
    {
      key: "Stale contact",
      value: data.dataQuality.staleContactPct,
      icon: Sparkles,
      tone: "text-muted-foreground",
    },
  ];

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
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-14">
        <div className="grid gap-4 md:grid-cols-12">
          <Card className="md:col-span-7 overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col">
                  <h2 className="text-sm font-medium" data-testid="text-pipeline-title">
                    Donor pipeline stages
                  </h2>
                  <p className="text-xs text-muted-foreground" data-testid="text-pipeline-subtitle">
                    Illustrative counts by stage; used to discuss staffing, handoffs, and next-best
                    actions.
                  </p>
                </div>
                <div className="rounded-full bg-secondary px-3 py-1 text-xs" data-testid="text-pipeline-total">
                  Total: {formatCompact(pipelineTotal)}
                </div>
              </div>

              <div className="mt-4 h-[300px]" data-testid="chart-pipeline">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.donorPipeline} margin={{ left: 4, right: 10, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.35} />
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
                        <Cell
                          key={stage.name}
                          fill={pipelineColors[stage.name]}
                          opacity={0.92}
                        />
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

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4" data-testid="grid-pipeline-kpis">
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
                <div className="rounded-xl border border-border/70 bg-background/55 px-4 py-3" data-testid="panel-reachable">
                  <div className="text-[11px] text-muted-foreground">Reachable audience (illustrative)</div>
                  <div className="mt-1 text-2xl font-semibold">{formatCompact(data.engagement.reachableAudience)}</div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/55 px-4 py-3" data-testid="panel-active-rate">
                  <div className="text-[11px] text-muted-foreground">Active donor rate (context)</div>
                  <div className="mt-1 font-serif text-2xl" data-testid="text-active-rate">
                    {formatPercent(data.engagement.activeDonorRate)}
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/55 px-4 py-3" data-testid="panel-opportunity">
                  <div className="text-[11px] text-muted-foreground">Message for leadership</div>
                  <p className="mt-1 text-sm text-muted-foreground" data-testid="text-opportunity-note">
                    {data.engagement.note}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border/70 bg-background/55 p-4" data-testid="panel-opportunity-funnel">
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
                  <div className="rounded-xl border border-border/70 bg-card/60 px-4 py-3" data-testid="funnel-reachable">
                    <div className="text-[11px] text-muted-foreground">Reachable</div>
                    <div className="mt-1 text-lg font-semibold">{formatCompact(data.engagement.reachableAudience)}</div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card/60 px-4 py-3" data-testid="funnel-activated">
                    <div className="text-[11px] text-muted-foreground">Activated</div>
                    <div className="mt-1 text-lg font-semibold">
                      {formatCompact(Math.round(data.engagement.reachableAudience * data.engagement.activeDonorRate))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card/60 px-4 py-3" data-testid="funnel-next">
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
                        <div className="text-sm font-semibold" data-testid={`text-quality-${q.key.toLowerCase().replaceAll(" ", "-")}`}
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

              <div className="mt-4 rounded-xl border border-border/70 bg-background/55 p-4" data-testid="panel-quality-note">
                <div className="text-xs text-muted-foreground">
                  These indicators are intentionally simplified to support governance-aware discussion (e.g.,
                  stewardship confidence, dedupe work, and capacity modeling).
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
