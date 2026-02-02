import { useAuth } from "@/App";
import { CampaignProgress } from "@/components/dashboard/campaign-progress";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { UsersByCountry } from "@/components/dashboard/users-by-country";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Activity,
  ClipboardList,
  Flag,
  Loader2,
  Radar
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
 
// Types
interface PipelineStage {
    name: "Discovery" | "Cultivation" | "Solicitation" | "Stewardship";
    count: number;
}
  
interface InitiativeTimelineStep {
    label: string;
    weeks: number;
    owner: string;
}

interface ActionItem {
    id: string;
    title: string;
    why: string;
    owner: string;
    horizon: "Now" | "This quarter" | "This year";
    impact: "High" | "Medium" | "Low";
    metric: string;
}

interface DueItem {
    id: string;
    title: string;
    owner: string;
    dueAt: string; // ISO string
    status: "Open" | "Done" | "Expired";
    notes?: string | null;
    createdAt: string;
    completedAt?: string | null;
}
  
interface Message {
    id: string;
    toTeam: string;
    subject: string;
    body: string;
    createdAt: string;
}
  
interface DashboardData {
    disclaimer: string;
    donorPipeline: PipelineStage[];
    campaign: {
      goal: number;
      projected: number;
      asOfLabel: string;
    };
    strategy: {
      goalFrame: string;
      progress: {
        label: string;
        currentPct: number;
        note: string;
      };
      northStar: {
        label: string;
        value: string;
      };
      timeline: InitiativeTimelineStep[];
    };
    dataQuality: {
      missingCapacityPct: number;
    };
    actions: ActionItem[];
}

// Data
const SYNTHETIC_DASHBOARD: DashboardData = {
    disclaimer: "Berklee IA Dashboard (Synthetic Demo Data)",
    donorPipeline: [
      { name: "Discovery", count: 1250 },
      { name: "Cultivation", count: 480 },
      { name: "Solicitation", count: 125 },
      { name: "Stewardship", count: 840 },
    ],
    campaign: {
      goal: 250000000,
      projected: 18400000,
      asOfLabel: "Campaign Launch Phase",
    },
    strategy: {
      goalFrame: "Modernize Advancement Services: Data Governance & CRM Strategy to drive results.",
      progress: {
        label: "Data & Tech Roadmap",
        currentPct: 0.35,
        note: "Governance framework drafted; CRM RFP in progress.",
      },
      northStar: {
        label: "Active Donor Rate",
        value: "2.1%", // Growing from 2% baseline
      },
      timeline: [
        { label: "Data Governance Council", weeks: 2, owner: "Advancement Services" },
        { label: "CRM Migration Plan", weeks: 8, owner: "IT & Ops" },
        { label: "Wealth Screening Batch", weeks: 4, owner: "Prospect Research" },
      ],
    },
    dataQuality: {
      missingCapacityPct: 42, // High need for data enrichment
    },
    actions: [
      {
        id: "1",
        title: "Establish Data Governance Policy",
        why: "Standardize entry for 140k+ records.",
        owner: "Advancement Services",
        horizon: "Now",
        impact: "High",
        metric: "Data Integrity",
      },
      {
        id: "2",
        title: "Integrate Student Data Feed",
        why: "Capture accurate alumni transitions.",
        owner: "IT / Registrar",
        horizon: "This quarter",
        impact: "High",
        metric: "Pipeline Growth",
      },
      {
        id: "3",
        title: "Re-segment Donor Base (Active 2%)",
        why: "Identify growth opportunities in patron base.",
        owner: "Annual Giving",
        horizon: "Now",
        impact: "High",
        metric: "Participation",
      },
      {
        id: "4",
        title: "Gift Acceptance Policy Review",
        why: "Align with Finance on complex assets.",
        owner: "Gift Admin",
        horizon: "This quarter",
        impact: "Medium",
        metric: "Compliance",
      },
      {
        id: "5",
        title: "Tech Industry Partnership",
        why: "Music tech synergy opportunity.",
        owner: "Philanthropic Partnerships",
        horizon: "This year",
        impact: "Medium",
        metric: "New Revenue",
      },
      {
        id: "6",
        title: "Alumni Chapter Expansion",
        why: "LA & Nashville engagement.",
        owner: "Alumni Affairs",
        horizon: "This quarter",
        impact: "Medium",
        metric: "Engagement",
      },
    ],
};

