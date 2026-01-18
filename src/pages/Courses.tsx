import { Navbar } from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Filter, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  instructor: string;
  image_url: string;
  level: string;
  students_count: number;
  booking_type?: string;
}

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*');

        if (error) throw error;

        if (data) {
          setCourses(data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [toast]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 font-sans">
      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-soft-light"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 animate-fade-in-up tracking-tight leading-tight">
              Explore Our <span className="text-gradient">Premium Courses</span>
            </h1>
            <p className="text-muted-foreground text-xl mb-10 animate-fade-in font-light leading-relaxed" style={{ animationDelay: '0.1s' }}>
              Unlock your potential with expert-led live sessions and comprehensive curriculum designed for modern professionals.
            </p>

            <div className="relative max-w-2xl mx-auto group animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-xl rounded-full transition-opacity duration-500 group-hover:opacity-30" />
              <div className="relative glass-card rounded-full flex items-center p-2 shadow-strong transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
                <Search className="ml-4 h-6 w-6 text-muted-foreground" />
                <Input
                  placeholder="Search for courses (e.g. Python, Design, Marketing)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 text-lg h-12 placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
            {levels.map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                onClick={() => setSelectedLevel(level)}
                className={`rounded-full px-6 transition-all duration-300 ${selectedLevel === level ? 'shadow-glow bg-primary hover:bg-primary/90' : 'hover:border-primary/50 hover:bg-secondary'}`}
              >
                {level}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Showing {filteredCourses.length} courses</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-primary/20 animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-muted-foreground animate-pulse font-medium">Curating best courses for you...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCourses.map((course, index) => (
                <div key={course.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in-up hover-lift">
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    duration={course.duration}
                    price={`₹${course.price}`}
                    instructor={course.instructor}
                    image={course.image_url}
                    level={course.level}
                    students={course.students_count}
                    bookingType={course.booking_type}
                  />
                </div>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-32 animate-fade-in">
                <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Filter className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No courses found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We couldn't find any courses matching your search. Try adjusting your filters or search terms.
                </p>
                <Button
                  variant="link"
                  onClick={() => { setSearchQuery(""); setSelectedLevel("All"); }}
                  className="mt-4 text-primary"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
