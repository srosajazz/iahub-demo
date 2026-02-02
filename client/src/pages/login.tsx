import berkleeLogo from "@/assets/images/berklee-logo.png";
import bostonConservatoryLogo from "@/assets/images/boston-conservatory-logo.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Building2, GraduationCap, Handshake, Heart, Sparkles, Target, Users } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

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
          description: "Redirecting to home...",
        });
        setLocation("/home");
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
    <div className="min-h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a1f2e] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <img src={berkleeLogo} alt="Berklee" className="w-8 h-8 object-contain" />
          <div className="text-white">
            <div className="font-semibold text-sm tracking-wide">Berklee</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative py-20 px-6"
        style={{
          background: "linear-gradient(135deg, #1a1f2e 0%, #2d3448 50%, #1a1f2e 100%)"
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Institutional<br />Advancement HUB
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Building partnerships, fostering relationships, and supporting
              students and artists—empowering the Berklee community to achieve
              excellence in music and the performing arts.
            </p>
            <div 
              className="inline-block px-6 py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: "#E8582B" }}
            >
              Giving Day 2026
            </div>
          </div>
        </div>
        {/* Decorative orange accent */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: "#E8582B" }}
        />
      </section>

      {/* Mission Icons Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-12">Our Mission</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#1a1f2e" }}
              >
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Developing Excellence</h3>
              <p className="text-sm text-gray-600">Building strong relationships with donors and alumni</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#E8582B" }}
              >
                <Handshake className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Strategic Partnerships</h3>
              <p className="text-sm text-gray-600">Connecting corporate and foundation partners</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#1a1f2e" }}
              >
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Community Engagement</h3>
              <p className="text-sm text-gray-600">Fostering meaningful stewardship connections</p>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="py-16 px-6 bg-gray-100 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left - Info */}
            <div>
              <div 
                className="inline-block px-3 py-1 rounded text-sm font-medium text-white mb-4"
                style={{ backgroundColor: "#E8582B" }}
              >
                IAHub Dashboard
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Amplify Berklee
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Access comprehensive tools for donor management, pipeline visibility, 
                campaign tracking, and engagement metrics. Our dashboard empowers 
                Institutional Advancement teams to make data-driven decisions.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1f2e] flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Pipeline Visibility</h4>
                    <p className="text-sm text-gray-600">Track donor journeys from prospect to major gift</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1f2e] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Data Quality Metrics</h4>
                    <p className="text-sm text-gray-600">Monitor and improve data hygiene scores</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1f2e] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Team Collaboration</h4>
                    <p className="text-sm text-gray-600">Coordinate across all IA departments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Login Form */}
            <Card className="p-8 shadow-xl border-0">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2" data-testid="text-login-title">
                  Sign In
                </h3>
                <p className="text-gray-600 text-sm">
                  Access your Institutional Advancement dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-700">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    data-testid="input-username"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    data-testid="input-password"
                    className="h-12"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  style={{ backgroundColor: "#E8582B" }}
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3 text-center font-medium">Demo Accounts</p>
                <div className="grid gap-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50">
                    <span className="font-semibold text-gray-700">admin</span>
                    <span className="text-gray-500">Administrator</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50">
                    <span className="font-semibold text-gray-700">president</span>
                    <span className="text-gray-500">Jim Lucchese</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50">
                    <span className="font-semibold text-gray-700">vp</span>
                    <span className="text-gray-500">Edward J. Lewis, III</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-gray-50">
                    <span className="font-semibold text-gray-700">staff</span>
                    <span className="text-gray-500">Staff Member</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Password: <code className="bg-gray-100 px-1.5 py-0.5 rounded">IAberk26</code>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Our Departments</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Institutional Advancement brings together dedicated teams working to 
            support Berklee's mission and growth.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Heart, name: "Annual Giving" },
              { icon: Building2, name: "Corporate & Foundation" },
              { icon: Users, name: "Alumni Affairs" },
              { icon: GraduationCap, name: "Stewardship" },
            ].map((dept, i) => (
              <div key={i} className="text-center p-4">
                <div 
                  className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: i % 2 === 0 ? "#1a1f2e" : "#E8582B" }}
                >
                  <dept.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">{dept.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer 
        className="py-12 px-6 text-center"
        style={{ backgroundColor: "#1a1f2e" }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Join Us in Making a Difference
        </h2>
        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
          Together, we can build Berklee's legacy of excellence and 
          empower the next generation of artists and musicians.
        </p>
        <div className="flex items-center justify-center gap-4">
          <img src={berkleeLogo} alt="Berklee" className="w-10 h-10 object-contain" />
          <div className="w-px h-8 bg-gray-600" />
          <img src={bostonConservatoryLogo} alt="Boston Conservatory" className="w-10 h-10 object-contain" />
        </div>
      </footer>
    </div>
  );
}
