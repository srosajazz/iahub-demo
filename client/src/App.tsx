import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardPage from "@/pages/dashboard";
import DetailsPage from "@/pages/details";
import DonorsPage from "@/pages/donors";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";
import ReportsPage from "@/pages/reports";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ToastContainer } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css';
import React, { createContext, useContext } from "react";
import { Redirect, Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";



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
  // Static Demo Mode Bypass for GitHub Pages
  if (import.meta.env.VITE_IS_DEMO === 'true') {
     return { 
       authenticated: true, 
       role: 'admin', 
       displayName: 'Demo Admin' 
     };
  }

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
      <Route path="/home">
        {() => <ProtectedRoute component={HomePage} />}
      </Route>
      <Route path="/dashboard">
        {() => <ProtectedRoute component={DashboardPage} />}
      </Route>
      <Route path="/details">
        {() => <ProtectedRoute component={DetailsPage} />}
      </Route>
      <Route path="/reports">
        {() => <ProtectedRoute component={ReportsPage} />}
      </Route>
      <Route path="/donors">
        {() => <ProtectedRoute component={DonorsPage} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme" attribute="class">
        <TooltipProvider>
          <Toaster />
          <ToastContainer />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;


