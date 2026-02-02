import { useAuth } from "@/App";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ClipboardList,
  Database,
  FileText,
  Flag,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Radar,
  Target,
  User,
  Users,
  Zap
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  variant?: "ghost" | "secondary";
  onClick?: () => void;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, displayName } = useAuth();
  const [location] = useLocation();

  // Role-based visibility
  const canViewDonors = ["admin", "president", "vice_president"].includes(role || "");

  const navItems: SidebarItem[] = [
    { id: "home", label: "Home", icon: Home, href: "/home" },
    { id: "act", label: "Act now", icon: Zap, href: "/dashboard?tab=act" },
    { id: "strategy", label: "Strategy", icon: Target, href: "/dashboard?tab=strategy" },
    { id: "pipeline", label: "Pipeline", icon: Database, href: "/dashboard?tab=pipeline" },
    { id: "campaign", label: "Campaign", icon: Flag, href: "/dashboard?tab=campaign" },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard?tab=dashboard" },
    { id: "reports", label: "Reports", icon: FileText, href: "/reports" },
    { id: "details", label: "Details", icon: ClipboardList, href: "/details" },
  ];

  if (canViewDonors) {
    navItems.push({ id: "donors", label: "Donors", icon: Users, href: "/donors" });
  }

  // Helper to determine if link is active
  const isActive = (href: string) => {
      if (href.startsWith("/dashboard")) {
          return location === "/dashboard";
      }
      return location === href;
  };

  return (
    <div className="min-h-dvh flex bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card z-20 sticky top-0 h-dvh">
        <div className="p-6">
          <div className="flex items-center gap-2 font-semibold tracking-tight text-xl">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Radar className="h-5 w-5" />
            </div>
            <span>IAHub</span>
          </div>
        </div>

        <div className="flex-1 px-4 overflow-y-auto">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link key={item.id} href={item.href || "#"}>
                <a
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive(item.href || "")
                      ? "bg-secondary text-secondary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              </Link>
            ))}

            <Separator className="my-4" />
            
            <div className="px-3 py-2">
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Workspaces
                </h3>
                <div className="space-y-1">
                     <Link href="/reports">
                        <a className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                            <FileText className="h-4 w-4" />
                            <span>Reports</span>
                        </a>
                     </Link>
                      <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Users className="h-4 w-4" />
                        <span>Team</span>
                     </button>
                </div>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t bg-card/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-muted">
              <User className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {displayName || "User"}
              </div>
              <div className="text-xs text-muted-foreground">
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
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-h-dvh overflow-auto">
        {/* Header */}
         <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                   Pipeline visibility, campaign pacing, engagement opportunity, and data-quality signals.
                </p>
              </div>

               <div className="flex items-center gap-3">
                 <ModeToggle />
                 <Button className="h-9 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:from-blue-700 hover:to-blue-800">
                    <Mail className="mr-2 h-4 w-4" />
                    Message IA team
                 </Button>
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
            {children}
        </main>
      </div>
    </div>
  );
}
