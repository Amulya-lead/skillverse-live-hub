import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Search, LogOut, User, LayoutDashboard, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  full_name: string | null;
  email: string | null;
}

const HeroSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          checkAdminRole(session.user.id);
          fetchProfile(session.user.id);
        } else {
          setIsAdmin(false);
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "instructor"])
      .maybeSingle();

    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Goodbye! 👋",
        description: "Logged out successfully",
      });
      navigate("/auth");
    }
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-hero -z-10" />
      <div className="absolute top-20 right-[5%] w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-float opacity-70" />
      <div className="absolute top-40 left-[5%] w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-float opacity-60" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-primary opacity-[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="container mx-auto px-4 py-6 relative z-50 animate-fade-in">
        <div className="flex items-center justify-between glass-card rounded-2xl p-4 md:px-6 shadow-sm border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg hover:shadow-glow transition-all duration-500 hover:rotate-3">
              <span className="text-white font-black text-xl tracking-tighter">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">SkillVerse</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Live Learning Hub</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 bg-secondary/30 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
            <Link to="/courses" className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-300 relative group">
              Courses
              <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
            <Link to="/about" className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-300 relative group">
              About
              <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
            <Link to="/contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-300 relative group">
              Contact
              <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-gradient-primary transition-all duration-300 group-hover:w-full rounded-full" />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 hover:ring-2 hover:ring-primary/20 transition-all duration-300">
                    <Avatar className="h-11 w-11 border-2 border-white shadow-soft">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-success rounded-full border-2 border-white shadow-sm animate-pulse" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 p-2 animate-fade-in glass-card border-white/20 shadow-strong mt-2 mr-2">
                  <DropdownMenuLabel className="font-normal p-4 bg-gradient-to-br from-primary/10 to-transparent rounded-xl mb-2 border border-white/10">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                        <AvatarFallback className="bg-gradient-primary text-white font-bold text-lg">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 min-w-0">
                        <p className="text-sm font-bold leading-none truncate text-foreground">{profile?.full_name || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate opacity-80">
                          {profile?.email || user?.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <div className="space-y-1 p-1">
                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer p-3 hover:bg-primary/5 focus:bg-primary/5 rounded-lg transition-all duration-200 group">
                      <div className="p-2 bg-primary/10 rounded-md text-primary mr-3 group-hover:scale-110 transition-transform">
                        <LayoutDashboard className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Dashboard</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/dashboard?tab=profile")} className="cursor-pointer p-3 hover:bg-primary/5 focus:bg-primary/5 rounded-lg transition-all duration-200 group">
                      <div className="p-2 bg-primary/10 rounded-md text-primary mr-3 group-hover:scale-110 transition-transform">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="font-medium">My Profile</span>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin/dashboard")} className="cursor-pointer p-3 hover:bg-accent/10 focus:bg-accent/10 rounded-lg transition-all duration-200 group text-amber-700">
                        <div className="p-2 bg-accent/20 rounded-md text-amber-600 mr-3 group-hover:scale-110 transition-transform">
                          <Settings className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                  </div>

                  <DropdownMenuSeparator className="my-2 bg-border/50" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer p-3 hover:bg-destructive/5 focus:bg-destructive/5 text-destructive rounded-lg transition-all duration-200 group">
                    <div className="p-2 bg-destructive/10 rounded-md mr-3 group-hover:scale-110 transition-transform">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button variant="ghost" className="hover:bg-primary/5 text-foreground/80 hover:text-primary font-medium">Login</Button>
                </Link>
                <Link to="/auth">
                  <Button className="glass-button shadow-medium hover:shadow-glow px-6 font-semibold">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10 flex flex-col items-center">

        {/* Floating Icons (3D Effect) */}
        <div className="absolute hidden lg:block left-[10%] top-[25%] animate-float p-4 glass-card rounded-2xl rotate-[-6deg] shadow-strong z-0 hover:z-10 transition-all hover:scale-110 cursor-pointer">
          <div className="bg-blue-100 p-3 rounded-xl">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="absolute hidden lg:block right-[10%] top-[30%] animate-float p-4 glass-card rounded-2xl rotate-[12deg] shadow-strong z-0 hover:z-10 transition-all hover:scale-110 cursor-pointer" style={{ animationDelay: '1.5s' }}>
          <div className="bg-amber-100 p-3 rounded-xl">
            <User className="h-8 w-8 text-amber-600" />
          </div>
        </div>


        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-8 px-5 py-2 glass-card rounded-full shadow-soft animate-slide-in-left border border-white/40">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            <span className="text-sm font-semibold text-primary tracking-wide">Hub of Skills Under One Roof 🚀</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] animate-fade-in-up tracking-tight drop-shadow-sm">
            Master Skills Through <br />
            <span className="bg-clip-text text-transparent bg-gradient-primary relative inline-block">
              Live Interactive
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
            {' '}Learning
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-fade-in font-light leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Transform your career with <span className="font-semibold text-foreground">live sessions</span> led by industry experts.
            Real-time interaction, instant doubt solving, and certified mastery.
          </p>

          {/* Premium Search Bar */}
          <div className="max-w-3xl mx-auto mb-12 animate-scale-in relative group" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <div className="relative flex items-center p-2 glass-card rounded-full border border-white/30 focus-within:ring-2 ring-primary/20 shadow-medium transition-all duration-300">
              <div className="pl-4 text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <Input
                placeholder="What do you want to learn today? (e.g., React, Photography, Marketing)"
                className="flex-1 h-12 bg-transparent border-none text-lg placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-glow px-8 h-12 text-lg font-semibold bg-gradient-primary border-none">
                Search
              </Button>
            </div>
          </div>

          <div className="flex gap-5 justify-center flex-wrap animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Link to="/courses">
              <Button size="lg" className="h-14 px-10 rounded-2xl text-lg shadow-strong hover:shadow-glow hover:-translate-y-1 transition-all duration-300 bg-primary text-primary-foreground border-2 border-transparent">
                Explore Courses
              </Button>
            </Link>
            <Link to="/request-session">
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-2xl text-lg border-2 hover:bg-secondary/50 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300">
                Request a Session
              </Button>
            </Link>
          </div>

          {/* Stats Cards - Glassmorphism */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 mt-20 max-w-4xl mx-auto relative z-10">
            <div className="glass-card p-6 rounded-2xl hover:bg-white/40 transition-colors duration-300 animate-slide-in-left border border-white/20" style={{ animationDelay: '0.5s' }}>
              <div className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-primary mb-2">2k+</div>
              <div className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wider">Active Students</div>
            </div>
            <div className="glass-card p-6 rounded-2xl hover:bg-white/40 transition-colors duration-300 animate-fade-in-up border border-white/20 shadow-lg -mt-6" style={{ animationDelay: '0.6s' }}>
              <div className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-accent mb-2">50+</div>
              <div className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wider">Expert Mentors</div>
            </div>
            <div className="glass-card p-6 rounded-2xl hover:bg-white/40 transition-colors duration-300 animate-slide-in-right border border-white/20" style={{ animationDelay: '0.7s' }}>
              <div className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-primary mb-2">100+</div>
              <div className="text-sm md:text-base font-medium text-muted-foreground uppercase tracking-wider">Live Sessions</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
