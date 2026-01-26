import { Button } from "@/components/ui/button";
import { Search, Zap, CheckCircle, Smartphone, Globe, ArrowRight, PlayCircle, Star, Video } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CourseCard from "@/components/CourseCard";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  instructor: string;
  instructor_details?: {
    full_name: string;
    avatar_url: string;
  };
  image_url: string;
  level: string;
  students_count: number;
  booking_type?: string;
}

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            instructor_details:instructor_id(full_name, avatar_url)
          `)
          .eq('status', 'published')
          .limit(8);

        if (error) throw error;
        if (data) setCourses(data as unknown as Course[]);
      } catch (error) {
        console.error('Error fetching popular courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopularCourses();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${searchQuery}`);
    }
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 overflow-x-hidden font-sans">

      {/* 1. HERO SECTION (Matched to Design) */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          {/* Pill Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-bold mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Hub of Skills Under One Roof 🚀
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Master Skills Through <br />
            <span className="relative inline-block text-blue-600 dark:text-blue-400">
              Live Interactive
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 dark:text-blue-900 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span> <br />
            Learning
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Transform your career with <strong className="text-foreground">live sessions</strong> led by industry experts.
            Real-time interaction, instant doubt solving, and certified mastery.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                type="text"
                placeholder="What do you want to learn today? (e.g., React, Photography)"
                className="h-14 pl-12 pr-32 rounded-full border-2 border-border/50 bg-background/50 backdrop-blur-xl focus:border-primary/50 text-base shadow-lg hover:shadow-xl transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="absolute right-1.5 top-1.5 h-11 px-6 rounded-full font-bold shadow-md bg-blue-600 hover:bg-blue-700 text-white">
                Search
              </Button>
            </form>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/courses">
              <Button size="lg" className="h-12 px-8 text-base font-bold rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 text-white hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all">
                Explore Courses
              </Button>
            </Link>
            <Link to="/request-session">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base font-bold rounded-full border-2 hover:bg-secondary/50">
                Request a Session
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS BANNER */}
      <div className="container mx-auto px-4 -mt-8 mb-20 relative z-20">
        <div className="glass-card p-8 rounded-3xl border border-white/20 shadow-xl bg-white/80 dark:bg-black/40 backdrop-blur-md max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
            <div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400">50+</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Active Courses</div>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400">10k+</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Students Enrolled</div>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400">100+</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Expert Mentors</div>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400">4.9</div>
              <div className="text-sm font-medium text-muted-foreground mt-1">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TRENDING COURSES (Kept for content) */}
      <section className="py-20 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Live Sessions</h2>
              <p className="text-muted-foreground">Join upcoming live interactive classes</p>
            </div>
            <Link to="/courses" className="hidden md:block">
              <Button variant="ghost" className="text-primary hover:text-primary/80 group">
                View All <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-80 bg-muted/20 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  duration={course.duration}
                  price={`₹${course.price}`}
                  instructor={course.instructor_details?.full_name || course.instructor}
                  image={course.image_url}
                  level={course.level}
                  students={course.students_count}
                  bookingType={course.booking_type}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. VALUE PROPS (Minimal) */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-block p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/20 text-blue-600">
                <Video className="h-8 w-8" />
              </div>
              <h2 className="text-4xl font-bold leading-tight">
                Why Learners Love <br />
                <span className="text-blue-600">Live Sessions?</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Recorded videos are great, but live interaction changes the game.
                Get your questions answered immediately and network with peers.
              </p>

              <div className="space-y-4">
                {[
                  "Real-time Doubt Clearing",
                  "Interactive Projects & Reviews",
                  "Networking with Cohort",
                  "Structured Schedule & Discipline"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/10 rounded-full blur-[100px] -z-10" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 rotate-2 hover:rotate-0 transition-transform duration-500">
                <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b955?auto=format&fit=crop&q=80" alt="Live Learning" className="w-full h-full object-cover" />

                {/* Floating Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      98%
                    </div>
                    <div>
                      <div className="font-bold">Completion Rate</div>
                      <div className="text-xs text-muted-foreground">For Live Cohort Courses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-12 border-t border-border/50 bg-secondary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="text-xl font-bold">SkillVerse</span>
          </div>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            The ultimate platform for live interactive learning.
            Join the revolution today.
          </p>
          <div className="flex justify-center gap-6 text-sm font-medium mb-8">
            <Link to="/courses" className="hover:text-blue-600 transition-colors">Courses</Link>
            <Link to="/become-instructor" className="hover:text-blue-600 transition-colors">Become Instructor</Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-muted-foreground/50">© 2026 SkillVerse by Focsera. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
