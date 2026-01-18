import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Users, BookOpen, Activity, LogOut, Search,
  Trash2, MoreVertical, CheckCircle2, XCircle,
  TrendingUp, DollarSign, Settings, Bell,
  ChevronRight, Command, AlertTriangle, Eye, Zap
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You must be an administrator to view this page.",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    setProfile(profile);
    fetchAllData();
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { data: usersData } = await supabase.from("profiles").select("*").order('created_at', { ascending: false });
      setUsers(usersData || []);
      const { data: coursesData } = await supabase.from("courses").select("*, profiles(full_name)").order('created_at', { ascending: false });
      setCourses(coursesData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error: pError } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
      const { error: rError } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId);
      if (pError || rError) throw (pError || rError);
      toast({ title: "Role Updated", description: `User role changed to ${newRole}` });
      fetchAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!confirm("DELETE WARNING: This action is permanent. Continue?")) return;
    try {
      const { error } = await supabase.from("courses").delete().eq("id", courseId);
      if (error) throw error;
      toast({ title: "Course Deleted", description: "The course has been permanently removed." });
      fetchAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { title: "Total Users", value: users.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", trend: "+12%" },
    { title: "Active Courses", value: courses.length, icon: BookOpen, color: "text-purple-500", bg: "bg-purple-500/10", trend: "+5%" },
    { title: "Platform Revenue", value: "₹0", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10", trend: "+8%" },
    { title: "System Health", value: "99.9%", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "Stable" },
  ];

  if (loading) return (
    <div className="min-h-screen grid place-items-center bg-black text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        <div className="text-sm text-muted-foreground animate-pulse">Initializing Command Center...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex font-sans selection:bg-red-500/30">
      {/* Sidebar */}
      <aside className="w-20 lg:w-72 bg-zinc-950 border-r border-white/5 flex flex-col fixed h-full z-50 transition-all duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-900 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Admin<span className="text-red-500">OS</span></span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "overview", label: "Overview", icon: Command },
            { id: "users", label: "User Management", icon: Users },
            { id: "courses", label: "Course Control", icon: BookOpen },
            { id: "analytics", label: "Analytics", icon: TrendingUp },
            { id: "settings", label: "System Settings", icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === item.id
                  ? "bg-red-600 text-white shadow-[0_4px_20px_rgba(220,38,38,0.4)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <item.icon className={`h-5 w-5 ${activeTab === item.id ? "animate-pulse" : ""}`} />
              <span className="hidden lg:block font-medium">{item.label}</span>
              {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden lg:block" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="hidden lg:flex items-center gap-3 p-3 rounded-xl bg-zinc-900 mb-4 border border-white/5">
            <Avatar className="h-9 w-9 border border-red-500/30">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-zinc-800 text-red-500">AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">Administrator</p>
              <p className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
            <LogOut className="h-5 w-5" />
            <span className="hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 pl-20 lg:pl-72 w-full">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
              <input
                placeholder="Global Search..."
                className="w-full bg-zinc-900 border-none outline-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
              <Bell className="h-5 w-5 text-zinc-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-black" />
            </button>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold ring-1 ring-white/10">⌘K</div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* OVERVIEW SECTION */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-zinc-900/50 backdrop-blur border border-white/5 p-6 rounded-2xl hover:border-red-500/20 transition-all group hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-zinc-400 border border-white/5">{stat.trend}</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm text-zinc-500">{stat.title}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Log */}
                <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-red-500" /> System Activity
                    </h3>
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">View Full Log</Button>
                  </div>
                  <ScrollArea className="h-[300px] p-6">
                    <div className="space-y-6 relative">
                      <div className="absolute left-2.5 top-0 bottom-0 w-px bg-zinc-800" />
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <div key={i} className="relative flex gap-4 items-start">
                          <div className="h-5 w-5 rounded-full bg-black border-2 border-zinc-700 z-10 box-content shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm font-medium">New User Registration</div>
                            <div className="text-xs text-zinc-500 mt-1">User <span className="text-white">alex.design@gmail.com</span> joined as Instructor</div>
                            <div className="text-xs text-zinc-600 mt-1 font-mono">2 mins ago</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-red-900/20 to-black border border-red-500/20 rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" /> Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button className="w-full justify-start bg-white/5 hover:bg-white/10 h-12 text-zinc-300" variant="ghost">
                      <Archive className="mr-2 h-4 w-4" /> Export System Logs
                    </Button>
                    <Button className="w-full justify-start bg-white/5 hover:bg-white/10 h-12 text-zinc-300" variant="ghost">
                      <AlertTriangle className="mr-2 h-4 w-4" /> Trigger Maintenance Mode
                    </Button>
                    <Button className="w-full justify-start bg-red-600 hover:bg-red-700 text-white h-12 mt-4 shadow-lg shadow-red-900/20">
                      Create System Broadcast
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* USERS TABLE WITH ADVANCED OPTIONS */}
          {activeTab === 'users' && (
            <Card className="bg-zinc-900/50 border-white/5 text-white">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>User Database</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-white/10 bg-black/50 hover:bg-white/10">
                      Export CSV
                    </Button>
                    <Button size="sm" className="bg-white text-black hover:bg-zinc-200">
                      Add User
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>Manage roles, permissions, and account status.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-white/5 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-zinc-400 font-medium border-b border-white/5">
                      <tr>
                        <th className="p-4 pl-6">Identity</th>
                        <th className="p-4">Current Role</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right pr-6">Management</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-white/10">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback>{user.full_name?.substring(0, 2)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-bold text-white group-hover:text-red-400 transition-colors">{user.full_name || 'Anonymous'}</div>
                                <div className="text-xs text-zinc-500 font-mono">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Select defaultValue={user.role} onValueChange={(val) => updateUserRole(user.id, val)}>
                              <SelectTrigger className="w-40 bg-black/50 border-white/10 h-9 font-medium">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="instructor">Instructor</SelectItem>
                                <SelectItem value="admin" className="text-red-400">Administrator</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-1">
                              Active
                            </Badge>
                          </td>
                          <td className="p-4 text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-white">
                                  <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
                                  <DropdownMenuItem>Send Password Reset</DropdownMenuItem>
                                  <DropdownMenuItem>Suspend Account</DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-white/10" />
                                  <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">Delete Permanently</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* COURSES CONTROL */}
          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="group bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 hover:border-red-500/20 p-4 rounded-xl flex items-center gap-6 transition-all duration-300">
                  <div className="h-20 w-32 rounded-lg bg-zinc-800 bg-cover bg-center shrink-0 border border-white/10" style={{ backgroundImage: `url(${course.image_url})` }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg truncate group-hover:text-red-400 transition-colors">{course.title}</h3>
                      <Badge variant="secondary" className="text-[10px] h-5 bg-white/10 text-white border-none">{course.booking_type || 'Standard'}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.profiles?.full_name}</span>
                      <span>•</span>
                      <span>₹{course.price}</span>
                      <span>•</span>
                      <span className={course.status === 'published' ? "text-emerald-500" : "text-yellow-500"}>{course.status.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Switch id={`feat-${course.id}`} />
                        <label htmlFor={`feat-${course.id}`} className="text-xs text-zinc-500 font-medium">Featured</label>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-white/10 mx-2" />
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => deleteCourse(course.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SETTINGS (Mock) */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card className="bg-zinc-900/50 border-white/5 text-white">
                <CardHeader>
                  <CardTitle>Platform Configuration</CardTitle>
                  <CardDescription>Global settings affecting all users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Maintenance Mode</div>
                      <div className="text-sm text-zinc-500">Disable platform access for all non-admins.</div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Force Email Verification</div>
                      <div className="text-sm text-zinc-500">Require email check before login.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Instructor Approval Required</div>
                      <div className="text-sm text-zinc-500">Manually approve new instructor signups.</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button variant="ghost">Discard</Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20">Save Configuration</Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Helper for Missing Icon import in Lucide
const Archive = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </svg>
)

export default AdminDashboard;
