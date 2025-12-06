import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, User, Settings, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface UserProfile {
  full_name: string | null;
  email: string | null;
}

export const Navbar = () => {
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
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/40 transition-all duration-300" />
            <GraduationCap className="h-8 w-8 text-primary relative z-10" />
          </div>
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            SkillVerse
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/">
            <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary transition-all duration-300">Home</Button>
          </Link>
          <Link to="/courses">
            <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary transition-all duration-300">Courses</Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary transition-all duration-300">About</Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary transition-all duration-300">Contact</Button>
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-primary/50 transition-all duration-300">
                  <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary/50 transition-all duration-300">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-success rounded-full border-2 border-background animate-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 animate-fade-in shadow-strong border-2">
                <DropdownMenuLabel className="font-normal p-3 bg-gradient-hero rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold text-lg">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{profile?.full_name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate max-w-[150px]">
                        {profile?.email || user?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer p-3 hover:bg-primary/10 rounded-lg transition-all duration-200">
                  <LayoutDashboard className="h-4 w-4 mr-3 text-primary" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => navigate("/dashboard?tab=profile")} className="cursor-pointer p-3 hover:bg-primary/10 rounded-lg transition-all duration-200">
                  <User className="h-4 w-4 mr-3 text-primary" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem onClick={() => navigate("/admin/dashboard")} className="cursor-pointer p-3 hover:bg-accent/10 rounded-lg transition-all duration-200">
                      <Settings className="h-4 w-4 mr-3 text-accent" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer p-3 hover:bg-destructive/10 text-destructive rounded-lg transition-all duration-200">
                  <LogOut className="h-4 w-4 mr-3" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="gradient" className="shadow-medium hover:shadow-glow transition-all duration-300">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
