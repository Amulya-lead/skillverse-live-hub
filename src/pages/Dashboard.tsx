import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Video, Download, Calendar, Clock, Award } from "lucide-react";

const Dashboard = () => {
  const upcomingSessions = [
    {
      id: "1",
      course: "4 Hours of OOPS in Java",
      instructor: "Rahul Sharma",
      date: "Monday, Nov 11",
      time: "10:00 AM - 2:00 PM",
      status: "upcoming",
      sessionLink: "/session/oops-java-1",
    },
    {
      id: "2",
      course: "2 Hours of Photoshop Basics",
      instructor: "Priya Desai",
      date: "Wednesday, Nov 13",
      time: "3:00 PM - 5:00 PM",
      status: "upcoming",
      sessionLink: "/session/photoshop-1",
    },
  ];

  const completedSessions = [
    {
      id: "3",
      course: "5 Hours of Modern Web Dev",
      instructor: "Amit Patel",
      completedDate: "Nov 5, 2024",
      certificateId: "CERT-2024-1105",
    },
  ];

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
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingSessions.map((session, index) => (
                  <Card key={session.id} className="group hover:shadow-strong transition-all duration-500 hover:-translate-y-2 border-2 hover:border-primary/30 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors duration-300">{session.course}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            by {session.instructor}
                          </p>
                        </div>
                        <Badge className="bg-success text-success-foreground shadow-soft animate-pulse">Confirmed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          {session.date}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          {session.time}
                        </div>
                      </div>
                      
                      <Link to={session.sessionLink}>
                        <Button className="w-full group-hover:shadow-glow transition-all duration-300" variant="gradient">
                          <Video className="mr-2 h-4 w-4" />
                          Join Session
                        </Button>
                      </Link>
                      
                      <p className="text-xs text-muted-foreground text-center">
                        Session link will be active 10 minutes before start time
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Past Sessions */}
            <div>
              <h2 className="text-2xl font-bold mb-4 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>Completed Sessions</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {completedSessions.map((session, index) => (
                  <Card key={session.id} className="hover:shadow-medium transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg mb-2">{session.course}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            by {session.instructor}
                          </p>
                        </div>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        Completed on {session.completedDate}
                      </div>
                      
                      <Button variant="outline" className="w-full hover:border-primary hover:bg-primary/5 transition-all duration-300">
                        <Download className="mr-2 h-4 w-4" />
                        View Recording
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold mb-4 animate-slide-in-left">My Certificates</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedSessions.map((session, index) => (
                  <Card key={session.id} className="group hover:shadow-strong transition-all duration-500 hover:-translate-y-2 border-2 hover:border-accent/30 overflow-hidden animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-accent opacity-5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    
                    <CardContent className="p-6 relative">
                      <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mb-4 mx-auto shadow-soft group-hover:shadow-glow group-hover:scale-110 transition-all duration-500">
                        <Award className="h-8 w-8 text-accent-foreground" />
                      </div>
                      
                      <h3 className="font-bold text-center mb-2 group-hover:text-accent transition-colors duration-300">{session.course}</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Issued on {session.completedDate}
                      </p>
                      
                      <div className="space-y-2">
                        <Button variant="gradient" className="w-full shadow-medium hover:shadow-strong" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download Certificate
                        </Button>
                        <Button variant="outline" className="w-full hover:border-accent hover:text-accent transition-all duration-300" size="sm">
                          Share on LinkedIn
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground text-center mt-3">
                        ID: {session.certificateId}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
