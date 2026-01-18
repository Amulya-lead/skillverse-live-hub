import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // We will let the handleRedirect logic handle where to go, 
        // but for now, if already logged in, we might just want to check role and redirect.
        // Or simply let them be if they are on /auth it might be better to redirect.
        handleRoleRedirect(session.user.id);
      }
    };
    checkSession();
  }, [navigate]);

  const handleRoleRedirect = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single() as { data: any };

      const role = profile?.role || 'student';

      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'instructor') navigate('/instructor');
      else navigate('/dashboard');
    } catch (e) {
      console.error("Error fetching role:", e);
      navigate('/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login Successful! 🎉",
        description: "Welcome back to SkillVerse!",
      });

      if (data.user) {
        await handleRoleRedirect(data.user.id);
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Signup Successful! 🎉",
        description: "Your account has been created. Welcome to SkillVerse!",
      });

      if (data.user) {
        // Ensure profile is created before redirecting if trigger is slow?
        // The trigger is usually fast, but we can wait a moment or just redirect.
        // For now, let's assume trigger handles it or we handle it in context.
        await handleRoleRedirect(data.user.id);
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-background">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-gradient-hero -z-10" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse opacity-60" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] animate-pulse opacity-60" style={{ animationDelay: '2s' }} />

      {/* Animated Particles/Orbs */}
      <div className="absolute top-20 right-[20%] w-4 h-4 bg-primary rounded-full animate-float blur-[1px]" />
      <div className="absolute bottom-40 left-[15%] w-6 h-6 bg-accent rounded-full animate-float blur-[1px]" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-[10%] w-3 h-3 bg-indigo-400 rounded-full animate-float blur-[1px]" style={{ animationDelay: '0.5s' }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">

        <div className="mb-10 text-center animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow rotate-3 hover:rotate-6 transition-transform duration-500">
            <span className="text-white font-black text-4xl tracking-tighter drop-shadow-sm">S</span>
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight">Welcome to <span className="bg-clip-text text-transparent bg-gradient-primary">SkillVerse</span></h1>
          <p className="text-lg text-muted-foreground font-light">Your gateway to interactive live learning.</p>
        </div>

        <Card className="glass-card border-white/20 shadow-strong overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-80" />

          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
            <CardDescription className="text-base">
              Create an account or sign in to continue
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                <TabsTrigger
                  value="login"
                  className="rounded-lg font-medium text-base data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg font-medium text-base data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all duration-300"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="animate-fade-in focus-visible:ring-0">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-semibold pl-1">Email Address</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-white/50 border-white/20 focus:bg-white focus:ring-2 ring-primary/20 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-semibold pl-1">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-white/50 border-white/20 focus:bg-white focus:ring-2 ring-primary/20 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-bold rounded-xl shadow-medium hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 mt-2"
                    variant="gradient"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Signing in...
                      </div>
                    ) : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="animate-fade-in focus-visible:ring-0">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-semibold pl-1">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-white/50 border-white/20 focus:bg-white focus:ring-2 ring-primary/20 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-semibold pl-1">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl bg-white/50 border-white/20 focus:bg-white focus:ring-2 ring-primary/20 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-semibold pl-1">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 rounded-xl bg-white/50 border-white/20 focus:bg-white focus:ring-2 ring-primary/20 transition-all duration-300 backdrop-blur-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-bold rounded-xl shadow-medium hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 mt-2"
                    variant="gradient"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Creating account...
                      </div>
                    ) : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
