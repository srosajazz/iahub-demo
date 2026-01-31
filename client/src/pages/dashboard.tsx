import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Bell,
  Building2,
  CalendarClock,
  Check,
  ClipboardList,
  Database,
  Edit,
  FileText,
  Flag,
  LayoutDashboard,
  LogOut,
  Mail,
  Plus,
  Radar,
  Settings,
  Shield,
  Sparkles,
  Target,
  Timer,
  Trash2,
  User,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth, type UserRole } from "@/App";

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

type DueItem = {
  id: string;
  title: string;
  owner: string;
  dueAt: string; // ISO string
  status: "Open" | "Done" | "Expired";
  notes?: string | null;
  createdAt: string;
};

type Message = {
  id: string;
  toTeam: "Advancement Services" | "Alumni Affairs" | "Annual Giving" | "CFR" | "Stewardship" | "IA";
  subject: string;
  body: string;
  createdAt: string;
};

type ActionItemAPI = {
  id: string;
  title: string;
  why: string;
  owner: string;
  horizon: "Now" | "This quarter" | "This year";
  impact: "High" | "Medium" | "Low";
  metric: string;
  isDone: number; // 0 or 1
};

type Donor = {
  id: string;
  name: string;
  type: "Individual" | "Corporation" | "Foundation";
  organization: string | null;
  totalGiven: string;
  lastGiftDate: string;
  lastGiftAmount: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  imageUrl: string | null;
  createdAt: string;
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
  due: DueItem[];
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

function formatDateTimeLocalDisplay(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(v: string) {
  // v is "YYYY-MM-DDTHH:mm" in local time; Date() parses as local.
  const d = new Date(v);
  return d.toISOString();
}

function msToCountdown(ms: number) {
  const abs = Math.abs(ms);
  const totalSeconds = Math.floor(abs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days >= 1) return `${days}d ${hours}h`;
  if (hours >= 1) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// API Functions
async function fetchDueItems(): Promise<DueItem[]> {
  const res = await fetch("/api/due-items", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch due items");
  return res.json();
}

async function fetchMessages(): Promise<Message[]> {
  const res = await fetch("/api/messages", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

async function fetchActionItems(): Promise<ActionItemAPI[]> {
  const res = await fetch("/api/action-items", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch action items");
  return res.json();
}

async function createMessage(data: { toTeam: string; subject: string; body: string }): Promise<Message> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create message");
  return res.json();
}

async function updateDueItem(id: string, updates: Partial<DueItem>): Promise<DueItem> {
  const res = await fetch(`/api/due-items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update due item");
  return res.json();
}

async function updateActionItemDone(id: string, isDone: boolean): Promise<ActionItemAPI> {
  const res = await fetch(`/api/action-items/${id}/done`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isDone }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update action item");
  return res.json();
}

async function fetchDonors(): Promise<Donor[]> {
  const res = await fetch("/api/donors", { credentials: "include" });
  if (!res.ok) {
    if (res.status === 403) return [];
    throw new Error("Failed to fetch donors");
  }
  return res.json();
}

async function createDonor(data: Omit<Donor, "id" | "createdAt">): Promise<Donor> {
  const res = await fetch("/api/donors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create donor");
  return res.json();
}

async function updateDonor(id: string, updates: Partial<Donor>): Promise<Donor> {
  const res = await fetch(`/api/donors/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to update donor");
  return res.json();
}

async function deleteDonor(id: string): Promise<void> {
  const res = await fetch(`/api/donors/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete donor");
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
  due: [],
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
      headline: "Institutional Advancement data strategy (campaign readiness)",
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
  const queryClient = useQueryClient();
  const { role, displayName } = useAuth();

  const canViewDonors = role === "admin" || role === "president" || role === "vice_president";
  const canEditDonors = role === "admin";
  const canEditStrategy = role === "admin" || role === "vice_president";

  const [now, setNow] = useState<number>(() => Date.now());
  const [composeOpen, setComposeOpen] = useState(false);
  const [msgTeam, setMsgTeam] = useState<Message["toTeam"]>("IA");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");

  // Donor CRUD state
  const [donorDialogOpen, setDonorDialogOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  const [viewDonor, setViewDonor] = useState<Donor | null>(null);
  const [donorForm, setDonorForm] = useState({
    name: "",
    type: "Individual" as "Individual" | "Corporation" | "Foundation",
    organization: "",
    totalGiven: "",
    lastGiftDate: "",
    lastGiftAmount: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    imageUrl: "",
  });

  // Fetch data from API
  const { data: dueItemsData = [] } = useQuery({
    queryKey: ["dueItems"],
    queryFn: fetchDueItems,
  });

  const { data: messagesData = [] } = useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages,
  });

  const { data: actionItemsAPI = [] } = useQuery({
    queryKey: ["actionItems"],
    queryFn: fetchActionItems,
  });

  const { data: donorsData = [] } = useQuery({
    queryKey: ["donors"],
    queryFn: fetchDonors,
  });

  // Mutations
  const updateDueMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DueItem> }) =>
      updateDueItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dueItems"] });
    },
  });

  const updateActionMutation = useMutation({
    mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) =>
      updateActionItemDone(id, isDone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actionItems"] });
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: createMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const createDonorMutation = useMutation({
    mutationFn: createDonor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      toast({ title: "Donor added", description: "New donor record created successfully." });
    },
  });

  const updateDonorMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Donor> }) =>
      updateDonor(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      toast({ title: "Donor updated", description: "Donor record updated successfully." });
    },
  });

  const deleteDonorMutation = useMutation({
    mutationFn: deleteDonor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      toast({ title: "Donor deleted", description: "Donor record removed successfully." });
    },
  });

  function openAddDonor() {
    setEditingDonor(null);
    setDonorForm({
      name: "",
      type: "Individual",
      organization: "",
      totalGiven: "",
      lastGiftDate: new Date().toISOString().split("T")[0],
      lastGiftAmount: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      imageUrl: "",
    });
    setDonorDialogOpen(true);
  }

  function openEditDonor(donor: Donor) {
    setEditingDonor(donor);
    setDonorForm({
      name: donor.name,
      type: donor.type,
      organization: donor.organization || "",
      totalGiven: donor.totalGiven,
      lastGiftDate: donor.lastGiftDate.split("T")[0],
      lastGiftAmount: donor.lastGiftAmount,
      email: donor.email || "",
      phone: donor.phone || "",
      city: donor.city || "",
      state: donor.state || "",
      imageUrl: donor.imageUrl || "",
    });
    setDonorDialogOpen(true);
  }

  function saveDonor() {
    const donorData = {
      name: donorForm.name,
      type: donorForm.type,
      organization: donorForm.organization || null,
      totalGiven: donorForm.totalGiven,
      lastGiftDate: donorForm.lastGiftDate,
      lastGiftAmount: donorForm.lastGiftAmount,
      email: donorForm.email || null,
      phone: donorForm.phone || null,
      city: donorForm.city || null,
      state: donorForm.state || null,
      imageUrl: donorForm.imageUrl || null,
    };

    if (editingDonor) {
      updateDonorMutation.mutate({ id: editingDonor.id, updates: donorData });
    } else {
      createDonorMutation.mutate(donorData as any);
    }
    setDonorDialogOpen(false);
  }

  function confirmDeleteDonor(id: string) {
    if (confirm("Are you sure you want to delete this donor? This action cannot be undone.")) {
      deleteDonorMutation.mutate(id);
    }
  }

  // Convert API action items to UI format
  const actions = useMemo(() => {
    return actionItemsAPI.map((item) => ({
      ...item,
      isDone: item.isDone === 1,
    }));
  }, [actionItemsAPI]);

  const doneIds = useMemo(() => {
    return new Set(actions.filter((a) => a.isDone).map((a) => a.id));
  }, [actions]);

  // Compute dueItems with expired status based on current time
  const dueItems = useMemo(() => {
    return dueItemsData.map((d) => {
      if (d.status === "Done") return d;
      const expired = new Date(d.dueAt).getTime() < now;
      return expired ? { ...d, status: "Expired" as const } : { ...d, status: "Open" as const };
    });
  }, [dueItemsData, now]);

  const messages = messagesData;

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

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const doneCount = doneIds.size;
  const actionsTotal = data.actions.length;
  const actionsDonePct = actionsTotal > 0 ? doneCount / actionsTotal : 0;

  const openDueCount = useMemo(
    () => dueItems.filter((d) => d.status === "Open").length,
    [dueItems],
  );
  const expiredDueCount = useMemo(
    () => dueItems.filter((d) => d.status === "Expired").length,
    [dueItems],
  );

  function toggleDone(id: string) {
    const action = actions.find((a) => a.id === id);
    if (!action) return;
    updateActionMutation.mutate({ id, isDone: !action.isDone });
  }

  function markDueDone(id: string) {
    updateDueMutation.mutate(
      { id, updates: { status: "Done" } },
      {
        onSuccess: () => {
          toast({
            title: "Marked as done",
            description: "Due date marked complete.",
          });
        },
      }
    );
  }

  function updateDueAt(id: string, dueAtIso: string) {
    updateDueMutation.mutate({ id, updates: { dueAt: dueAtIso } });
  }

  function openCompose(prefill?: Partial<Pick<Message, "toTeam" | "subject" | "body">>) {
    if (prefill?.toTeam) setMsgTeam(prefill.toTeam);
    if (prefill?.subject) setMsgSubject(prefill.subject);
    if (prefill?.body) setMsgBody(prefill.body);
    setComposeOpen(true);
  }

  function sendMessage() {
    if (!msgSubject.trim() || !msgBody.trim()) {
      toast({
        title: "Missing details",
        description: "Please add a subject and message.",
        variant: "destructive",
      });
      return;
    }

    createMessageMutation.mutate(
      {
        toTeam: msgTeam,
        subject: msgSubject.trim(),
        body: msgBody.trim(),
      },
      {
        onSuccess: () => {
          setComposeOpen(false);
          setMsgSubject("");
          setMsgBody("");
          toast({
            title: "Message sent",
            description: "Your message has been saved to the team inbox.",
          });
        },
      }
    );
  }

  const [activeTab, setActiveTab] = React.useState("act");

  const navItems = [
    { id: "act", label: "Act now", icon: Zap },
    { id: "due", label: "Due dates", icon: CalendarClock },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "strategy", label: "Strategy notes", icon: FileText },
    ...(canViewDonors ? [{ id: "donors", label: "Donors", icon: Shield }] : []),
  ];

  return (
    <div className="min-h-dvh flex hero-wash grain">
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/30 backdrop-blur supports-[backdrop-filter]:bg-card/20">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <Target className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-semibold text-lg leading-tight" data-testid="text-title">IAHub</h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-muted">
              <User className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" data-testid="sidebar-user-name">
                {displayName || "User"}
              </div>
              <div className="text-xs text-muted-foreground" data-testid="sidebar-user-role">
                {role === "admin" ? "Administrator" : role === "president" ? "President" : role === "vice_president" ? "Vice President" : "Staff"}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={async () => {
                await fetch("/api/logout", { method: "POST", credentials: "include" });
                window.location.href = "/";
              }}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-dvh overflow-auto">
        <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-[11px] mb-2"
                  data-testid="badge-disclaimer"
                >
                  {data.disclaimer}
                </Badge>
                <p className="text-sm text-muted-foreground" data-testid="text-subtitle">
                  Pipeline visibility, campaign pacing, engagement opportunity, and data-quality signals.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground" data-testid="group-asof">
                  <span>{data.campaign.asOfLabel}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>Synthetic indicators only</span>
                </div>

                <Badge
                  className="rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 px-3 py-1"
                  data-testid="badge-due-open"
                >
                  <Bell className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  {openDueCount} due
                </Badge>
                <Badge
                  className={`rounded-full px-3 py-1 border ${
                    expiredDueCount > 0 
                      ? "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30 animate-pulse" 
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                  data-testid="badge-due-expired"
                >
                  <CalendarClock className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                  {expiredDueCount} expired
                </Badge>

                <Button
                  className="h-9 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all"
                  onClick={() => openCompose({
                    toTeam: "IA",
                    subject: "IAHub follow-up: due items + next steps",
                    body: "Sharing current due items and asking for owners / next-best actions.\n\n- Item: ...\n- Owner: ...\n- Due: ...\n\nReply with updates / blockers.",
                  })}
                  data-testid="button-compose-header"
                >
                  <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                  Message IA team
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card className="p-4 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20 border-rose-200/50 dark:border-rose-800/30">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-500/20">
                  <ClipboardList className="h-5 w-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground" data-testid="text-actions-label">Top actions</div>
                  <div className="text-xl font-semibold" data-testid="text-actions-count">{doneCount}/{actionsTotal}</div>
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
                  <div className="text-xs text-muted-foreground" data-testid="text-northstar-label">{data.strategy.northStar.label}</div>
                  <div className="text-xl font-semibold" data-testid="text-northstar-value">{data.strategy.northStar.value}</div>
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

          <div className="md:hidden mb-4">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-2 rounded-lg border border-border bg-background"
              data-testid="mobile-nav-select"
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-testid="tabs-sections">
          <TabsList className="sr-only">
            {navItems.map((item) => (
              <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>
            ))}
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
                    {canEditStrategy && (
                      <Button
                        variant="secondary"
                        className="h-9 rounded-full"
                        onClick={() => {
                          actions.filter(a => a.isDone).forEach(a => {
                            updateActionMutation.mutate({ id: a.id, isDone: false });
                          });
                        }}
                        data-testid="button-reset-actions"
                      >
                        Reset
                      </Button>
                    )}
                  </div>

                  <div className="mt-4 space-y-3" data-testid="list-actions">
                    {data.actions.map((a) => {
                      const done = doneIds.has(a.id);
                      const impactTone =
                        a.impact === "High"
                          ? "bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30"
                          : a.impact === "Medium"
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                            : "bg-muted text-muted-foreground";
                      
                      const cardBorder = a.impact === "High" 
                        ? "border-red-500/40 shadow-red-500/10 shadow-sm" 
                        : a.impact === "Medium" 
                          ? "border-amber-500/30" 
                          : "border-border/70";

                      return (
                        <div
                          key={a.id}
                          role={canEditStrategy ? "button" : undefined}
                          tabIndex={canEditStrategy ? 0 : undefined}
                          onClick={canEditStrategy ? () => toggleDone(a.id) : undefined}
                          onKeyDown={canEditStrategy ? (e) => { if (e.key === 'Enter' || e.key === ' ') toggleDone(a.id); } : undefined}
                          className={`group w-full rounded-xl border ${cardBorder} bg-background/55 p-4 text-left transition ${canEditStrategy ? 'cursor-pointer hover:bg-background/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring' : ''}`}
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
                        </div>
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

          <TabsContent value="due" className="mt-4" data-testid="tabcontent-due">
            <div className="grid gap-4 md:grid-cols-12">
              <Card className="md:col-span-7 overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-medium" data-testid="text-due-title">
                        Due dates & countdown
                      </h2>
                      <p className="text-xs text-muted-foreground" data-testid="text-due-subtitle">
                        Add explicit due dates and track time remaining. Items automatically flip to “Expired”.
                      </p>
                    </div>
                    <Button
                      className="h-9 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600"
                      onClick={() =>
                        openCompose({
                          toTeam: "IA",
                          subject: "Reminder: upcoming IAHub due dates",
                          body: "Sharing upcoming due items from IAHub. Please confirm owners + status.\n\n- ...",
                        })
                      }
                      data-testid="button-message-from-due"
                    >
                      <Bell className="mr-2 h-4 w-4" aria-hidden="true" />
                      Notify team
                    </Button>
                  </div>

                  <div className="mt-4 space-y-3" data-testid="list-due">
                    {dueItems
                      .slice()
                      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
                      .map((d, idx) => {
                        const dueMs = new Date(d.dueAt).getTime() - now;
                        const isExpired = d.status === "Expired";
                        const isDone = d.status === "Done";
                        const tone = isDone
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : isExpired
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-border/70 bg-background/55";

                        return (
                          <div
                            key={d.id}
                            className={`rounded-xl border p-4 ${tone}`}
                            data-testid={`card-due-${d.id}`}
                          >
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div
                                    className="text-sm font-semibold"
                                    data-testid={`text-due-title-${d.id}`}
                                  >
                                    {d.title}
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="rounded-full"
                                    data-testid={`badge-due-owner-${d.id}`}
                                  >
                                    {d.owner}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className={`rounded-full ${
                                      isDone
                                        ? "bg-emerald-500/15 text-foreground"
                                        : isExpired
                                          ? "bg-red-500/15 text-foreground"
                                          : ""
                                    }`}
                                    data-testid={`badge-due-status-${d.id}`}
                                  >
                                    {d.status}
                                  </Badge>
                                </div>

                                <div className="mt-1 text-xs text-muted-foreground" data-testid={`text-due-datetime-${d.id}`}>
                                  Due: {formatDateTimeLocalDisplay(d.dueAt)}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-medium ${
                                    isDone 
                                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" 
                                      : isExpired 
                                        ? "bg-red-500/20 text-red-700 dark:text-red-400 animate-pulse" 
                                        : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                                  }`}>
                                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                                    <span data-testid={`text-due-countdown-${d.id}`}>
                                      {isDone
                                        ? "Completed"
                                        : isExpired
                                          ? `Expired ${msToCountdown(dueMs)} ago`
                                          : `${msToCountdown(dueMs)} remaining`}
                                    </span>
                                  </span>
                                </div>

                                {d.notes ? (
                                  <div className="mt-2 text-xs text-muted-foreground" data-testid={`text-due-notes-${d.id}`}>
                                    {d.notes}
                                  </div>
                                ) : null}
                              </div>

                              <div className="flex flex-col gap-2 md:items-end">
                                <div className="grid gap-2">
                                  <Label className="text-xs text-muted-foreground" htmlFor={`input-due-${d.id}`}>
                                    Change due date
                                  </Label>
                                  <Input
                                    id={`input-due-${d.id}`}
                                    type="datetime-local"
                                    value={toDatetimeLocalValue(d.dueAt)}
                                    onChange={(e) => updateDueAt(d.id, fromDatetimeLocalValue(e.target.value))}
                                    className="h-9"
                                    data-testid={`input-due-${d.id}`}
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    className="h-9 rounded-full border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-500/50"
                                    onClick={() =>
                                      openCompose({
                                        toTeam: "IA",
                                        subject: `Due item: ${d.title}`,
                                        body: `Sharing due item from IAHub.\n\nTitle: ${d.title}\nOwner: ${d.owner}\nDue: ${formatDateTimeLocalDisplay(d.dueAt)}\nStatus: ${d.status}\n\nUpdate requested: Please confirm status, blockers, and next steps.`,
                                      })
                                    }
                                    data-testid={`button-message-due-${d.id}`}
                                  >
                                    <Mail className="mr-2 h-4 w-4 text-blue-600" aria-hidden="true" />
                                    Message
                                  </Button>

                                  <Button
                                    className="h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                                    onClick={() => markDueDone(d.id)}
                                    disabled={d.status === "Done"}
                                    data-testid={`button-due-done-${d.id}`}
                                  >
                                    <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Mark done
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </Card>

              <Card className="md:col-span-5 overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
                <div className="p-5">
                  <h2 className="text-sm font-medium" data-testid="text-comms-title">
                    Team messages (mockup)
                  </h2>
                  <p className="text-xs text-muted-foreground" data-testid="text-comms-subtitle">
                    Compose and track messages to IA teams. Stored in memory only (no real sending).
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      className="h-9 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800"
                      onClick={() => openCompose()}
                      data-testid="button-compose"
                    >
                      <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                      New message
                    </Button>
                    <Badge variant="secondary" className="rounded-full" data-testid="badge-messages-count">
                      {messages.length} drafts
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-3" data-testid="list-messages">
                    {messages.length === 0 ? (
                      <div
                        className="rounded-xl border border-border/70 bg-background/55 p-4 text-sm text-muted-foreground"
                        data-testid="empty-messages"
                      >
                        No messages yet. Use “New message” to draft a note to an IA team.
                      </div>
                    ) : (
                      messages.map((m, i) => (
                        <div
                          key={m.id}
                          className="rounded-xl border border-border/70 bg-background/55 p-4"
                          data-testid={`card-message-${m.id}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className="rounded-full"
                                  data-testid={`badge-message-team-${m.id}`}
                                >
                                  {m.toTeam}
                                </Badge>
                                <div
                                  className="text-sm font-semibold"
                                  data-testid={`text-message-subject-${m.id}`}
                                >
                                  {m.subject}
                                </div>
                              </div>
                              <div
                                className="mt-1 text-xs text-muted-foreground"
                                data-testid={`text-message-date-${m.id}`}
                              >
                                {formatDateTimeLocalDisplay(m.createdAt)}
                              </div>
                              <div
                                className="mt-2 text-sm text-muted-foreground"
                                data-testid={`text-message-body-${m.id}`}
                              >
                                {m.body}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="secondary"
                                className="h-9 rounded-full"
                                onClick={() =>
                                  openCompose({
                                    toTeam: m.toTeam,
                                    subject: m.subject,
                                    body: m.body,
                                  })
                                }
                                data-testid={`button-message-edit-${m.id}`}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="secondary"
                                className="h-9 rounded-full"
                                onClick={() => {
                                  toast({
                                    title: "Sent (mockup)",
                                    description: "In a real app, this would notify the team via email/Slack.",
                                  });
                                }}
                                data-testid={`button-message-send-${m.id}`}
                              >
                                Send
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
                        Illustrative counts by stage; used to discuss staffing, handoffs, and next-best
                        actions.
                      </p>
                    </div>
                    <div
                      className="rounded-full bg-secondary px-3 py-1 text-xs"
                      data-testid="text-pipeline-total"
                    >
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
                      These indicators are intentionally simplified to support governance-aware discussion
                      (e.g., stewardship confidence, dedupe work, and capacity modeling).
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
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40"
                            aria-hidden="true"
                          />
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
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40"
                            aria-hidden="true"
                          />
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
                        Prompt 3: How to strengthen Institutional Advancement
                      </h2>
                      <p className="text-xs text-muted-foreground" data-testid="text-q3-subtitle">
                        Data strategy themes: governance, CRM hygiene, reporting cadence, and cross-functional
                        trust.
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
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40"
                            aria-hidden="true"
                          />
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
                          <div className="text-sm" data-testid={`text-partner-${i}`}>
                            {p}
                          </div>
                          <Badge
                            variant="secondary"
                            className="rounded-full"
                            data-testid={`badge-partner-${i}`}
                          >
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
                          <span
                            className="grid h-7 w-7 place-items-center rounded-lg bg-secondary"
                            aria-hidden="true"
                          >
                            <Sparkles className="h-4 w-4" />
                          </span>
                          <div className="text-sm" data-testid={`text-tech-${i}`}>
                            {t}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {canViewDonors && (
            <TabsContent value="donors" className="mt-4" data-testid="tabcontent-donors">
              <Card className="overflow-hidden border-border/70 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/55">
                <div className="p-5">
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                    <Shield className="h-4 w-4" />
                    <span>Confidential donor information - authorized access only ({role === "admin" ? "Administrator" : role === "president" ? "President" : "Vice President"})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <h2 className="text-lg font-semibold" data-testid="text-donors-title">
                        Donor Database
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full" data-testid="badge-donor-count">
                        {donorsData.length} donors
                      </Badge>
                      {canEditDonors && (
                        <Button size="sm" onClick={openAddDonor} className="rounded-full" data-testid="button-add-donor">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Donor
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm" data-testid="table-donors">
                      <thead>
                        <tr className="border-b border-border/70 text-left text-muted-foreground">
                          <th className="py-3 pr-4 font-medium">Name</th>
                          <th className="py-3 pr-4 font-medium">Type</th>
                          <th className="py-3 pr-4 font-medium">Organization</th>
                          <th className="py-3 pr-4 font-medium text-right">Total Given</th>
                          <th className="py-3 pr-4 font-medium">Last Gift</th>
                          <th className="py-3 pr-4 font-medium">Contact</th>
                          <th className="py-3 pr-4 font-medium">Location</th>
                          <th className="py-3 font-medium">Added</th>
                          {canEditDonors && <th className="py-3 font-medium">Actions</th>}
                        </tr>
                      </thead>
                    <tbody>
                      {donorsData.map((donor) => (
                        <tr
                          key={donor.id}
                          className="border-b border-border/40 hover:bg-muted/30"
                          data-testid={`row-donor-${donor.id}`}
                        >
                          <td className="py-3 pr-4">
                            <button
                              onClick={() => setViewDonor(donor)}
                              className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                              data-testid={`button-view-donor-${donor.id}`}
                            >
                              <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary overflow-hidden">
                                {donor.imageUrl ? (
                                  <img src={donor.imageUrl} alt={donor.name} className="h-full w-full object-cover" />
                                ) : donor.type === "Individual" ? (
                                  <User className="h-4 w-4" />
                                ) : (
                                  <Building2 className="h-4 w-4" />
                                )}
                              </div>
                              <span className="font-medium text-primary hover:underline" data-testid={`text-donor-name-${donor.id}`}>
                                {donor.name}
                              </span>
                            </button>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant={
                                donor.type === "Individual"
                                  ? "secondary"
                                  : donor.type === "Corporation"
                                  ? "default"
                                  : "outline"
                              }
                              className="rounded-full"
                              data-testid={`badge-donor-type-${donor.id}`}
                            >
                              {donor.type}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground" data-testid={`text-donor-org-${donor.id}`}>
                            {donor.organization || "—"}
                          </td>
                          <td className="py-3 pr-4 text-right font-semibold text-green-600" data-testid={`text-donor-total-${donor.id}`}>
                            ${Number(donor.totalGiven).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4">
                            <div data-testid={`text-donor-lastgift-${donor.id}`}>
                              <div className="font-medium">${Number(donor.lastGiftAmount).toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(donor.lastGiftDate).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="text-xs" data-testid={`text-donor-contact-${donor.id}`}>
                              {donor.email && <div className="text-muted-foreground">{donor.email}</div>}
                              {donor.phone && <div className="text-muted-foreground">{donor.phone}</div>}
                              {!donor.email && !donor.phone && <span className="text-muted-foreground">—</span>}
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground" data-testid={`text-donor-location-${donor.id}`}>
                            {donor.city && donor.state ? `${donor.city}, ${donor.state}` : donor.city || donor.state || "—"}
                          </td>
                          <td className="py-3 text-xs text-muted-foreground" data-testid={`text-donor-created-${donor.id}`}>
                            {new Date(donor.createdAt).toLocaleDateString()}
                          </td>
                          {canEditDonors && (
                            <td className="py-3">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDonor(donor)}
                                  className="h-8 w-8 p-0"
                                  data-testid={`button-edit-donor-${donor.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => confirmDeleteDonor(donor.id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                  data-testid={`button-delete-donor-${donor.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </TabsContent>
          )}
        </Tabs>
        </div>
      </div>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="border-border/70 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70">
          <DialogHeader>
            <DialogTitle data-testid="text-compose-title">Message the IA team (mockup)</DialogTitle>
            <DialogDescription data-testid="text-compose-subtitle">
              This prototype stores messages in memory only. In a real build, this would send via email,
              Slack, or a ticketing workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="select-team" className="text-sm" data-testid="label-team">
                Team
              </Label>
              <select
                id="select-team"
                value={msgTeam}
                onChange={(e) => setMsgTeam(e.target.value as Message["toTeam"])}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                data-testid="select-team"
              >
                <option value="IA">Institutional Advancement (IA)</option>
                <option value="Advancement Services">Advancement Services</option>
                <option value="Alumni Affairs">Alumni Affairs</option>
                <option value="Annual Giving">Annual Giving</option>
                <option value="CFR">Corporate & Foundation Relations</option>
                <option value="Stewardship">Stewardship & Donor Relations</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="input-subject" className="text-sm" data-testid="label-subject">
                Subject
              </Label>
              <Input
                id="input-subject"
                value={msgSubject}
                onChange={(e) => setMsgSubject(e.target.value)}
                placeholder="e.g., Due items needing owner confirmation"
                data-testid="input-subject"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="input-body" className="text-sm" data-testid="label-body">
                Message
              </Label>
              <Textarea
                id="input-body"
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                placeholder="Write a short update request, ask for blockers, and propose next steps…"
                className="min-h-[120px]"
                data-testid="input-body"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => setComposeOpen(false)}
              data-testid="button-cancel-message"
            >
              Cancel
            </Button>
            <Button
              className="rounded-full"
              onClick={sendMessage}
              data-testid="button-send-message"
            >
              Send (mockup)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={donorDialogOpen} onOpenChange={setDonorDialogOpen}>
        <DialogContent className="border-border/70 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70 max-w-2xl">
          <DialogHeader>
            <DialogTitle data-testid="text-donor-dialog-title">
              {editingDonor ? "Edit Donor" : "Add New Donor"}
            </DialogTitle>
            <DialogDescription>
              {editingDonor ? "Update donor information." : "Add a new donor to the database."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="donor-name">Name *</Label>
                <Input
                  id="donor-name"
                  value={donorForm.name}
                  onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                  placeholder="Full name"
                  data-testid="input-donor-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="donor-type">Type *</Label>
                <Select
                  value={donorForm.type}
                  onValueChange={(val: "Individual" | "Corporation" | "Foundation") =>
                    setDonorForm({ ...donorForm, type: val })
                  }
                >
                  <SelectTrigger data-testid="select-donor-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Corporation">Corporation</SelectItem>
                    <SelectItem value="Foundation">Foundation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="donor-organization">Organization</Label>
              <Input
                id="donor-organization"
                value={donorForm.organization}
                onChange={(e) => setDonorForm({ ...donorForm, organization: e.target.value })}
                placeholder="Company or foundation name"
                data-testid="input-donor-organization"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="donor-total">Total Given *</Label>
                <Input
                  id="donor-total"
                  type="number"
                  value={donorForm.totalGiven}
                  onChange={(e) => setDonorForm({ ...donorForm, totalGiven: e.target.value })}
                  placeholder="0.00"
                  data-testid="input-donor-total"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="donor-lastamount">Last Gift Amount *</Label>
                <Input
                  id="donor-lastamount"
                  type="number"
                  value={donorForm.lastGiftAmount}
                  onChange={(e) => setDonorForm({ ...donorForm, lastGiftAmount: e.target.value })}
                  placeholder="0.00"
                  data-testid="input-donor-lastamount"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="donor-lastdate">Last Gift Date *</Label>
                <Input
                  id="donor-lastdate"
                  type="date"
                  value={donorForm.lastGiftDate}
                  onChange={(e) => setDonorForm({ ...donorForm, lastGiftDate: e.target.value })}
                  data-testid="input-donor-lastdate"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="donor-email">Email</Label>
                <Input
                  id="donor-email"
                  type="email"
                  value={donorForm.email}
                  onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                  placeholder="email@example.com"
                  data-testid="input-donor-email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="donor-phone">Phone</Label>
                <Input
                  id="donor-phone"
                  type="tel"
                  value={donorForm.phone}
                  onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                  placeholder="(123) 456-7890"
                  data-testid="input-donor-phone"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="donor-city">City</Label>
                <Input
                  id="donor-city"
                  value={donorForm.city}
                  onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })}
                  placeholder="Boston"
                  data-testid="input-donor-city"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="donor-state">State</Label>
                <Input
                  id="donor-state"
                  value={donorForm.state}
                  onChange={(e) => setDonorForm({ ...donorForm, state: e.target.value })}
                  placeholder="MA"
                  data-testid="input-donor-state"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="donor-image">Profile Image URL</Label>
              <Input
                id="donor-image"
                value={donorForm.imageUrl}
                onChange={(e) => setDonorForm({ ...donorForm, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                data-testid="input-donor-image"
              />
              {donorForm.imageUrl && (
                <div className="mt-2 flex justify-center">
                  <img 
                    src={donorForm.imageUrl} 
                    alt="Preview" 
                    className="h-20 w-20 rounded-full object-cover border-2 border-border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => setDonorDialogOpen(false)}
              data-testid="button-cancel-donor"
            >
              Cancel
            </Button>
            <Button
              className="rounded-full"
              onClick={saveDonor}
              disabled={!donorForm.name || !donorForm.totalGiven || !donorForm.lastGiftDate || !donorForm.lastGiftAmount}
              data-testid="button-save-donor"
            >
              {editingDonor ? "Update Donor" : "Add Donor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewDonor} onOpenChange={(open) => !open && setViewDonor(null)}>
        <DialogContent className="border-border/70 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70 max-w-lg">
          <DialogHeader>
            <DialogTitle data-testid="text-view-donor-title">Donor Profile</DialogTitle>
            <DialogDescription>View donor information and update their profile image.</DialogDescription>
          </DialogHeader>

          {viewDonor && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-secondary overflow-hidden border-4 border-border">
                    {viewDonor.imageUrl ? (
                      <img 
                        src={viewDonor.imageUrl} 
                        alt={viewDonor.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : viewDonor.type === "Individual" ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold" data-testid="view-donor-name">{viewDonor.name}</h3>
                  <Badge 
                    variant={viewDonor.type === "Individual" ? "secondary" : viewDonor.type === "Corporation" ? "default" : "outline"}
                    className="mt-1"
                  >
                    {viewDonor.type}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 text-sm">
                {viewDonor.organization && (
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-medium">{viewDonor.organization}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Total Given</span>
                  <span className="font-semibold text-green-600">${Number(viewDonor.totalGiven).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Last Gift</span>
                  <div className="text-right">
                    <div className="font-medium">${Number(viewDonor.lastGiftAmount).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{new Date(viewDonor.lastGiftDate).toLocaleDateString()}</div>
                  </div>
                </div>
                {(viewDonor.email || viewDonor.phone) && (
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Contact</span>
                    <div className="text-right text-xs">
                      {viewDonor.email && <div>{viewDonor.email}</div>}
                      {viewDonor.phone && <div>{viewDonor.phone}</div>}
                    </div>
                  </div>
                )}
                {(viewDonor.city || viewDonor.state) && (
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Location</span>
                    <span>{viewDonor.city && viewDonor.state ? `${viewDonor.city}, ${viewDonor.state}` : viewDonor.city || viewDonor.state}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Added</span>
                  <span>{new Date(viewDonor.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              className="rounded-full"
              onClick={() => setViewDonor(null)}
              data-testid="button-close-view-donor"
            >
              Close
            </Button>
            {canEditDonors && viewDonor && (
              <Button
                className="rounded-full"
                onClick={() => {
                  openEditDonor(viewDonor);
                  setViewDonor(null);
                }}
                data-testid="button-edit-from-view"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Donor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