function formatPercent(val: number) {
    return (val * 100).toFixed(0) + "%";
}

// Polling hook to detect search param changes since wouter doesn't re-render on query changes
const useSearch = () => {
  const [search, setSearch] = useState(window.location.search);
  useEffect(() => {
    const interval = setInterval(() => {
        if (window.location.search !== search) {
            setSearch(window.location.search);
        }
    }, 100);
    return () => clearInterval(interval);
  }, [search]);
  return search;
};

export default function DashboardPage() {
    const { role } = useAuth();
    const queryClient = useQueryClient();
    
    // Auth Check
    const canEditStrategy = role === "admin" || role === "president";

    // Helper Functions
    const getDaysRemaining = (dateString: string) => {
        const diffTime = new Date(dateString).getTime() - new Date().getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getPriorityColor = (days: number) => {
        if (days < 5) return "border-l-red-500";
        if (days < 14) return "border-l-orange-500";
        return "border-l-emerald-500";
    };

    const getPriorityBadgeColor = (days: number) => {
        if (days < 5) return "text-red-600 bg-red-100 border-red-200 hover:bg-red-200";
        if (days < 14) return "text-orange-600 bg-orange-100 border-orange-200 hover:bg-orange-200";
        return "text-emerald-600 bg-emerald-100 border-emerald-200 hover:bg-emerald-200";
    };
   
    // ... [Queries and Mutations remain the same] ...
    // MOCK DATA QUERIES (keeping existing logic)
    // In a real app, these would fetch from /api/...
    const { data: messages = [] } = useQuery({
      queryKey: ["messages"],
      queryFn: () => {
        // Mock fetch
        const stored = localStorage.getItem("mock_messages");
        return stored ? (JSON.parse(stored) as Message[]) : [];
      },
    });
  
    const { data: actions = SYNTHETIC_DASHBOARD.actions } = useQuery({
      queryKey: ["actions"],
      queryFn: () => {
        const stored = localStorage.getItem("mock_actions");
        if (stored) return JSON.parse(stored) as ActionItem[];
        
        // Enrich synthetic data with dynamic dates for demo
        return SYNTHETIC_DASHBOARD.actions.map(action => {
            let daysToAdd = 14; // Default green
            if (action.horizon === "Now") daysToAdd = 3; // Red (< 5)
            if (action.horizon === "This quarter") daysToAdd = 10; // Orange (< 14)
            if (action.horizon === "This year") daysToAdd = 30; // Green (> 14)
            
            return {
                ...action,
                dueAt: new Date(Date.now() + 86400000 * daysToAdd).toISOString()
            };
        });
      },
    });
  
    const { data: dueItems = [], isLoading } = useQuery({
        queryKey: ["dueItems"],
        queryFn: async () => {
          // For demo purposes, we return the mock data directly to ensure it appears
          // const res = await apiRequest("GET", "/api/due-items");
          // if (res.ok) return res.json() as Promise<DueItem[]>;
          
          return [
            { id: "1", title: "Endowment Report Review", owner: "Stewardship", dueAt: new Date(Date.now() + 86400000 * 2).toISOString(), status: "Open", createdAt: new Date().toISOString() },
            { id: "2", title: "Yamaha Proposal", owner: "Corp Relations", dueAt: new Date(Date.now() - 86400000).toISOString(), status: "Expired", createdAt: new Date().toISOString() },
            { id: "3", title: "Giving Day Copy", owner: "Annual Giving", dueAt: new Date(Date.now() + 86400000 * 5).toISOString(), status: "Open", createdAt: new Date().toISOString() },
             { id: "4", title: "Board Meeting Prep", owner: "Leadership", dueAt: new Date(Date.now() + 86400000 * 10).toISOString(), status: "Open", createdAt: new Date().toISOString() },
          ] as DueItem[];
        },
      });

    // ... [Mutations] ...
    const updateActionMutation = useMutation({
        mutationFn: async ({ id, isDone }: { id: string; isDone: boolean }) => {
          // Mock update
          return { id, isDone };
        },
        onSuccess: (vars) => {
          queryClient.setQueryData(["doneActions"], (old: Set<string> | undefined) => {
             const next = new Set(old);
             if (vars.isDone) next.add(vars.id);
             else next.delete(vars.id);
             return next;
          });
        },
    });
    
    const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
    // Sync React state with query cache for visual feedback
    useEffect(() => {
        // In local state for immediate feedback
    }, [doneIds]);

    const toggleDone = (id: string) => {
        const isDone = doneIds.has(id);
        const next = new Set(doneIds);
        if (isDone) next.delete(id);
        else next.add(id);
        setDoneIds(next);
        updateActionMutation.mutate({ id, isDone: !isDone });
    };

    // Derived State
    const data = SYNTHETIC_DASHBOARD;
    const actionsTotal = actions.length;
    const doneCount = doneIds.size;
    const openDueCount = dueItems.filter(d => d.status === "Open").length;
    const expiredDueCount = dueItems.filter(d => d.status === "Expired").length;

    // UI Utilities
    const [composeOpen, setComposeOpen] = useState(false);
    const [composeDefault, setComposeDefault] = useState({ toTeam: "IA", subject: "", body: "" });
    const openCompose = (defaults?: typeof composeDefault) => {
      if (defaults) setComposeDefault(defaults);
      setComposeOpen(true);
    };

    const [location, setLocation] = useLocation();
    const searchString = useSearch();
    const searchParams = new URLSearchParams(searchString);
    const tabParam = searchParams.get("tab");

    const [activeTab, setActiveTab] = useState("act");

    useEffect(() => {
        if (tabParam) {
            // Map params directly to tabs
            if (["act", "strategy", "pipeline", "campaign", "dashboard", "due"].includes(tabParam)) {
                setActiveTab(tabParam);
            } else if (tabParam === "analytics") {
                setActiveTab("dashboard"); 
            }
        }
    }, [tabParam]);

    // Update URL when tab changes manually
    const handleTabChange = (val: string) => {
        setActiveTab(val);
        const newParams = new URLSearchParams(window.location.search);
        newParams.set("tab", val);
        window.history.pushState(null, "", "?" + newParams.toString());
    };    

    // Colors
    const pipelineColors: Record<string, string> = {
        Discovery: "hsl(var(--chart-1))",
        Cultivation: "hsl(var(--chart-2))",
        Solicitation: "hsl(var(--chart-3))",
        Stewardship: "hsl(var(--chart-4))",
    };
    const pipelineTotal = data.donorPipeline.reduce((acc, curr) => acc + curr.count, 0);

    // Content render helper
    const renderContent = () => {
        switch(activeTab) {
            case "act":
                return (
                    <div className="grid gap-4 md:grid-cols-12">
                         <div className="col-span-12 md:col-span-8">
                             <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold tracking-tight">Prioritized Actions</h2>
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                                    {data.actions.length} High Impact
                                </Badge>
                             </div>
                             <div className="space-y-3">
                                {actions.map((action: any) => { // Using any to bypass strict type check for new dueAt field on the fly
                                    const daysLeft = getDaysRemaining(action.dueAt || new Date().toISOString());
                                    const priorityClass = getPriorityColor(daysLeft);
                                    const badgeClass = getPriorityBadgeColor(daysLeft);
                                    
                                    return (
                                    <Card key={action.id} className={`group overflow-hidden relative border-l-4 ${priorityClass} shadow-sm hover:shadow-md transition-all`}>
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 border ${badgeClass} bg-opacity-10`}>
                                                        Due in {daysLeft} days
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground">
                                                        {action.owner}
                                                    </Badge>
                                                </div>
                                                <h3 className="font-medium text-base truncate pr-4">{action.title}</h3>
                                                <p className="text-sm text-muted-foreground truncate">{action.why}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 pl-4 border-l border-border/50">
                                                <div className="text-right">
                                                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Impact</div>
                                                    <div className={cn("text-sm font-bold", action.impact === "High" ? "text-emerald-600" : "text-amber-600")}>
                                                        {action.impact}
                                                    </div>
                                                </div>
                                                 <div className="text-right">
                                                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Metric</div>
                                                    <div className="text-sm font-mono text-foreground/80">{action.metric}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    );
                                })}
                             </div>
                         </div>
                         <div className="col-span-12 md:col-span-4 space-y-4">
                             <Card className="border-border/70 bg-card/70 backdrop-blur">
                                <div className="p-5">
                                    <h2 className="text-sm font-medium mb-4">Quick Comms</h2>
                                      <div
                                        className="rounded-xl border border-border/70 bg-background/55 p-4 text-sm text-muted-foreground"
                                        data-testid="empty-messages"
                                      >
                                        No drafts. Compose a message to Alumni Affairs, CFR, or Stewardship.
                                      </div>
                                </div>
                             </Card>
                         </div>
                    </div>
                );
            case "strategy":
                return (
                     <div className="grid gap-4 md:grid-cols-12">
                        <div className="col-span-12">
                             <Card className="border-l-4 border-l-purple-500">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold mb-2">Strategy Snapshot</h2>
                                    <div className="text-2xl font-bold mb-4">{data.strategy.goalFrame}</div>
                                    
                                     <div className="grid md:grid-cols-3 gap-6 mt-6">
                                        <div className="bg-muted/30 p-4 rounded-lg">
                                            <div className="text-sm text-muted-foreground mb-1">{data.strategy.progress.label}</div>
                                            <div className="text-xl font-bold text-emerald-600">{(data.strategy.progress.currentPct * 100).toFixed(0)}%</div>
                                            <p className="text-xs text-muted-foreground mt-1">{data.strategy.progress.note}</p>
                                        </div>
                                         <div className="bg-muted/30 p-4 rounded-lg">
                                            <div className="text-sm text-muted-foreground mb-1">{data.strategy.northStar.label}</div>
                                            <div className="text-xl font-bold text-blue-600">{data.strategy.northStar.value}</div>
                                            <p className="text-xs text-muted-foreground mt-1">Key Indicator</p>
                                        </div>
                                         <div className="bg-muted/30 p-4 rounded-lg">
                                            <div className="text-sm text-muted-foreground mb-1">Data Quality Gap</div>
                                            <div className="text-xl font-bold text-amber-600">{data.dataQuality.missingCapacityPct}%</div>
                                            <p className="text-xs text-muted-foreground mt-1">Missing Capacity Data</p>
                                        </div>
                                     </div>

                                     <div className="mt-8">
                                        <h3 className="text-sm font-medium mb-4">Strategic Timeline</h3>
                                        <div className="space-y-3">
                                            {data.strategy.timeline.map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg bg-background/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                                                            W{item.weeks}
                                                        </div>
                                                        <span className="font-medium">{item.label}</span>
                                                    </div>
                                                    <Badge variant="outline">{item.owner}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                     </div>
                                </div>
                            </Card>
                        </div>
                        
                        <div className="col-span-12">
                            <Card className="border border-border/70 shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-primary" />
                                                Data Health Control Center
                                            </CardTitle>
                                            <CardDescription>Real-time governance warnings for 140k+ records</CardDescription>
                                        </div>
                                        <Badge variant="outline" className="border-amber-500/50 text-amber-600 bg-amber-500/10">Actions Required</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                         <div className="flex items-center justify-between text-sm">
                                            <span className="font-semibold">Contact Accuracy</span>
                                            <span className="font-bold text-amber-600">68%</span>
                                         </div>
                                         <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 w-[68%]" />
                                         </div>
                                    </div>
                                    <div className="space-y-2">
                                         <div className="flex items-center justify-between text-sm">
                                            <span className="font-semibold">Employment Data</span>
                                            <span className="font-bold text-orange-600">45%</span>
                                         </div>
                                         <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500 w-[45%]" />
                                         </div>
                                    </div>
                                    <div className="space-y-2">
                                         <div className="flex items-center justify-between text-sm">
                                            <span className="font-semibold">Wealth Scores</span>
                                            <span className="font-bold text-red-600 text-base">12%</span>
                                         </div>
                                         <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 w-[12%]" />
                                         </div>
                                    </div>
                                     <div className="space-y-2">
                                         <div className="flex items-center justify-between text-sm">
                                            <span className="font-semibold">Consent/Prefs</span>
                                            <span className="font-bold text-emerald-600">85%</span>
                                         </div>
                                         <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[85%]" />
                                         </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                     </div>
                );
            case "pipeline":
                return (
                    <div className="grid gap-4 md:grid-cols-12">
                        <div className="col-span-12">
                            <PipelineChart />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Prospects</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                                                <div>
                                                    <div className="font-medium">Confidential Prospect {i}</div>
                                                    <div className="text-xs text-muted-foreground">Solicitation Stage</div>
                                                </div>
                                                <Badge>High Priority</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            case "campaign":
                return (
                     <div className="grid gap-4 md:grid-cols-12">
                        <div className="col-span-12 md:col-span-6">
                             <CampaignProgress />
                        </div>
                        <div className="col-span-12 md:col-span-6">
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle>Campaign Areas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>Scholarships</span>
                                            <span className="font-mono font-bold">$12.4M</span>
                                        </div>
                                         <div className="flex justify-between items-center">
                                            <span>Facilities</span>
                                            <span className="font-mono font-bold">$4.2M</span>
                                        </div>
                                         <div className="flex justify-between items-center">
                                            <span>Program Support</span>
                                            <span className="font-mono font-bold">$1.8M</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                     </div>
                );
            case "dashboard":
                 return (
                    <div className="grid gap-4 md:grid-cols-12">
                        <div className="col-span-12">
                             <UsersByCountry />
                        </div>
                         <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="p-4 flex flex-col items-center justify-center text-center">
                                <div className="text-muted-foreground text-xs uppercase font-bold">Total Donors</div>
                                <div className="text-2xl font-bold mt-1">14,204</div>
                            </Card>
                             <Card className="p-4 flex flex-col items-center justify-center text-center">
                                <div className="text-muted-foreground text-xs uppercase font-bold">New This Year</div>
                                <div className="text-2xl font-bold mt-1 text-emerald-600">+850</div>
                            </Card>
                             <Card className="p-4 flex flex-col items-center justify-center text-center">
                                <div className="text-muted-foreground text-xs uppercase font-bold">Retention Rate</div>
                                <div className="text-2xl font-bold mt-1">68%</div>
                            </Card>
                             <Card className="p-4 flex flex-col items-center justify-center text-center">
                                <div className="text-muted-foreground text-xs uppercase font-bold">Avg Gift</div>
                                <div className="text-2xl font-bold mt-1">$420</div>
                            </Card>
                        </div>
                    </div>
                 );
            case "due":
                 return (
                    <div className="grid gap-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            dueItems.map(item => (
                                <Card key={item.id}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            <div>
                                                <div className="font-medium">{item.title}</div>
                                                <div className="text-xs text-muted-foreground">Owner: {item.owner}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-mono">{format(new Date(item.dueAt), "MMM d")}</div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                 );
            default:
                return <div>Select a tab</div>;
        }
    }

  return (
    <DashboardLayout>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="p-4 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20 border-rose-200/50 dark:border-rose-800/30">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-500/20">
                  <ClipboardList className="h-5 w-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Top actions</div>
                  <div className="text-xl font-semibold">{doneCount}/{actionsTotal}</div>
                  <div className="text-xs text-muted-foreground">done</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/30">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/20">
                  <Flag className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{data.strategy.northStar.label}</div>
                  <div className="text-xl font-semibold">{data.strategy.northStar.value}</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/30">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/20">
                  <Radar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Pipeline health</div>
                  <div className="text-xl font-semibold">{100 - data.dataQuality.missingCapacityPct}%</div>
                  <div className="text-xs text-muted-foreground">data quality</div>
                </div>
              </div>
            </Card>
          </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="act">Act Now</TabsTrigger>
            <TabsTrigger value="due">Due Items</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
            <TabsTrigger value="dashboard">Analytics</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            {renderContent()}
          </div>
        </Tabs>
        
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="toTeam" className="text-right">To</Label>
                        <Input id="toTeam" value={composeDefault.toTeam} className="col-span-3" readOnly />
                     </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subject" className="text-right">Subject</Label>
                        <Input id="subject" defaultValue={composeDefault.subject} className="col-span-3" />
                     </div>
                     <Textarea defaultValue={composeDefault.body} className="min-h-[100px]" />
                </div>
                <DialogFooter>
                    <Button onClick={() => { toast({ title: "Sent" }); setComposeOpen(false); }}>Send</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </DashboardLayout>
  );
}
