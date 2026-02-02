import { DailyConversions } from "@/components/dashboard/daily-conversions";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function DetailsPage() {
  return (
    <DashboardLayout>
      <div className="h-full">
         <h1 className="text-2xl font-bold tracking-tight mb-4">Details</h1>
         <div className="h-[calc(100vh-180px)]">
            <DailyConversions />
         </div>
      </div>
    </DashboardLayout>
  );
}
