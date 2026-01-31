import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import React, { createContext, useContext } from "react";

export type UserRole = "admin" | "president" | "vice_president" | "staff";

interface AuthData {
  authenticated: boolean;
  role?: UserRole;
  displayName?: string;
}

export const AuthContext = createContext<AuthData>({ authenticated: false });

export function useAuth() {
  return useContext(AuthContext);
}

async function checkAuth(): Promise<AuthData> {
  try {
    const res = await fetch("/api/auth/check", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      return { authenticated: true, role: data.role, displayName: data.displayName };
    }
    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: authData, isLoading } = useQuery({
    queryKey: ["auth"],
    queryFn: checkAuth,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center hero-wash grain">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authData?.authenticated) {
    return <Redirect to="/" />;
  }

  return (
    <AuthContext.Provider value={authData}>
      <Component />
    </AuthContext.Provider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={DashboardPage} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
