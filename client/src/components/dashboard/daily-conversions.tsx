import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";

// Helper to generate initial 30 days of data
const generateInitialData = () => {
    return Array.from({ length: 30 }, (_, i) => ({
        day: `Day ${i + 1}`,
        value: Math.floor(Math.random() * 50) + 10,
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
};

const initialInitiatives = [
  { id: 1, title: "Berklee Fund (Operations)", status: "Active", donors: "2,423", gifts: "8,345", avgGift: "$185", raised: "$1.2M" },
  { id: 2, title: "Thrive Scholarship (Growth)", status: "Active", donors: "1,240", gifts: "5,653", avgGift: "$950", raised: "$4.5M" },
  { id: 3, title: "Capital Campaign - New Building", status: "Planning", donors: "58", gifts: "34", avgGift: "$50K", raised: "$8.2M" },
  { id: 4, title: "Alumni Association Fund", status: "Active", donors: "11,240", gifts: "11,253", avgGift: "$45", raised: "$520K" },
  { id: 5, title: "Parent & Family Fund", status: "Active", donors: "4,240", gifts: "3,653", avgGift: "$350", raised: "$1.4M" },
  { id: 6, title: "Boston Conservatory Fund", status: "Active", donors: "840", gifts: "543", avgGift: "$220", raised: "$185K" },
  { id: 7, title: "Gala 2026 Sponsorships", status: "Planning", donors: "12", gifts: "8", avgGift: "$15K", raised: "$120K" },
  { id: 8, title: "Community Outreach", status: "Active", donors: "1,240", gifts: "563", avgGift: "$85", raised: "$98K" },
  { id: 9, title: "Endowment - Jazz Studies", status: "Active", donors: "45", gifts: "23", avgGift: "$5K", raised: "$2.1M" },
  { id: 10, title: "Emergency Student Aid", status: "Active", donors: "5,240", gifts: "14,563", avgGift: "$25", raised: "$350K" },
  { id: 11, title: "Music Therapy Research", status: "Active", donors: "145", gifts: "63", avgGift: "$1.2K", raised: "$180K" },
  { id: 12, title: "Global Jazz Institute", status: "Active", donors: "85", gifts: "45", avgGift: "$2.5K", raised: "$410K" },
];

export function DailyConversions() {
  // Store data in state to allow updates
  const [chartData, setChartData] = useState<Record<number, any[]>>({});

  // Initialize data on mount
  useEffect(() => {
    const nextData: Record<number, any[]> = {};
    initialInitiatives.forEach(item => {
        nextData[item.id] = generateInitialData();
    });
    setChartData(nextData);
  }, []);

  // Simulate "Live" updates
  useEffect(() => {
    const interval = setInterval(() => {
        setChartData(prev => {
            const next = { ...prev };
            // Randomly update a few rows to look "alive"
            Object.keys(next).forEach(key => {
                if (Math.random() > 0.7) {
                    const id = Number(key);
                    const currentData = [...next[id]];
                    // Modify the last day's value slightly
                    const lastIdx = currentData.length - 1;
                    const newValue = Math.max(0, currentData[lastIdx].value + (Math.floor(Math.random() * 10) - 5));
                    currentData[lastIdx] = { ...currentData[lastIdx], value: newValue };
                    next[id] = currentData;
                }
            });
            return next;
        });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border h-full flex flex-col">
       <div className="p-5 border-b flex items-center justify-between bg-muted/20">
        <div>
            <h3 className="text-lg font-semibold">Initiative Performance</h3>
            <p className="text-sm text-muted-foreground hidden sm:block">Real-time metrics for Operations, Growth, and Relationships.</p>
        </div>
        <Badge variant="outline" className="animate-pulse text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
            ● Live Updates
        </Badge>
      </div>

      <ScrollArea className="flex-1 w-full bg-card">
        <div className="min-w-[800px]">
            <div className="grid grid-cols-[1.5fr_0.8fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 px-6 py-3 border-b text-xs font-medium text-muted-foreground bg-muted/10 sticky top-0 z-10 backdrop-blur-sm">
                <div>Initiative / Fund</div>
                <div>Status</div>
                <div className="text-right">Donors</div>
                <div className="text-right">Gifts</div>
                <div className="text-right">Avg Gift</div>
                <div className="text-right">Total Raised</div>
                <div className="text-right">Recent Activity (30 Days)</div>
            </div>

            <div className="divide-y divide-border/40">
                {initialInitiatives.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1.5fr_0.8fr_1fr_1fr_1fr_1fr_1.5fr] gap-4 px-6 py-3.5 items-center hover:bg-muted/40 transition-colors group">
                        <div className="flex items-center gap-2 font-medium text-sm text-foreground/90 truncate">
                            {item.title}
                        </div>
                        <div>
                             <Badge 
                                variant="secondary" 
                                className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-normal border",
                                    item.status === "Active" 
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                )}
                            >
                                {item.status}
                            </Badge>
                        </div>
                        <div className="text-right text-sm text-muted-foreground font-mono">{item.donors}</div>
                         <div className="text-right text-sm text-muted-foreground font-mono">{item.gifts}</div>
                        <div className="text-right text-sm text-muted-foreground font-mono">{item.avgGift}</div>
                        <div className="text-right text-sm text-muted-foreground font-mono">{item.raised}</div>
                        
                        <div className="h-[40px] w-full flex justify-end pl-4">
                            <div className="w-[140px] h-full">
                                {chartData[item.id] && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData[item.id]}>
                                            <Tooltip 
                                                cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                    return (
                                                        <div className="rounded-lg border bg-popover px-2 py-1 text-xs shadow-sm text-popover-foreground">
                                                            <span className="font-semibold">{payload[0].payload.date}:</span> {payload[0].value} gifts
                                                        </div>
                                                    );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Bar 
                                                dataKey="value" 
                                                fill="hsl(var(--primary))" 
                                                radius={[2, 2, 0, 0]} 
                                                isAnimationActive={true}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </ScrollArea>
    </div>
  );
}
