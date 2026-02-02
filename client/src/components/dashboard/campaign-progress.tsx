import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from "recharts";

const data = [
  { name: "Progress", value: 18400000 },
  { name: "Remaining", value: 6600000 }, // 25M goal - 18.4M projected
];

const COLORS = ['hsl(var(--chart-2))', 'hsl(var(--muted))'];

const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export function CampaignProgress() {
  return (
    <Card className="col-span-12 md:col-span-4">
      <CardHeader>
        <CardTitle>Campaign Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                </Pie>
                <Tooltip 
                     formatter={(value: number) => formatCurrency(value)}
                     contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        borderRadius: 'var(--radius)',
                    }}
                />
            </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <div className="text-3xl font-bold">74%</div>
                <div className="text-xs text-muted-foreground">of $25M Goal</div>
            </div>
        </div>
        <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Projected</span>
                <span className="font-medium">{formatCurrency(18400000)}</span>
            </div>
             <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Goal</span>
                <span className="font-medium">{formatCurrency(25000000)}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
