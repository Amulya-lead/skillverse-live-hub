import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Plus, BookOpen, Users, DollarSign, Loader2, LayoutDashboard, Video, BarChart2, Settings, LogOut, ChevronRight, Play, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LiveSessionManager } from "@/components/LiveSessionManager";

interface Course {
    id: string;
    title: string;
    status: string;
    students_count: number;
    price: number;
    rating: number;
    booking_type: string;
}

const TeacherDashboard = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        checkUser();
    }, []);

    const [editForm, setEditForm] = useState({
        full_name: "",
        bio: "",
        avatar_url: ""
    });

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/auth");
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single() as { data: any };

            if (!profile || (profile.role !== "instructor" && profile.role !== "admin")) {
                toast({
                    title: "Access Denied",
                    description: "You need an instructor account to view this page.",
                    variant: "destructive"
                });
                navigate("/dashboard");
                return;
            }

            setProfile(profile);
            setEditForm({
                full_name: profile.full_name || "",
                bio: profile.bio || "",
                avatar_url: profile.avatar_url || ""
            });
            fetchCourses(user.id);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const updateProfile = async () => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: editForm.full_name,
                    bio: editForm.bio,
                    avatar_url: editForm.avatar_url
                })
                .eq("id", profile.id);

            if (error) throw error;

            toast({ title: "Profile Updated", description: "Your details have been saved." });
            checkUser(); // Refresh
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const fetchCourses = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("courses")
                .select(`
                    *,
                    enrollments (count)
                `)
                .eq("instructor_id", userId);

            if (error) throw error;

            // Map the data to include strict types and calculations
            const coursesWithStats = (data || []).map((course: any) => ({
                ...course,
                students_count: course.enrollments?.[0]?.count || 0
            }));

            setCourses(coursesWithStats);
        } catch (error: any) {
            toast({
                title: "Error fetching courses",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const menuItems = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "courses", label: "My Courses", icon: BookOpen },
        { id: "sessions", label: "Live Sessions", icon: Video },
        { id: "analytics", label: "Analytics", icon: BarChart2 },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Sidebar Navigation - Glassmorphic */}
            <aside className="w-full md:w-72 bg-gradient-to-b from-background to-background/50 border-r border-white/10 flex flex-col relative z-20">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                            <span className="font-bold text-white text-xl">SV</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">SkillVerse</span>
                    </div>

                    <div className="flex items-center gap-3 p-4 glass-card rounded-2xl mb-8 border border-white/10">
                        <Avatar className="h-10 w-10 border border-primary/20">
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary">{profile?.full_name?.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{profile?.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">Instructor</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-card border-white/10">
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                    <LogOut className="h-4 w-4 mr-2" /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    }`}
                            >
                                {activeTab === item.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                )}
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                                {activeTab === item.id && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </button>
                    <p className="text-xs text-center mt-4 text-muted-foreground/50">v2.0.1 • SkillVerse Inc.</p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative h-screen">
                {/* Background Ambience */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-10 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">

                    {/* Dynamic Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 animate-fade-in-up">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{
                                menuItems.find(i => i.id === activeTab)?.label
                            }</h1>
                            <p className="text-muted-foreground mt-1">Manage your education empire from one place.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button size="lg" variant="outline" className="glass-button hidden md:flex">
                                <Video className="mr-2 h-4 w-4" /> Go Live
                            </Button>
                            <Link to="/create-course">
                                <Button size="lg" className="shadow-lg hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 bg-gradient-primary border-0" >
                                    <Plus className="mr-2 h-5 w-5" /> New Course
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/20 transition-colors" />
                                    <div className="relative">
                                        <div className="p-3 bg-primary/10 w-fit rounded-xl text-primary mb-4">
                                            <DollarSign className="h-6 w-6" />
                                        </div>
                                        <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium mb-1">Total Earnings</div>
                                        <div className="text-3xl font-black">
                                            ₹{courses.reduce((acc, curr) => acc + (curr.price * (curr.students_count || 0)), 0).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-success mt-2 flex items-center gap-1">
                                            <span className="bg-success/20 px-1.5 rounded text-success">100%</span> Commission Free
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-accent/20 transition-colors" />
                                    <div className="relative">
                                        <div className="p-3 bg-accent/10 w-fit rounded-xl text-accent mb-4">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium mb-1">Total Students</div>
                                        <div className="text-3xl font-black">{courses.reduce((acc, curr) => acc + (curr.students_count || 0), 0)}</div>
                                        <div className="text-xs text-muted-foreground mt-2">Across {courses.length} courses</div>
                                    </div>
                                </div>
                                <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                                    <div className="relative">
                                        <div className="p-3 bg-blue-500/10 w-fit rounded-xl text-blue-500 mb-4">
                                            <Video className="h-6 w-6" />
                                        </div>
                                        <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium mb-1">Live Sessions</div>
                                        <div className="text-3xl font-black">{courses.filter(c => c.booking_type === 'slot_based').length}</div>
                                        <div className="text-xs text-muted-foreground mt-2">Active Live Courses</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Courses Section */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Your Latest Courses</h2>
                                    <Button variant="link" onClick={() => setActiveTab('courses')} className="text-primary">View All</Button>
                                </div>

                                {courses.length === 0 ? (
                                    <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-white/10">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Plus className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Create your first course</h3>
                                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start your teaching journey by creating engaging content for students worldwide.</p>
                                        <Link to="/create-course">
                                            <Button variant="default" size="lg" className="shadow-glow">Get Started</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {courses.slice(0, 3).map((course, i) => (
                                            <div key={course.id} className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 hover:bg-white/5 transition-colors group">
                                                <div className="w-full sm:w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-colors">
                                                    <span className="font-bold text-lg text-muted-foreground">{course.title.substring(0, 1)}</span>
                                                </div>
                                                <div className="flex-1 text-center sm:text-left">
                                                    <h3 className="font-bold text-lg">{course.title}</h3>
                                                    <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground mt-1">
                                                        <span>₹{course.price}</span>
                                                        <span>•</span>
                                                        <span>{course.students_count || 0} students</span>
                                                        <span>•</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs border ${course.status === 'published' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                            }`}>
                                                            {course.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                                                    <ChevronRight className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* MY COURSES TAB */}
                    {activeTab === 'courses' && (
                        <div className="animate-slide-in-right">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courses.map((course) => (
                                    <div key={course.id} className="glass-card overflow-hidden rounded-3xl group hover:-translate-y-1 transition-all duration-300">
                                        <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-800 relative">
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                            <Badge className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border-white/10 text-white">
                                                {course.status}
                                            </Badge>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-xl font-bold line-clamp-1">{course.title}</h3>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-muted-foreground mb-6">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" /> {course.students_count || 0} Students
                                                </div>
                                                <div className="font-bold text-primary">₹{course.price}</div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button className="flex-1 bg-white/5 hover:bg-white/10">Edit</Button>
                                                <Button className="flex-1 bg-white/5 hover:bg-white/10">Content</Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {courses.length === 0 && (
                                    <div className="col-span-full text-center py-20">
                                        <p className="text-muted-foreground mb-4">No courses found.</p>
                                        <Link to="/create-course">
                                            <Button>Create One Now</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* LIVE SESSIONS TAB */}
                    {activeTab === 'sessions' && (
                        <div className="animate-fade-in">
                            <LiveSessionManager userId={profile?.id} />
                        </div>
                    )}

                    {/* SETTINGS TAB - Editable Profile */}
                    {activeTab === 'settings' && (
                        <div className="glass-card p-8 rounded-3xl animate-fade-in max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold mb-6">Instructor Profile Settings</h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                        value={editForm.full_name}
                                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Bio (Your Teacher Persona)</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-h-[120px] focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        placeholder="Tell your students about yourself..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Avatar URL</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                            value={editForm.avatar_url}
                                            onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                                            placeholder="https://..."
                                        />
                                        <Avatar className="h-12 w-12 border border-white/20">
                                            <AvatarImage src={editForm.avatar_url} />
                                            <AvatarFallback>PV</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10 flex justify-end">
                                    <Button size="lg" className="shadow-glow" onClick={updateProfile}>
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
            {children}
        </span>
    );
}

