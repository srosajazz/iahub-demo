import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, CheckCircle2, Clock, Target, TrendingUp } from "lucide-react";

interface TimelineEvent {
    id: string;
    department: string;
    title: string;
    date: string;
    type: "Due Date" | "Event" | "Milestone";
    status: "Upcoming" | "In Progress" | "Completed" | "Overdue";
    description: string;
}

const initiatives: TimelineEvent[] = [
    {
        id: "1",
        department: "Advancement Services",
        title: "Data Model Cleanup & Wealth Screening Integration",
        date: "2026-02-15",
        type: "Due Date",
        status: "In Progress",
        description: "Complete normalization of 140k records and integrate external wealth screening data to improve capacity scores."
    },
    {
        id: "2",
        department: "Alumni Affairs",
        title: "Regional Chapter Launch - West Coast",
        date: "2026-02-28",
        type: "Event",
        status: "Upcoming",
        description: "launch event for the new LA and SF alumni chapters, targeting 500+ attendees."
    },
    {
        id: "3",
        department: "Annual Giving",
        title: "Spring Appeal Segmentation Finalization",
        date: "2026-03-01",
        type: "Due Date",
        status: "Upcoming",
        description: "Finalize donor segments based on new predictive modeling for the Spring direct mail and email campaign."
    },
    {
        id: "4",
        department: "Boston Conservatory at Berklee IA",
        title: "Centennial Scholarship Gala",
        date: "2026-03-15",
        type: "Event",
        status: "Upcoming",
        description: "Major fundraising gala celebrating 100 years, with a goal of raising $2M for scholarships."
    },
    {
        id: "5",
        department: "Corporate and Foundation Relations",
        title: "Q1 Grant Reporting Deadline",
        date: "2026-03-31",
        type: "Due Date",
        status: "Upcoming",
        description: "Submission of impact reports for major foundation grants received in the previous fiscal year."
    },
    {
        id: "6",
        department: "Engagement and Outreach",
        title: "Global Music Industry Webinar Series",
        date: "2026-04-10",
        type: "Event",
        status: "Upcoming",
        description: "Kickoff of a 4-part webinar series featuring alumni industry leaders to engage international prospects."
    },
    {
        id: "7",
        department: "Philanthropic Partnerships",
        title: "Strategic Corporate Partner Summit",
        date: "2026-04-22",
        type: "Event",
        status: "Upcoming",
        description: "Hosting top 20 corporate partners to discuss long-term collaboration and sponsorship opportunities."
    },
    {
        id: "8",
        department: "Stewardship and Donor Relations",
        title: "Annual Impact Report Distribution",
        date: "2026-05-01",
        type: "Milestone",
        status: "Upcoming",
        description: "Digital and print distribution of the FY25 Annual Impact Report to all donors giving $1k+."
    }
];

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary/90">FY26 Strategic Growth Initiative</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-3xl">
                    A comprehensive approach leveraging analytics, predictive modeling, and performance metrics to drive fundraising effectiveness across all Advancement units.
                </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800">Analytics Applied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="text-2xl font-bold text-blue-900">Predictive Modeling</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">For donor retention & upgrade</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-800">Data Foundation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <DatabaseIcon className="h-4 w-4 text-purple-600" />
                            <span className="text-2xl font-bold text-purple-900">140k Records</span>
                        </div>
                        <p className="text-xs text-purple-600 mt-1">Cleaned & Enriched</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800">Target Outcome</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-emerald-600" />
                            <span className="text-2xl font-bold text-emerald-900">+15% Engagement</span>
                        </div>
                         <p className="text-xs text-emerald-600 mt-1">Year-over-Year Growth</p>
                    </CardContent>
                </Card>
            </div>
        </div>

        <Separator />

        {/* Timeline Section */}
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Initiative Timeline & Key Milestones
                </h2>
                <Badge variant="outline" className="text-sm px-3 py-1">FY26 Q3-Q4</Badge>
            </div>

            <div className="relative border-l-2 border-muted ml-4 space-y-10 pb-10">
                {initiatives.map((item, index) => (
                    <div key={item.id} className="relative pl-8">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background ${
                            item.status === 'Completed' ? 'bg-emerald-500' : 
                            item.status === 'In Progress' ? 'bg-blue-500' : 'bg-muted-foreground/30'
                        }`} />
                        
                        <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                    <div className="space-y-1">
                                        <Badge variant="secondary" className="mb-1 w-fit">{item.department}</Badge>
                                        <CardTitle className="text-base font-semibold text-primary">{item.title}</CardTitle>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-full w-fit">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {item.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`h-2 w-2 rounded-full ${
                                            item.type === 'Due Date' ? 'bg-amber-500' : 
                                            item.type === 'Event' ? 'bg-purple-500' : 'bg-blue-500'
                                        }`} />
                                        {item.type}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        {item.status === 'In Progress' && <Clock className="h-3 w-3" />}
                                        {item.status === 'Completed' && <CheckCircle2 className="h-3 w-3" />}
                                        {item.status}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Missing icon fix
function DatabaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  )
}
