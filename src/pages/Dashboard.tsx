import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Video, Download, Calendar, Clock, Award, Loader2, User, Mail, LogOut, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Session {
  id: string;
  title: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string | null;
  instructor_name?: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string | null;
}

interface EnrolledCourse {
  id: string; // Enrollment ID
  course_id: string;
  status: string;
  enrolled_at: string;
  course: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    instructor: string;
    booking_type: string;
  };
}

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const defaultTab = searchParams.get('tab') || 'sessions';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch sessions the user has participated in
        const { data: participantData } = await supabase
          .from('session_participants')
          .select('session_id')
          .eq('user_id', user.id);

        const sessionIds = participantData?.map(p => p.session_id) || [];

        if (sessionIds.length > 0) {
          const { data: mySessions } = await supabase
            .from('live_sessions')
            .select(`
                *,
                instructor:instructor_id(full_name)
            `)
            .in('id', sessionIds) as { data: any };

          if (mySessions) {
            const formattedSessions = mySessions.map(s => ({
              ...s,
              instructor_name: s.instructor?.full_name || 'Instructor'
            }));
            setUpcomingSessions(formattedSessions.filter(s => s.status === 'scheduled' || s.status === 'live'));
            setCompletedSessions(formattedSessions.filter(s => s.status === 'ended'));
          }
        } else {
          setUpcomingSessions([]);
          setCompletedSessions([]);
        }

        // Fetch Enrolled Courses
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select(`
            id,
            course_id,
            status,
            enrolled_at,
            course:course_id (
              id,
              title,
              description,
              image_url,
              instructor,
              booking_type
            )
          `)
          .eq('user_id', user.id);

        if (enrollmentsData) {
          setEnrolledCourses(enrollmentsData as unknown as EnrolledCourse[]);
        }


      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatSessionTime = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  const formatSessionDate = (start: string) => {
    return format(new Date(start), 'EEEE, MMM d');
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

  const handleDownloadProfile = () => {
    if (!profile) return;

    const profileData = `
╔══════════════════════════════════════════╗
║           SKILLVERSE PROFILE             ║
╠══════════════════════════════════════════╣
║  Name: ${profile.full_name || 'Not set'}
║  Email: ${profile.email || 'Not set'}
║  Member Since: ${profile.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : 'Unknown'}
╚══════════════════════════════════════════╝
    `;

    const blob = new Blob([profileData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillverse-profile-${profile.full_name?.replace(/\s+/g, '-').toLowerCase() || 'user'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Profile Downloaded! 📄",
      description: "Your profile has been saved to your device.",
    });
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return profile?.email?.[0]?.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-success/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      {/* Header */}
      <div className="bg-background/60 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2 bg-gradient-primary rounded-lg shadow-glow">
                <Sparkles className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-primary">My Dashboard</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Welcome back, {profile?.full_name?.split(' ')[0] || 'Learner'}!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/courses">
                <Button variant="outline" size="sm" className="hidden sm:flex border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                  Browse Courses
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">

        {/* Learning Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
          <Card className="glass-card border-l-4 border-l-primary p-4 hover:-translate-y-1 transition-transform">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{upcomingSessions.length}</h3>
                <p className="text-xs text-muted-foreground font-medium">Upcoming Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-l-4 border-l-success p-4 hover:-translate-y-1 transition-transform" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-full text-success">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{completedSessions.length}</h3>
                <p className="text-xs text-muted-foreground font-medium">Completed Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-l-4 border-l-accent p-4 hover:-translate-y-1 transition-transform" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-full text-accent">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{enrolledCourses.length}</h3>
                <p className="text-xs text-muted-foreground font-medium">Active Courses</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card border-l-4 border-l-destructive p-4 hover:-translate-y-1 transition-transform" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">0h</h3>
                <p className="text-xs text-muted-foreground font-medium">Learning Time</p>
              </div>
            </div>
          </Card>
        </div>
        <Tabs defaultValue={defaultTab} className="space-y-8">
          <TabsList className="animate-slide-in-left bg-background/80 backdrop-blur-sm shadow-medium p-1">
            <TabsTrigger value="sessions" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300">
              My Sessions
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300">
              My Courses
            </TabsTrigger>
            <TabsTrigger value="certificates" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300">
              Certificates
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground transition-all duration-300">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-6 animate-fade-in">
            {/* Upcoming Sessions */}
            <div>
              <h2 className="text-2xl font-bold mb-4 animate-slide-in-left flex items-center gap-2">
                <Video className="h-6 w-6 text-primary" />
                Upcoming Sessions
              </h2>
              {upcomingSessions.length === 0 ? (
                <Card className="p-8 text-center border-2 border-dashed hover:border-primary/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">No upcoming sessions. Browse courses to book a session!</p>
                  <Link to="/courses">
                    <Button variant="gradient" className="shadow-medium hover:shadow-glow">Browse Courses</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {upcomingSessions.map((session, index) => (
                    <Card key={session.id} className="glass-card group hover:shadow-strong transition-all duration-500 hover:-translate-y-2 border-0 overflow-hidden relative" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors duration-300">{session.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              by {session.instructor_name}
                            </p>
                          </div>
                          <Badge className={session.status === 'live' ? "bg-destructive text-destructive-foreground animate-pulse shadow-glow" : "bg-success text-success-foreground shadow-soft"}>
                            {session.status === 'live' ? '🔴 Live Now' : '✓ Confirmed'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground bg-primary/5 px-3 py-1 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                            {formatSessionDate(session.scheduled_start)}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground bg-primary/5 px-3 py-1 rounded-full">
                            <Clock className="h-4 w-4 text-primary" />
                            {formatSessionTime(session.scheduled_start, session.scheduled_end)}
                          </div>
                        </div>

                        <Link to={`/session/${session.id}`}>
                          <Button className="w-full group-hover:shadow-glow transition-all duration-300" variant="gradient">
                            <Video className="mr-2 h-4 w-4" />
                            {session.status === 'live' ? 'Join Now' : 'Join Session'}
                          </Button>
                        </Link>

                        <p className="text-xs text-muted-foreground text-center">
                          Session link will be active 10 minutes before start time
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Past Sessions */}
            <div>
              <h2 className="text-2xl font-bold mb-4 animate-slide-in-left flex items-center gap-2" style={{ animationDelay: '0.2s' }}>
                <Award className="h-6 w-6 text-accent" />
                Completed Sessions
              </h2>
              {completedSessions.length === 0 ? (
                <Card className="p-8 text-center border-2 border-dashed">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-accent" />
                  </div>
                  <p className="text-muted-foreground">No completed sessions yet. Join a session to get started!</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {completedSessions.map((session, index) => (
                    <Card key={session.id} className="glass-card hover:shadow-medium transition-all duration-300 border-0" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-2">{session.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              by {session.instructor_name}
                            </p>
                          </div>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Completed on {formatSessionDate(session.scheduled_end)}
                        </div>

                        <Button variant="outline" className="w-full hover:border-primary hover:bg-primary/5 transition-all duration-300">
                          <Download className="mr-2 h-4 w-4" />
                          View Recording
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="courses" className="animate-fade-in space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4 animate-slide-in-left flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                My Courses
              </h2>
              {enrolledCourses.length === 0 ? (
                <Card className="p-8 text-center border-2 border-dashed hover:border-primary/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
                  <Link to="/courses">
                    <Button variant="gradient" className="shadow-medium hover:shadow-glow">Browse Courses</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {enrolledCourses.map((enrollment, index) => (
                    <Card key={enrollment.id} className="glass-card group hover:shadow-strong transition-all duration-500 hover:-translate-y-2 border-0 overflow-hidden relative" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors duration-300">{enrollment.course.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">by {enrollment.course.instructor}</p>
                          </div>
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {enrollment.course.booking_type === 'slot_based' ? 'Live Sessions' : 'Recorded Course'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">{enrollment.course.description}</p>
                        <Link to={`/course/${enrollment.course.id}/learn`}>
                          <Button className="w-full mb-2 group-hover:shadow-glow transition-all duration-300" variant="gradient">
                            <Video className="mr-2 h-4 w-4" />
                            Continue Learning
                          </Button>
                        </Link>
                        <Link to={`/course/${enrollment.course.id}`}>
                          <Button className="w-full hover:bg-white/10" variant="ghost">
                            View Details
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-4 animate-slide-in-left flex items-center gap-2">
                <Award className="h-6 w-6 text-accent" />
                My Certificates
              </h2>
              <Card className="p-12 text-center border-2 border-dashed hover:border-accent/30 transition-all duration-300">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
                  <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center mb-4 mx-auto shadow-strong relative">
                    <Award className="h-10 w-10 text-accent-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
                <p className="text-muted-foreground mb-6">Complete sessions to earn certificates and showcase your skills!</p>
                <Link to="/courses">
                  <Button variant="gradient" className="shadow-medium hover:shadow-glow">Start Learning</Button>
                </Link>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-4 animate-slide-in-left flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                My Profile
              </h2>
              <Card className="glass-card overflow-hidden border-0 hover:shadow-glow transition-all duration-300">
                {/* Profile Header with Gradient */}
                <div className="h-32 bg-gradient-primary relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
                  <Sparkles className="absolute top-4 right-4 h-6 w-6 text-white/50 animate-pulse" />
                </div>

                {/* Avatar */}
                <div className="relative -mt-16 px-6">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-strong">
                    <AvatarFallback className="bg-gradient-primary text-primary-foreground text-4xl font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <CardContent className="pt-4 pb-8 px-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold">{profile?.full_name || 'User'}</h3>
                      <p className="text-muted-foreground">SkillVerse Member</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium">{profile?.full_name || 'Not set'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{profile?.email || 'Not set'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-accent/5 rounded-xl">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Member Since</p>
                          <p className="font-medium">{profile?.created_at ? format(new Date(profile.created_at), 'MMMM d, yyyy') : 'Unknown'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-success/5 rounded-xl">
                        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                          <Award className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Certificates</p>
                          <p className="font-medium">0 earned</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="gradient" onClick={handleDownloadProfile} className="flex-1 shadow-medium hover:shadow-glow">
                        <Download className="mr-2 h-4 w-4" />
                        Download Profile
                      </Button>
                      <Button variant="outline" onClick={handleLogout} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
