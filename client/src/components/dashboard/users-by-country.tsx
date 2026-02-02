import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const data = [
  { name: "India", value: 50, color: "#9b8afb" },
  { name: "USA", value: 35, color: "#6e89b3" },
  { name: "Brazil", value: 10, color: "#5664d2" },
  { name: "Other", value: 5, color: "#2ab57d" },
];

const COLORS = ["#9b8afb", "#6e89b3", "#5664d2", "#2ab57d"];

export function UsersByCountry() {
  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 h-full">
      <h3 className="text-lg font-semibold mb-6">Users by country</h3>
      
      <div className="flex flex-col items-center">
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold">98.5K</span>
            <span className="text-muted-foreground text-sm">Total</span>
          </div>
        </div>

        <div className="w-full mt-6 space-y-4">
          {data.map((item, index) => (
            <div key={item.name} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm font-medium">
                <span>{item.name}</span>
                <span>{item.value}%</span>
              </div>
              <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ width: `${item.value}%`, backgroundColor: item.color }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
