import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  BookOpen,
  Loader2,
  Video,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    activeSessions: 0,
    completedSessions: 0,
  });
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check if user has admin or instructor role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "instructor"])
        .maybeSingle();

      if (!roleData) {
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadDashboardData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/dashboard");
    }
  };

  const loadDashboardData = async () => {
    try {
      // Get total students
      const { count: studentCount } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "student");

      // Get total bookings (simulate payment data)
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*");

      // Calculate revenue (₹999 per booking as example)
      const revenue = (bookings?.length || 0) * 999;

      // Get active sessions
      const { data: activeSessions } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("status", "live");

      // Get completed sessions
      const { data: completedSessions } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("status", "ended");

      // Get recent enrollments
      const { data: recentBookings } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      // Manually fetch related data
      const enrichedBookings = await Promise.all(
        (recentBookings || []).map(async (booking) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", booking.user_id)
            .maybeSingle();

          const { data: course } = await supabase
            .from("courses")
            .select("title")
            .eq("id", booking.course_id)
            .maybeSingle();

          return {
            ...booking,
            profiles: profile,
            courses: course,
          };
        })
      );

      setStats({
        totalStudents: studentCount || 0,
        totalRevenue: revenue,
        activeSessions: activeSessions?.length || 0,
        completedSessions: completedSessions?.length || 0,
      });

      setRecentEnrollments(enrichedBookings || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform performance</p>
        </div>

        {/* Stats Cards with Glow Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300 border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stats.totalStudents}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enrolled learners
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300 border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ₹{stats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From bookings
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300 border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Sessions
              </CardTitle>
              <Video className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stats.activeSessions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently live
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300 border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stats.completedSessions}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Sessions finished
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Enrollments */}
          <Card className="hover:shadow-medium transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Enrollments
              </CardTitle>
              <CardDescription>Latest student bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEnrollments.length > 0 ? (
                  recentEnrollments.map((enrollment: any) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {enrollment.profiles?.full_name || "Unknown Student"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.courses?.title || "Course"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(enrollment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">₹999</p>
                        <p className="text-xs text-muted-foreground">{enrollment.status}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No enrollments yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="hover:shadow-medium transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Manage your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/admin")}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage User Roles
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/dashboard")}
              >
                <Video className="h-4 w-4 mr-2" />
                View All Sessions
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => navigate("/courses")}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
              
              <div className="pt-4 mt-4 border-t">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <p className="font-semibold text-sm">Platform Stats</p>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• {stats.totalStudents} active students</p>
                    <p>• {stats.activeSessions + stats.completedSessions} total sessions</p>
                    <p>• ₹{(stats.totalRevenue / (stats.totalStudents || 1)).toFixed(0)} avg per student</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
