import { Button } from "@/components/ui/button";
import { BookOpen, Video, Globe, Zap, CheckCircle, Smartphone, HelpCircle, Phone, ArrowRight, Award, Search, Star, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import CourseCard from "@/components/CourseCard";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
          .limit(8); // Increased limit as it's the main focus now

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

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 overflow-x-hidden font-sans">

      {/* 1. HERO SECTION (Student Focused) */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] -ml-20 -mb-20" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1599818824330-8dbd3abd18c3?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5 mix-blend-overlay" />
        </div>

        <div className="container mx-auto relative z-10 text-center max-w-5xl">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-muted-foreground text-sm font-medium mb-8 animate-fade-in-up">
            Skill Verse by Focsera
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Master New Skills.<br />
            Ignite Your Future.
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Access world-class courses and live sessions from top industry experts. <br className="hidden md:block" />
            <span className="text-white/80">Learn at your own pace, anytime, anywhere.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/courses">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-glow hover:scale-105 transition-all duration-300">
                Explore Courses
              </Button>
            </Link>
            <Link to="/become-instructor">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-white/10 hover:bg-white/5">
                Teach on SkillVerse
              </Button>
            </Link>
          </div>

          {/* Stats / Trust */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 border-t border-white/5 pt-10 text-center">
            <div>
              <div className="text-3xl font-bold">10k+</div>
              <div className="text-sm text-muted-foreground">Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-muted-foreground">Instructors</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.8/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1k+</div>
              <div className="text-sm text-muted-foreground">Courses</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRENDING COURSES */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <Zap className="h-5 w-5" />
                <span className="font-bold tracking-wider uppercase text-sm">Hot Right Now</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold">Trending Courses</h2>
            </div>
            <Link to="/courses" className="hidden md:block">
              <Button variant="outline" className="rounded-full">View All Courses <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p className="text-muted-foreground">Curating best courses for you...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-xl font-bold mb-2">No courses found right now.</p>
              <p className="text-muted-foreground">Be the first to publish one!</p>
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

          <div className="mt-12 text-center md:hidden">
            <Link to="/courses">
              <Button variant="outline" className="w-full rounded-full">View All Courses</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES/CATEGORIES PROMO */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20 blur-[150px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card p-12 rounded-[3rem] border border-white/20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay" />

            <h2 className="text-3xl md:text-5xl font-bold mb-6">Learn from the Best</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Join thousands of learners achieving their goals with real-world skills.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              {['Web Development', 'Design', 'Business', 'Marketing', 'Photography', 'Music'].map((cat) => (
                <div key={cat} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer">
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER SIMPLE */}
      <section className="py-12 border-t border-white/10 text-center">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-4">Skill Verse</h3>
          <p className="text-muted-foreground mb-8">Empowering the world to learn.</p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <Link to="#" className="hover:text-white">Privacy Policy</Link>
            <Link to="#" className="hover:text-white">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white">Contact Us</Link>
          </div>
          <p className="text-xs text-secondary mt-8">© 2026 SkillVerse. All rights reserved.</p>
        </div>
      </section>

    </div>
  );
};

export default Index;
