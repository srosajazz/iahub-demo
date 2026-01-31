import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import berkleeLogo from "@/assets/images/berklee-logo.png";
import bostonConservatoryLogo from "@/assets/images/boston-conservatory-logo.png";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (res.ok) {
        toast({
          title: "Welcome to IAHub",
          description: "Redirecting to dashboard...",
        });
        setLocation("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex">
      {/* Left side - Giving Day 2026 branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 items-center justify-center p-12"
        style={{ backgroundColor: "#D4912E" }}
      >
        <div className="text-center">
          <h1 
            className="text-6xl font-light mb-8"
            style={{ 
              fontFamily: "'Brush Script MT', cursive",
              color: "#3D3D3D"
            }}
          >
            Giving Day 2026
          </h1>
          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="flex items-center gap-2" style={{ color: "#3D3D3D" }}>
              <img src={berkleeLogo} alt="Berklee" className="w-8 h-8 object-contain" />
              <div className="text-left">
                <div className="font-bold text-sm tracking-wide">Berklee</div>
                <div className="text-[10px] tracking-wide">College of Music</div>
              </div>
            </div>
            <div className="w-px h-10" style={{ backgroundColor: "#3D3D3D", opacity: 0.5 }} />
            <div className="flex items-center gap-2" style={{ color: "#3D3D3D" }}>
              <img src={bostonConservatoryLogo} alt="Boston Conservatory" className="w-8 h-8 object-contain" />
              <div className="text-left">
                <div className="font-bold text-sm tracking-widest">BOSTON</div>
                <div className="text-[9px] tracking-widest">CONSERVATORY</div>
                <div className="text-[8px] tracking-wide">at Berklee</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 hero-wash grain">
        <Card className="w-full max-w-md p-8 glass-card">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl mb-2" data-testid="text-login-title">
              IAHub
            </h1>
            <p className="text-muted-foreground text-sm">
              Institutional Advancement Dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                data-testid="input-username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                data-testid="input-password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-3 text-center">Demo Accounts (Password: IAberk26)</p>
            <div className="grid gap-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="font-medium">admin</span>
                <span className="text-muted-foreground">Administrator - Full access + Donor CRUD</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="font-medium">president</span>
                <span className="text-muted-foreground">President - Can view donors</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="font-medium">vp</span>
                <span className="text-muted-foreground">Vice President - Can view donors</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="font-medium">staff</span>
                <span className="text-muted-foreground">Staff - No donor access</span>
              </div>
            </div>
          </div>

          {/* Credentials hint box */}
          <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              Demo Credentials:
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Username:</span>{" "}
                <code className="bg-background px-1.5 py-0.5 rounded font-mono">admin</code>
              </p>
              <p>
                <span className="text-muted-foreground">Password:</span>{" "}
                <code className="bg-background px-1.5 py-0.5 rounded font-mono">IAberk26</code>
              </p>
            </div>
          </div>

          {/* Mobile branding */}
          <div 
            className="lg:hidden mt-8 p-6 rounded-lg text-center"
            style={{ backgroundColor: "#D4912E" }}
          >
            <h2 
              className="text-2xl font-light"
              style={{ 
                fontFamily: "'Brush Script MT', cursive",
                color: "#3D3D3D"
              }}
            >
              Giving Day 2026
            </h2>
          </div>
        </Card>
      </div>
    </div>
  );
}
