import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Video, Download, Calendar, Clock, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Session {
  id: string;
  title: string;
  scheduled_start: string;
  scheduled_end: string;
  status: string | null;
  instructor_name?: string;
}

const Dashboard = () => {
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch sessions the user has participated in or upcoming scheduled sessions
        const { data: participantData } = await supabase
          .from('session_participants')
          .select('session_id')
          .eq('user_id', user.id);

        const sessionIds = participantData?.map(p => p.session_id) || [];

        // Fetch all scheduled/live sessions (visible to all users)
        const { data: allSessions } = await supabase
          .from('live_sessions')
          .select('*')
          .in('status', ['scheduled', 'live']);

        if (allSessions) {
          // Get instructor profiles
          const instructorIds = [...new Set(allSessions.map(s => s.instructor_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', instructorIds);

          const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

          const sessionsWithInstructor = allSessions.map(s => ({
            ...s,
            instructor_name: profileMap.get(s.instructor_id) || 'Instructor'
          }));

          setUpcomingSessions(sessionsWithInstructor.filter(s => s.status === 'scheduled' || s.status === 'live'));
        }

        // For completed sessions, we'd need a different query - using mock data for now
        setCompletedSessions([]);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const formatSessionTime = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`;
  };

  const formatSessionDate = (start: string) => {
    return format(new Date(start), 'EEEE, MMM d');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">My Dashboard</h1>
            <Link to="/">
              <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="sessions" className="space-y-8">
          <TabsList className="animate-slide-in-left">
            <TabsTrigger value="sessions" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">My Sessions</TabsTrigger>
            <TabsTrigger value="certificates" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-6 animate-fade-in">
            {/* Upcoming Sessions */}
            <div>
              <h2 className="text-2xl font-bold mb-4 animate-slide-in-left">Upcoming Sessions</h2>
              {upcomingSessions.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No upcoming sessions. Browse courses to book a session!</p>
                  <Link to="/courses">
                    <Button variant="gradient" className="mt-4">Browse Courses</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {upcomingSessions.map((session, index) => (
                    <Card key={session.id} className="group hover:shadow-strong transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors duration-300">{session.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              by {session.instructor_name}
                            </p>
                          </div>
                          <Badge className={session.status === 'live' ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-success text-success-foreground shadow-soft"}>
                            {session.status === 'live' ? 'Live Now' : 'Confirmed'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 text-primary" />
                            {formatSessionDate(session.scheduled_start)}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
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
              <h2 className="text-2xl font-bold mb-4 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>Completed Sessions</h2>
              {completedSessions.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No completed sessions yet.</p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {completedSessions.map((session, index) => (
                    <Card key={session.id} className="hover:shadow-medium transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
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

          <TabsContent value="certificates" className="animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-4 animate-slide-in-left">My Certificates</h2>
              <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mb-4 mx-auto shadow-soft">
                  <Award className="h-8 w-8 text-accent-foreground" />
                </div>
                <p className="text-muted-foreground">Complete sessions to earn certificates!</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
