import { Button } from "@/components/ui/button";
import { BookOpen, Video, Award, Clock, Users, TrendingUp, Loader2, Star, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import CourseCard from "@/components/CourseCard";
import FeatureCard from "@/components/FeatureCard";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  instructor: string; // The text column
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
            *,
            instructor_details:instructor_id(full_name, avatar_url)
          `)
          .eq('status', 'published')
          .limit(4);

        if (error) throw error;

        if (data) {
          setCourses(data as unknown as Course[]);
        }
      } catch (error) {
        console.error('Error fetching popular courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularCourses();
  }, []);

  const features = [
    {
      icon: Video,
      title: "Live Interactive Sessions",
      description: "Join real-time classes with video, chat, and collaborative tools",
    },
    {
      icon: Clock,
      title: "Flexible Time Slots",
      description: "Choose from multiple 4-hour slots that fit your schedule",
    },
    {
      icon: Award,
      title: "Instant Certificates",
      description: "Get auto-generated certificates immediately after completion",
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals with years of experience",
    },
    {
      icon: BookOpen,
      title: "Custom Doubt Sessions",
      description: "Book personalized 1-on-1 sessions for your specific queries",
    },
    {
      icon: TrendingUp,
      title: "Career-Focused Content",
      description: "Skills that matter in today's competitive job market",
    },
  ];



  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      <HeroSection />

      {/* Features Section - Glassmorphic Premium Vibe */}
      <section className="container mx-auto px-4 py-32 relative z-10">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent opacity-60 -z-10 pointer-events-none" />

        <div className="text-center mb-20 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-sm">
            Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent relative">
              SkillVerse
              <svg className="absolute w-full h-2 -bottom-1 left-0 text-primary opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>?
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Everything you need to master new skills in a <span className="font-semibold text-foreground">live, interactive environment</span> designed for your success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="h-full bg-background/50 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-soft hover:shadow-strong hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-indigo-100">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Courses Section - Refined Glassmorphism */}
      <section className="py-28 relative overflow-hidden bg-secondary/5">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 animate-fade-in gap-6">
            <div>
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4 border border-primary/20">
                Trending Now
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Popular Courses</h2>
              <p className="text-muted-foreground text-lg max-w-xl font-light">
                Top-rated live courses joined by thousands of learners this week.
              </p>
            </div>
            <Link to="/courses">
              <Button variant="outline" size="lg" className="hidden md:flex border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 rounded-xl px-6">
                View All Courses
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {courses.map((course, index) => (
                <div key={course.id} className="hover-lift" style={{ animationDelay: `${index * 0.15}s` }}>
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    duration={course.duration}
                    price={`₹${course.price}`}
                    instructor={course.instructor_details?.full_name || course.instructor || 'Instructor'}
                    image={course.image_url}
                    level={course.level}
                    students={course.students_count}
                    bookingType={course.booking_type}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link to="/courses">
              <Button variant="outline" size="lg" className="w-full rounded-xl">View All Courses</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal & Impactful */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-foreground -z-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 opacity-40 -z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay -z-10" />

        <div className="container mx-auto px-4 text-center relative z-10 text-white">
          <Quote className="h-12 w-12 text-primary/50 mx-auto mb-8 animate-float" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 animate-fade-in-up leading-tight tracking-tight">
            Ready to Unlock Your Potential?
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
            Share your expertise or master new skills. The platform for modern education is here.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Link to="/become-instructor">
              <Button size="lg" className="text-foreground text-lg px-10 py-7 h-auto shadow-glow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-2xl font-bold bg-white hover:bg-white/90 border-0">
                Become an Instructor
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="text-white border-2 border-white/20 hover:bg-white/10 hover:border-white text-lg px-10 py-7 h-auto transition-all duration-300 hover:-translate-y-1 rounded-2xl backdrop-blur-md bg-transparent">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
